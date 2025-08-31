// server/src/routes/teams.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";
import { z } from "zod";
import { updateProjectLifecycle } from "../utils/projectLifecycle";

export const teams = Router();

/* ------------------------- Schemas ------------------------- */
const CreateTeam = z.object({
  name: z.string().min(2),
  projectId: z.string().cuid(),
});

const InviteBody = z.object({
  email: z.string().email(),
});

/* ------------------------- Helpers ------------------------- */
async function ensureCanManageTeam(userId: string, role: string, teamId: string) {
  if (role === "ADMIN" || role === "TEACHER") return true;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { leaderId: true },
  });
  if (!team) throw new Error("NOT_FOUND");
  if (team.leaderId !== userId) throw new Error("FORBIDDEN");
  return true;
}
/* ------------------------- Create team ------------------------- */
teams.post("/", requireRole("STUDENT", "ADMIN", "TEACHER"), async (req: any, res) => {
  const parsed = CreateTeam.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { name, projectId } = parsed.data;

  // Need courseId for enrollment/SP checks
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      courseId: true,
      createdById: true,
      team: { select: { id: true } },
    },
  });
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (project.team) return res.status(409).json({ error: "Team already exists for this project" });

  const leaderId = req.auth.userId;

  // ✅ New permission model:
  // Students can form a team if they are assigned this project (StudentProject row)
  // OR they are enrolled in the course (we’ll create the StudentProject row on the fly).
  if (req.auth.role === "STUDENT") {
    // Do they already have a StudentProject row?
    let sp = await prisma.studentProject.findUnique({
      where: { studentId_projectId: { studentId: leaderId, projectId } },
      select: { studentId: true, status: true },
    });

    if (!sp) {
      // If not, ensure they are enrolled in the course of this project
      const enrolled = await prisma.enrollment.findUnique({
        where: { courseId_studentId: { courseId: project.courseId, studentId: leaderId } },
        select: { id: true },
      });
      if (!enrolled) {
        return res
          .status(403)
          .json({ error: "You must be enrolled in this course to form a team" });
      }

      // Seed a NEW StudentProject row for this student/topic
      sp = await prisma.studentProject.create({
        data: { studentId: leaderId, projectId, status: "NEW" },
        select: { studentId: true, status: true },
      });
    }
  }

  // Create the team (leader is auto-member)
  const created = await prisma.team.create({
    data: {
      name,
      projectId,
      leaderId,
      members: { create: [{ userId: leaderId, role: "Leader" }] },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
      project: { select: { id: true, title: true } },
    },
  });

  // Mark the leader's per-student lifecycle ACTIVE immediately
  await prisma.studentProject.upsert({
    where: { studentId_projectId: { studentId: leaderId, projectId } },
    update: { status: "ACTIVE" },
    create: { studentId: leaderId, projectId, status: "ACTIVE" },
  });

  // Keep global/per-student lifecycle consistent (others flip to ACTIVE when they join)
  await updateProjectLifecycle(projectId);

  res.status(201).json(created);
});

/* ------------------------- Invite by email ------------------------- */
teams.post("/:id/invite", requireRole("STUDENT", "ADMIN", "TEACHER"), async (req: any, res) => {
  const teamId = req.params.id;
  const body = InviteBody.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error);
  const { email } = body.data;

  try {
    await ensureCanManageTeam(req.auth.userId, req.auth.role, teamId);
  } catch (e: any) {
    if (e.message === "NOT_FOUND") return res.status(404).json({ error: "Team not found" });
    if (e.message === "FORBIDDEN") return res.status(403).json({ error: "Only team leader or staff can invite" });
    throw e;
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    const alreadyMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: user.id } },
    });
    if (alreadyMember) return res.status(409).json({ error: "User is already a team member" });
  }

  const pending = await prisma.invitation.findFirst({
    where: { teamId, email, status: "PENDING" },
  });
  if (pending) return res.status(200).json(pending);

  const inv = await prisma.invitation.create({
    data: { teamId, email, invitedById: req.auth.userId, status: "PENDING" },
  });
  res.status(201).json(inv);
});

/* ------------------------- Accept/Decline invite ------------------------- */
teams.put("/invitations/:invId/accept", requireRole("STUDENT", "ADMIN", "TEACHER"), async (req: any, res) => {
  const invId = req.params.invId;
  const invitation = await prisma.invitation.findUnique({
    where: { id: invId },
    include: { team: true },
  });
  if (!invitation) return res.status(404).json({ error: "Invitation not found" });
  if (invitation.status !== "PENDING") return res.status(409).json({ error: "Invitation is not pending" });

  const me = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { id: true, email: true } });
  if (!me || me.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return res.status(403).json({ error: "This invitation is not for your email" });
  }

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: invitation.teamId, userId: me.id } },
  });
  if (!existing) {
    await prisma.teamMember.create({ data: { teamId: invitation.teamId, userId: me.id, role: "Member" } });
  }

  await prisma.invitation.update({ where: { id: invId }, data: { status: "ACCEPTED", respondedAt: new Date() } });

  // Membership changed; lifecycle could remain ACTIVE, but keep it consistent
  await updateProjectLifecycle(invitation.team.projectId);

  res.json({ ok: true });
});

teams.put("/invitations/:invId/decline", requireRole("STUDENT", "ADMIN", "TEACHER"), async (req: any, res) => {
  const invId = req.params.invId;
  const invitation = await prisma.invitation.findUnique({ where: { id: invId } });
  if (!invitation) return res.status(404).json({ error: "Invitation not found" });
  if (invitation.status !== "PENDING") return res.status(409).json({ error: "Invitation is not pending" });

  const me = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { email: true } });
  if (!me || me.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return res.status(403).json({ error: "This invitation is not for your email" });
  }

  await prisma.invitation.update({ where: { id: invId }, data: { status: "DECLINED", respondedAt: new Date() } });
  res.json({ ok: true });
});

/* ------------------------- Remove member ------------------------- */
teams.delete("/:id/members/:userId", requireRole("TEACHER", "ADMIN", "STUDENT"), async (req: any, res) => {
  const { id: teamId, userId } = req.params;

  if (req.auth.role === "STUDENT") {
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { leaderId: true } });
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (team.leaderId !== req.auth.userId) return res.status(403).json({ error: "Only leader can remove members" });
    if (userId === team.leaderId) return res.status(400).json({ error: "Leader cannot remove themselves" });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { projectId: true } });
  await prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });

  if (team) await updateProjectLifecycle(team.projectId);

  res.json({ ok: true });
});

/* ------------------------- Reads for UI ------------------------- */
teams.get("/mine", requireRole("STUDENT", "TEACHER", "ADMIN"), async (req: any, res) => {
  const uid = req.auth.userId;
  const list = await prisma.team.findMany({
    where: { members: { some: { userId: uid } } },
    include: {
      project: { select: { id: true, title: true, status: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

teams.get("/invitations", requireRole("STUDENT", "TEACHER", "ADMIN"), async (req: any, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { email: true } });
  const status = (req.query.status as string | undefined)?.toUpperCase() || "PENDING";
  const list = await prisma.invitation.findMany({
    where: { email: me!.email, status },
    include: { team: { include: { project: true } }, invitedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});