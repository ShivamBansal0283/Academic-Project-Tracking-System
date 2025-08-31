// src/lib/progress.ts
import { prisma } from "../prisma";
import type { ProjectStatus } from "@prisma/client";

/** Ensure a StudentProject row exists and set status */
export async function setStudentProjectStatus(
  studentId: string,
  projectId: string,
  status: ProjectStatus
) {
  await prisma.studentProject.upsert({
    where: { studentId_projectId: { studentId, projectId } },
    create: { studentId, projectId, status },
    update: { status },
  });
}

/** Set status for all team members for a project */
export async function setStatusForTeamMembers(
  projectId: string,
  teamId: string,
  status: ProjectStatus
) {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });
  await Promise.all(
    members.map((m) => setStudentProjectStatus(m.userId, projectId, status))
  );
}

/** On enroll: create NEW rows (if missing) for all projects in the course */
export async function seedStudentProjectsOnEnroll(
  courseId: string,
  studentId: string
) {
  const projects = await prisma.project.findMany({
    where: { courseId },
    select: { id: true },
  });
  await Promise.all(
    projects.map((p) =>
      prisma.studentProject.upsert({
        where: { studentId_projectId: { studentId, projectId: p.id } },
        create: { studentId, projectId: p.id, status: "NEW" },
        update: {}, // leave status as is if already present
      })
    )
  );
}

/**
 * After a submission: if the team has submitted for ALL tasks of this project,
 * mark COMPLETED for all team members; else mark ACTIVE.
 */
export async function recomputeStatusForTeam(
  projectId: string,
  teamId: string
) {
  const totalTasks = await prisma.task.count({ where: { projectId } });
  if (totalTasks === 0) {
    // No tasks => treat as ACTIVE once a team exists
    await setStatusForTeamMembers(projectId, teamId, "ACTIVE");
    return;
  }

  // How many tasks have a submission by this team?
  const submittedCount = await prisma.submission.count({
    where: { teamId, task: { projectId } },
  });

  const status: ProjectStatus =
    submittedCount >= totalTasks ? "COMPLETED" : "ACTIVE";

  await setStatusForTeamMembers(projectId, teamId, status);
}