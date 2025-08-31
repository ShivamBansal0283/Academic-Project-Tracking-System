import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import { requireRole, authOptional } from "../middleware/auth";
import { updateProjectLifecycle } from "../utils/projectLifecycle";

export const courses = Router();
courses.use(authOptional);

/* ----------------------------- Departments ----------------------------- */
courses.get("/departments", async (_req, res) => {
  const list = await prisma.department.findMany({ orderBy: { name: "asc" } });
  res.json(list);
});

/* ----------------------------- List (all) ----------------------------- */
courses.get("/", async (_req, res) => {
  const list = await prisma.course.findMany({
    include: {
      teacher: { select: { name: true, email: true } },
      department: true,
      enrollments: { include: { student: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = list.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    department: c.department.name,
    description: c.description || "",
    teacherId: c.teacherId,
    teacher: { name: c.teacher?.name ?? "", email: c.teacher?.email ?? "" },
    students: c.enrollments.map((e) => ({
      id: e.studentId,
      name: e.student.name,
      email: e.student.email,
    })),
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(mapped);
});

/* ----------------------------- My courses (student) ----------------------------- */
courses.get("/mine", requireRole("STUDENT"), async (req, res) => {
  const userId = req.auth!.userId;

  const list = await prisma.course.findMany({
    where: { enrollments: { some: { studentId: userId } } },
    include: {
      teacher: { select: { name: true, email: true } },
      department: true,
      enrollments: { include: { student: true } },
    },
    orderBy: { name: "asc" },
  });

  const mapped = list.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    department: c.department.name,
    description: c.description || "",
    teacherId: c.teacherId,
    teacher: { name: c.teacher?.name ?? "", email: c.teacher?.email ?? "" },
    students: c.enrollments.map((e) => ({
      id: e.studentId,
      name: e.student.name,
      email: e.student.email,
    })),
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(mapped);
});

/* ----------------------------- Create course ----------------------------- */
const CourseCreate = z.object({
  name: z.string().min(3),
  code: z.string().min(3),
  description: z.string().optional(),
  departmentId: z.string().cuid(),
  teacherId: z.string().cuid(),
});

courses.post("/", requireRole("ADMIN", "TEACHER"), async (req, res) => {
  const parsed = CourseCreate.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const created = await prisma.course.create({ data: parsed.data });
  res.status(201).json(created);
});

/* ----------------------------- Helpers ----------------------------- */
/** Clone all teacher/admin projects in a course for a student (and copy tasks). Idempotent by (title, courseId, createdById). */
async function cloneCourseProjectsForStudent(courseId: string, studentId: string) {
  const templates = await prisma.project.findMany({
    where: {
      courseId,
      createdBy: { role: { in: ["TEACHER", "ADMIN"] } },
    },
    include: { tasks: true, department: true },
  });

  for (const tp of templates) {
    // does the student already have a copy for this topic?
    const existing = await prisma.project.findFirst({
      where: { courseId, createdById: studentId, title: tp.title },
      select: { id: true },
    });
    if (existing) continue;

    const my = await prisma.project.create({
      data: {
        title: tp.title,
        description: tp.description,
        status: "NEW",               // global enum; student grouping is condition-based anyway
        deadline: tp.deadline ?? null,
        courseId,
        departmentId: tp.departmentId,
        createdById: studentId,
      },
    });

    // copy tasks (reset to PENDING, no grade/feedback)
    if (tp.tasks.length) {
      await prisma.task.createMany({
        data: tp.tasks.map((t) => ({
          projectId: my.id,
          title: t.title,
          description: t.description,
          deadline: t.deadline,
          weightage: t.weightage,
          status: "PENDING",
          grade: null,
          feedback: null,
        })),
      });
    }
    await updateProjectLifecycle(my.id);
  }
}

/* ----------------------------- Enroll ----------------------------- */
// POST /api/courses/:id/enroll
// Enrolls the student and clones teacher/admin projects into student-owned copies.
courses.post("/:id/enroll", requireRole("STUDENT", "ADMIN", "TEACHER"), async (req: any, res) => {
  const courseId = req.params.id;
  const studentId = (req.body?.studentId as string) ?? req.auth?.userId;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return res.status(404).json({ error: "Course not found" });

  const enrollment = await prisma.enrollment.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    update: {},
    create: { courseId, studentId },
  });

  // clone topics → student projects
  await cloneCourseProjectsForStudent(courseId, studentId);

  res.status(201).json(enrollment);
});

/* ----------------------------- Course details (with myProjectId & derived myStatus) ----------------------------- */
// GET /api/courses/:id
courses.get("/:id", async (req: any, res) => {
  const id = req.params.id;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      department: true,
      enrollments: { select: { studentId: true, student: { select: { id: true, name: true, email: true } } } },
      projects: {
        // templates / any project under this course (used to render the topic list)
        include: { createdBy: { select: { role: true } }, team: true, tasks: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) return res.status(404).json({ error: "Course not found" });

  const meId: string | undefined = req.auth?.userId;
  const meIsStudent = req.auth?.role === "STUDENT";
  const isEnrolled = !!(meId && course.enrollments.some((e) => e.studentId === meId));

  // preload my student-owned copies in this course (by title)
  const myCopies = meId
    ? await prisma.project.findMany({
        where: { courseId: id, createdById: meId },
        include: { team: { include: { members: true } }, tasks: true },
      })
    : [];

  const myByTitle = new Map<string, (typeof myCopies)[number]>();
  for (const p of myCopies) if (!myByTitle.has(p.title)) myByTitle.set(p.title, p);

  const payload = {
    id: course.id,
    name: course.name,
    code: course.code,
    department: course.department.name,
    description: course.description || "",
    teacherId: course.teacherId,
    teacher: {
      id: course.teacher?.id ?? "",
      name: course.teacher?.name ?? "",
      email: course.teacher?.email ?? "",
    },
    students: course.enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
    })),
    createdAt: course.createdAt.toISOString(),
    projects: course.projects.map((topic) => {
      // find my copy (if any) by title
      const mine = myByTitle.get(topic.title);

      // derive myStatus by CONDITIONS on my copy
      let myStatus: "new" | "active" | "completed" | "rejected" | null = null;
      let hasTeam = false;
      let myProjectId: string | null = null;

      if (meIsStudent && isEnrolled) {
        const rejected = topic.status === "REJECTED" || !!topic.rejectionReason;
        if (rejected) {
          myStatus = "rejected";
        } else if (mine) {
          hasTeam = !!mine.team;
          myProjectId = mine.id;
          const allCompleted = mine.tasks.length > 0 && mine.tasks.every((t) => t.status === "COMPLETED");
          myStatus = hasTeam ? (allCompleted ? "completed" : "active") : "new";
        } else {
          myStatus = "new";
        }
      }

      return {
        id: topic.id,                     // template id (staff views)
        title: topic.title,
        status: topic.status,             // global enum for staff/admin
        myStatus,                         // derived for the requester
        myProjectId,                      // <-- student should navigate to THIS id
        deadline: (mine?.deadline ?? topic.deadline)?.toISOString?.() ?? null,
        hasTeam,                          // reflect my copy team, not template
      };
    }),
  };

  res.json(payload);
});

export default courses;