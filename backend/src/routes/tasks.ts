







// server/src/routes/tasks.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole, authOptional } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { updateProjectLifecycle } from "../utils/projectLifecycle";

const tasks = Router();

// allow req.auth on GETs too
tasks.use(authOptional);

/* ------------------------ uploads setup ------------------------ */
const uploadsDir = path.join("/tmp", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

/* ------------------------ helpers ------------------------ */
function toPublicFiles(files: Express.Multer.File[] | undefined) {
  return (files ?? []).map((f) => ({
    originalName: f.originalname,
    filename: f.filename,
    mime: f.mimetype,
    size: f.size,
    url: `/uploads/${f.filename}`, // ensure server serves /uploads statically
  }));
}

/* =====================================================================
   GET /api/tasks/teacher-submissions
   All SUBMITTED/COMPLETED tasks for courses this teacher owns.
   Optional filters: courseId, projectId, q (student name or email)
   ===================================================================== */






// tasks.get("/tasks/teacher-submissions", requireRole("TEACHER", "ADMIN"), async (req: any, res) => {
//   const teacherId = req.auth.userId;

//   const schema = z.object({
//     courseId: z.string().cuid().optional(),
//     projectId: z.string().cuid().optional(),
//     q: z.string().trim().optional(),
//   });
//   const parsed = schema.safeParse(req.query);
//   if (!parsed.success) return res.status(400).json(parsed.error);
//   const { courseId, projectId, q } = parsed.data;

//   const where: any = {
//     status: { in: ["SUBMITTED", "COMPLETED"] },
//     project: {
//       course: { teacherId },
//     },
//   };
//   if (courseId) where.project.courseId = courseId;
//   if (projectId) where.projectId = projectId;

//   if (q) {
//     // match student name/email (team members)
//     where.project.team = {
//       members: {
//         some: {
//           user: {
//             OR: [
//               { name: { contains: q, mode: "insensitive" } },
//               { email: { contains: q, mode: "insensitive" } },
//             ],
//           },
//         },
//       },
//     };
//   }

//   const items = await prisma.task.findMany({
//     where,
//     orderBy: [{ status: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
//     include: {
//       project: {
//         include: {
//           course: { select: { id: true, name: true, code: true, teacherId: true } },
//           team: {
//             include: {
//               members: {
//                 include: {
//                   user: { select: { id: true, name: true, email: true, avatarUrl: true } },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });

//   const payload = items.map((t) => ({
//     id: t.id,
//     title: t.title,
//     status: t.status as "SUBMITTED" | "COMPLETED" | string,
//     deadline: t.deadline ? t.deadline.toISOString() : null,
//     project: { id: t.project.id, title: t.project.title },
//     course: { id: t.project.course.id, code: t.project.course.code, name: t.project.course.name },
//     team: {
//       id: t.project.team?.id ?? null,
//       members:
//         t.project.team?.members.map((m) => ({
//           id: m.user.id,
//           name: m.user.name ?? m.user.email,
//           email: m.user.email,
//           avatarUrl: m.user.avatarUrl ?? null,
//         })) ?? [],
//       memberCount: t.project.team?.members.length ?? 0,
//     },
//   }));

//   res.json(payload);
// });







// server/src/routes/tasks.ts

tasks.get("/tasks/teacher-submissions", requireRole("TEACHER", "ADMIN"), async (req: any, res) => {
  const teacherId = req.auth.userId;

  const schema = z.object({
    courseId: z.string().cuid().optional(),
    projectId: z.string().cuid().optional(),
    q: z.string().trim().optional(),
  });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { courseId, projectId, q } = parsed.data;

  const where: any = {
    status: { in: ["SUBMITTED", "COMPLETED"] },
    project: { course: { teacherId } },
  };
  if (courseId) where.project.courseId = courseId;
  if (projectId) where.projectId = projectId;

  if (q) {
    where.project.team = {
      members: {
        some: {
          user: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      },
    };
  }

  const items = await prisma.task.findMany({
    where,
    orderBy: [{ status: "asc" }, { deadline: "asc" }, { createdAt: "desc" }],
    include: {
      project: {
        include: {
          course: { select: { id: true, name: true, code: true, teacherId: true } },
          team: {
            include: {
              members: {
                include: {
                  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                },
              },
            },
          },
        },
      },
      // ⬇️ bring back submissions and their files
      submissions: { include: { files: true } },
    },
  });

  const payload = items.map((t) => {
    const teamId = t.project.team?.id ?? null;
    // prefer the submission from the project team (or fallback to the most recent)
    const sub = teamId
      ? t.submissions.find((s) => s.teamId === teamId) ?? t.submissions[0]
      : t.submissions[0];

    return {
      id: t.id, // task id
      title: t.title,
      status: t.status as "SUBMITTED" | "COMPLETED" | string,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      project: { id: t.project.id, title: t.project.title },
      course: { id: t.project.course.id, code: t.project.course.code, name: t.project.course.name },
      team: {
        id: t.project.team?.id ?? null,
        members:
          t.project.team?.members.map((m) => ({
            id: m.user.id,
            name: m.user.name ?? m.user.email,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl ?? null,
          })) ?? [],
        memberCount: t.project.team?.members.length ?? 0,
      },
      // ⬇️ include student's note & uploaded files for the UI
      // submission: sub
      //   ? {
      //     id: sub.id,
      //     notes: sub.notes ?? null,
      //     // ⬇️ use submittedAt (matches your Prisma model)
      //     submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,

      //     // keep these if they exist in your schema
      //     grade: (sub as any).grade ?? null,
      //     feedback: (sub as any).feedback ?? null,

      //     files: sub.files.map((f) => ({
      //       id: f.id,
      //       name: f.originalName ?? f.filename,
      //       url: f.url,
      //       size: f.size,
      //       mime: f.mime,
      //     })),
      //   }
      //   : null,
      submission: sub
        ? {
          id: sub.id,
          notes: sub.notes ?? null,
          submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
          grade: (sub as any).grade ?? null,
          feedback: (sub as any).feedback ?? null,
          files: sub.files.map((f) => ({
            id: f.id,
            name: f.originalName ?? f.filename,
            url: f.url,
            size: f.size,
            mime: f.mime,
          })),
        }
        : null,
    };
  });

  res.json(payload);
});




/* =========================
   GET /api/projects/:projectId/tasks
   (Teacher can only list tasks for their course)
   ========================= */
tasks.get("/projects/:projectId/tasks", async (req: any, res) => {
  const projectId = req.params.projectId;

  // If a teacher is calling, ensure it’s their course
  if (req.auth?.role === "TEACHER") {
    const proj = await prisma.project.findUnique({
      where: { id: projectId },
      select: { course: { select: { teacherId: true } } },
    });
    if (!proj) return res.status(404).json({ error: "Project not found" });
    if (proj.course?.teacherId !== req.auth.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  const list = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

/* =========================
   GET /api/tasks/:id  (+ inferred teamId for caller)
   TEACHER: task must belong to a course they teach
   STUDENT: (optional) infer teamId for convenience
   ========================= */
tasks.get("/tasks/:id", async (req: any, res) => {
  const id = req.params.id;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      submissions: { include: { files: true } },
      project: {
        include: {
          course: { select: { id: true, teacherId: true } },
          team: { include: { members: true } }, // allows student membership check, if needed later
        },
      },
    },
  });

  if (!task) return res.status(404).json({ error: "Not found" });

  // TEACHER authz: must own the course this task belongs to
  if (req.auth?.role === "TEACHER") {
    const isMyCourse = task.project?.course?.teacherId === req.auth.userId;
    if (!isMyCourse) return res.status(403).json({ error: "Forbidden" });
  }

  // Infer teamId for the caller (students mostly)
  let teamId: string | undefined;
  if (req.auth?.userId && task.project) {
    const team = await prisma.team.findFirst({
      where: {
        projectId: task.project.id,
        members: { some: { userId: req.auth.userId } },
      },
      select: { id: true },
    });
    teamId = team?.id;
  }

  res.json({ ...task, teamId });
});

/* =========================
   POST /api/tasks/:id/submit  (multipart)
   ========================= */
tasks.post(
  "/tasks/:id/submit",
  requireRole("STUDENT", "ADMIN", "TEACHER"),
  upload.array("files", 10),
  async (req: any, res) => {
    try {
      const taskId = req.params.id;
      const teamId = (req.body?.teamId as string | undefined) || undefined;
      const notes = (req.body?.notes as string | undefined) || "";

      if (!teamId) return res.status(400).json({ error: "teamId required" });

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { id: true, projectId: true, status: true },
      });
      if (!task) return res.status(404).json({ error: "Task not found" });

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { id: true, projectId: true },
      });
      if (!team) return res.status(404).json({ error: "Team not found" });
      if (team.projectId !== task.projectId) {
        return res.status(400).json({ error: "Team does not belong to this task's project" });
      }

      if (req.auth.role === "STUDENT") {
        const isMember = await prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId, userId: req.auth.userId } },
        });
        if (!isMember) return res.status(403).json({ error: "You are not a member of this team" });
      }

      const uploaded = toPublicFiles(req.files as Express.Multer.File[] | undefined);

      // const submission = await prisma.$transaction(async (tx) => {
      //   const existing = await tx.submission.findUnique({
      //     where: { taskId_teamId: { taskId, teamId } },
      //     select: { id: true },
      //   });

      //   const filesCreate =
      //     uploaded.length > 0 ? { create: uploaded.map((f) => ({ ...f })) } : undefined;

      //   let subId: string;

      //   if (existing) {
      //     const upd = await tx.submission.update({
      //       where: { taskId_teamId: { taskId, teamId } },
      //       data: {
      //         notes,
      //         ...(filesCreate ? { files: filesCreate } : {}),
      //       },
      //       select: { id: true },
      //     });
      //     subId = upd.id;
      //   } else {
      //     const created = await tx.submission.create({
      //       data: {
      //         taskId,
      //         teamId,
      //         notes,
      //         ...(filesCreate ? { files: filesCreate } : {}),
      //       },
      //       select: { id: true },
      //     });
      //     subId = created.id;
      //   }

      //   try {
      //     await tx.task.update({
      //       where: { id: taskId },
      //       data: { status: "SUBMITTED" as any },
      //     });
      //   } catch { }

      //   return { id: subId };
      // });
      // in POST /tasks/:id/submit
      const submission = await prisma.$transaction(async (tx) => {
        const existing = await tx.submission.findFirst({
          where: { taskId, teamId },
          select: { id: true },
        });

        const filesCreate =
          uploaded.length > 0 ? { create: uploaded.map((f) => ({ ...f })) } : undefined;

        let subId: string;

        if (existing) {
          const upd = await tx.submission.update({
            where: { id: existing.id },
            data: {
              notes,
              submittedAt: new Date(),
              ...(filesCreate ? { files: filesCreate } : {}),
            },
            select: { id: true },
          });
          subId = upd.id;
        } else {
          const created = await tx.submission.create({
            data: {
              taskId,
              teamId,
              notes,
              submittedAt: new Date(),
              ...(filesCreate ? { files: filesCreate } : {}),
            },
            select: { id: true },
          });
          subId = created.id;
        }

        await tx.task.update({
          where: { id: taskId },
          data: { status: "SUBMITTED" as any },
        });

        return { id: subId };
      });

      await updateProjectLifecycle(task.projectId);

      res.status(201).json({ ok: true, submissionId: submission.id, files: uploaded });
    } catch (err: any) {
      console.error("Submit error:", err);
      res.status(500).json({ error: "Failed to submit task" });
    }
  }
);





tasks.post(
  "/submissions/:id/evaluate",
  requireRole("TEACHER", "ADMIN"),
  async (req: any, res) => {
    try {
      const submissionId = req.params.id;

      const bodySchema = z.object({
        grade: z.number().min(0).max(100),
        feedback: z.string().trim().max(5000).optional(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json(parsed.error);
      const { grade, feedback } = parsed.data;

      // Load submission with linked task/course to verify teacher owns it
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          task: {
            include: {
              project: { include: { course: { select: { teacherId: true } } } },
            },
          },
        },
      });
      if (!submission) return res.status(404).json({ error: "Submission not found" });

      const teacherId = req.auth.userId;
      const ownerId = submission.task.project.course?.teacherId;
      if (ownerId !== teacherId) return res.status(403).json({ error: "Forbidden" });

      // Save evaluation and optionally flip task status
      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.submission.update({
          where: { id: submissionId },
          data: { grade, feedback },
          include: { files: true },
        });

        // Mark the task as evaluated/completed (pick the status you use)
        await tx.task.update({
          where: { id: submission.taskId },
          data: { status: "COMPLETED" as any },
        });

        return sub;
      });

      return res.json({
        ok: true,
        submission: {
          id: updated.id,
          notes: updated.notes,
          grade: (updated as any).grade ?? null,
          feedback: (updated as any).feedback ?? null,
        },
      });
    } catch (err) {
      console.error("Evaluate error:", err);
      return res.status(500).json({ error: "Failed to evaluate submission" });
    }
  }
);


tasks.get("/files/:id/download", async (req: any, res) => {
  const f = await prisma.file.findUnique({
    where: { id: req.params.id },
    select: { filename: true, originalName: true },
  });
  if (!f) return res.status(404).json({ error: "File not found" });

  const abs = path.join(process.cwd(), "uploads", f.filename);
  if (!fs.existsSync(abs)) return res.status(404).json({ error: "File missing on disk" });

  res.download(abs, f.originalName || f.filename); // Content-Disposition: attachment
});





export default tasks;