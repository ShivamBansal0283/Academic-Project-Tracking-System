// server/src/utils/projectLifecycle.ts
import { prisma } from "../prisma";

/**
 * Ensure StudentProject rows exist for all enrolled students for this project’s course.
 * No status updates here — grouping is derived at read time.
 */
export async function updateProjectLifecycle(projectId: string) {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { courseId: true },
  });
  if (!p) return;

  const [enrolled, existing] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: p.courseId },
      select: { studentId: true },
    }),
    prisma.studentProject.findMany({
      where: { projectId },
      select: { studentId: true },
    }),
  ]);

  const have = new Set(existing.map((x) => x.studentId));
  const toCreate = enrolled
    .filter((e) => !have.has(e.studentId))
    .map((e) => ({ studentId: e.studentId, projectId, status: "NEW" as const }));

  if (toCreate.length) {
    await prisma.studentProject.createMany({ data: toCreate, skipDuplicates: true });
  }
}