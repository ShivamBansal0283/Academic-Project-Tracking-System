// // server/src/routes/projects.ts
// import { Router } from "express";
// import { prisma } from "../prisma";
// import { z } from "zod";
// import { requireRole, authOptional } from "../middleware/auth";

// export const projects = Router();
// projects.use(authOptional);

// /* ----------------------------- Schema & helpers ----------------------------- */
// const StatusParam = z
//   .string()
//   .transform((s) => s.toUpperCase())
//   .pipe(z.enum(["NEW", "ACTIVE", "COMPLETED", "REJECTED"]));

// const CreateProjectSchema = z.object({
//   title: z.string().min(3),
//   description: z.string().min(1),
//   courseId: z.string().cuid(),
//   // 👇 optional — will be derived from the course if omitted
//   departmentId: z.string().cuid().optional(),
//   deadline: z.string().datetime().optional(),
// });

// function mapProject(p: any) {
//   return {
//     id: p.id,
//     title: p.title,
//     description: p.description,
//     // UI bucket (we override with the real bucket or enum-lowercase later)
//     status: "new" as "new" | "active" | "completed" | "rejected",
//     course: p.course?.name ?? "",
//     department: p.department?.name ?? "",
//     deadline: p.deadline ? p.deadline.toISOString() : undefined,
//     teamMembers:
//       p.team?.members?.map((m: any) => ({
//         id: m.user.id,
//         name: m.user.name ?? m.user.email,
//         avatar: m.user.avatarUrl ?? undefined,
//       })) ?? [],
//     progress: p.tasks?.length
//       ? Math.round(
//           (p.tasks.filter((t: any) => ["SUBMITTED", "COMPLETED"].includes(t.status)).length /
//             p.tasks.length) * 100
//         )
//       : 0,
//   };
// }

// /* ----------------------------------- Routes --------------------------------- */

// /**
//  * (staff) GET /api/projects?status=NEW|ACTIVE|COMPLETED|REJECTED
//  * Teachers only see:
//  *  - projects in courses they own, AND
//  *  - projects created by STUDENT users.
//  * Admins see all (optionally filtered by status).
//  */
// projects.get("/", requireRole("TEACHER", "ADMIN"), async (req: any, res) => {
//   const statusRaw = req.query.status as string | undefined;
//   const status = statusRaw ? StatusParam.parse(statusRaw) : undefined;

//   const where: any = {};
//   if (status) where.status = status;

//   if (req.auth.role === "TEACHER") {
//     where.AND = [
//       { course: { teacherId: req.auth.userId } }, // teacher’s own courses
//       { createdBy: { role: "STUDENT" } },         // student-submitted only
//     ];
//   }

//   const items = await prisma.project.findMany({
//     where,
//     orderBy: { createdAt: "desc" },
//     include: {
//       course:     { select: { id: true, name: true, code: true, teacherId: true } },
//       department: { select: { id: true, name: true, code: true } },
//       team: {
//         include: {
//           members: {
//             include: {
//               user: { select: { id: true, name: true, email: true, avatarUrl: true } },
//             },
//           },
//         },
//       },
//       tasks: true,
//       createdBy: { select: { id: true, role: true } },
//     },
//   });

//   // Lowercase enum status for UI grouping on the client
//   res.json(items.map((p) => ({ ...mapProject(p), status: p.status.toLowerCase() })));
// });

// /**
//  * (students) GET /api/projects/mine
//  * Buckets are derived by CONDITIONS:
//  * - rejected:  project.rejectionReason != null
//  * - new:       no team && not rejected
//  * - completed: team exists && tasks exist && every task COMPLETED && not rejected
//  * - active:    team exists && not completed && not rejected (includes zero-task projects)
//  */
// projects.get("/mine", requireRole("STUDENT"), async (req: any, res) => {
//   const userId = req.auth!.userId;

//   const include = {
//     project: {
//       include: {
//         course:     { select: { name: true, code: true } },
//         department: { select: { name: true, code: true } },
//         team: {
//           include: {
//             members: {
//               include: {
//                 user: { select: { id: true, name: true, email: true, avatarUrl: true } },
//               },
//             },
//           },
//         },
//         tasks: true,
//       },
//     },
//   } as const;

//   // REJECTED
//   const rejectedRows = await prisma.studentProject.findMany({
//     where: { studentId: userId, project: { NOT: { rejectionReason: null } } },
//     include,
//     orderBy: { updatedAt: "desc" },
//   });

//   // COMPLETED
//   const completedRows = await prisma.studentProject.findMany({
//     where: {
//       studentId: userId,
//       project: {
//         rejectionReason: null,
//         team: { isNot: null },
//         tasks: { some: {} },
//         AND: [{ tasks: { every: { status: "COMPLETED" } } }],
//       },
//     },
//     include,
//     orderBy: { updatedAt: "desc" },
//   });

//   // ACTIVE
//   const activeRows = await prisma.studentProject.findMany({
//     where: {
//       studentId: userId,
//       project: {
//         rejectionReason: null,
//         team: { isNot: null },
//         OR: [{ tasks: { none: {} } }, { tasks: { some: { status: { not: "COMPLETED" } } } }],
//       },
//     },
//     include,
//     orderBy: { updatedAt: "desc" },
//   });

//   // NEW
//   const newRows = await prisma.studentProject.findMany({
//     where: { studentId: userId, project: { team: null, rejectionReason: null } },
//     include,
//     orderBy: { updatedAt: "desc" },
//   });

//   const toOut = (rows: any[], bucket: "new" | "active" | "completed" | "rejected") =>
//     rows.map((r) => ({ ...mapProject(r.project), status: bucket }));

//   res.json({
//     new: toOut(newRows, "new"),
//     active: toOut(activeRows, "active"),
//     completed: toOut(completedRows, "completed"),
//     rejected: toOut(rejectedRows, "rejected"),
//   });
// });

// /**
//  * POST /api/projects
//  * - departmentId is optional; if omitted, it’s derived from the course
//  * - TEACHER may only create topics under their own courses
//  */
// projects.post("/", requireRole("STUDENT", "TEACHER", "ADMIN"), async (req: any, res) => {
//   const parsed = CreateProjectSchema.safeParse(req.body);
//   if (!parsed.success) return res.status(400).json(parsed.error);

//   const { title, description, courseId } = parsed.data;
//   const deadline = parsed.data.deadline ? new Date(parsed.data.deadline) : undefined;

//   // Fetch course to validate and derive department
//   const course = await prisma.course.findUnique({
//     where: { id: courseId },
//     select: { id: true, teacherId: true, departmentId: true },
//   });
//   if (!course) return res.status(404).json({ error: "Course not found" });

//   if (req.auth.role === "TEACHER" && course.teacherId !== req.auth.userId) {
//     return res.status(403).json({ error: "You can only create topics for your courses" });
//   }

//   const departmentId = parsed.data.departmentId ?? course.departmentId;

//   const created = await prisma.project.create({
//     data: {
//       title,
//       description,
//       courseId,
//       departmentId,
//       deadline,
//       createdById: req.auth.userId,
//     },
//   });

//   res.status(201).json(created);
// });

// /**
//  * GET /api/projects/:id
//  * - STUDENT: must be the creator or a team member
//  * - TEACHER: must own the course AND the project must be created by a STUDENT
//  * - ADMIN:   full access
//  */
// projects.get("/:id", requireRole("STUDENT", "TEACHER", "ADMIN"), async (req: any, res) => {
//   const id = req.params.id;

//   const p = await prisma.project.findUnique({
//     where: { id },
//     include: {
//       course: true,
//       department: true,
//       team: { include: { members: { include: { user: true } } } },
//       tasks: true,
//       createdBy: { select: { id: true, role: true } },
//     },
//   });
//   if (!p) return res.status(404).json({ error: "Not found" });

//   if (req.auth.role === "STUDENT") {
//     const uid = req.auth.userId;
//     const isCreator = p.createdBy?.id === uid;
//     const isMember = !!p.team?.members.some((m) => m.userId === uid);
//     if (!isCreator && !isMember) return res.status(403).json({ error: "Forbidden" });
//   }

//   if (req.auth.role === "TEACHER") {
//     const isMyCourse = p.course?.teacherId === req.auth.userId;
//     const isStudentSubmission = p.createdBy?.role === "STUDENT";
//     if (!isMyCourse || !isStudentSubmission) return res.status(403).json({ error: "Forbidden" });
//   }

//   res.json(p);
// });




// server/src/routes/projects.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import { requireRole, authOptional } from "../middleware/auth";

export const projects = Router();
projects.use(authOptional);

/* ----------------------------- Schema & helpers ----------------------------- */
const StatusParam = z
  .string()
  .transform((s) => s.toUpperCase())
  .pipe(z.enum(["NEW", "ACTIVE", "COMPLETED", "REJECTED"]));

const CreateProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  courseId: z.string().cuid(),
  // optional — derived from the course if omitted
  departmentId: z.string().cuid().optional(),
  deadline: z.string().datetime().optional(),
});

function mapProject(p: any) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    // UI bucket (we override with the real bucket or enum-lowercase later)
    status: "new" as "new" | "active" | "completed" | "rejected",
    course: p.course?.name ?? "",
    department: p.department?.name ?? "",
    deadline: p.deadline ? p.deadline.toISOString() : undefined,
    teamMembers:
      p.team?.members?.map((m: any) => ({
        id: m.user.id,
        name: m.user.name ?? m.user.email,
        avatar: m.user.avatarUrl ?? undefined,
      })) ?? [],
    progress: p.tasks?.length
      ? Math.round(
          (p.tasks.filter((t: any) => ["SUBMITTED", "COMPLETED"].includes(t.status)).length /
            p.tasks.length) * 100
        )
      : 0,
  };
}

/* ----------------------------------- Routes --------------------------------- */

/**
 * (staff) GET /api/projects?status=NEW|ACTIVE|COMPLETED|REJECTED
 * Teachers only see:
 *  - projects in courses they own, AND
 *  - projects created by STUDENT users.
 * Admins see all (optionally filtered by status).
 */
projects.get("/", requireRole("TEACHER", "ADMIN"), async (req: any, res) => {
  const statusRaw = req.query.status as string | undefined;
  const status = statusRaw ? StatusParam.parse(statusRaw) : undefined;

  const where: any = {};
  if (status) where.status = status;

  if (req.auth.role === "TEACHER") {
    where.AND = [
      // Prisma to-one relation filter; "is" is safe for optional relations
      { course: { is: { teacherId: req.auth.userId } } },
      { createdBy: { is: { role: "STUDENT" } } },
    ];
  }

  const items = await prisma.project.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      course:     { select: { id: true, name: true, code: true, teacherId: true } },
      department: { select: { id: true, name: true, code: true } },
      team: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
        },
      },
      tasks: true,
      createdBy: { select: { id: true, role: true } },
    },
  });

  // Lowercase enum status for UI grouping on the client
  res.json(items.map((p) => ({ ...mapProject(p), status: p.status.toLowerCase() })));
});

/**
 * (students) GET /api/projects/mine
 * Buckets are derived by CONDITIONS:
 * - rejected:  project.rejectionReason != null
 * - new:       no team && not rejected
 * - completed: team exists && tasks exist && every task COMPLETED && not rejected
 * - active:    team exists && not completed && not rejected (includes zero-task projects)
 */
projects.get("/mine", requireRole("STUDENT"), async (req: any, res) => {
  const userId = req.auth!.userId;

  const include = {
    project: {
      include: {
        course:     { select: { name: true, code: true } },
        department: { select: { name: true, code: true } },
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
              },
            },
          },
        },
        tasks: true,
      },
    },
  } as const;

  // REJECTED
  const rejectedRows = await prisma.studentProject.findMany({
    where: { studentId: userId, project: { NOT: { rejectionReason: null } } },
    include,
    orderBy: { updatedAt: "desc" },
  });

  // COMPLETED
  const completedRows = await prisma.studentProject.findMany({
    where: {
      studentId: userId,
      project: {
        rejectionReason: null,
        team: { isNot: null },
        tasks: { some: {} },
        AND: [{ tasks: { every: { status: "COMPLETED" } } }],
      },
    },
    include,
    orderBy: { updatedAt: "desc" },
  });

  // ACTIVE
  const activeRows = await prisma.studentProject.findMany({
    where: {
      studentId: userId,
      project: {
        rejectionReason: null,
        team: { isNot: null },
        OR: [{ tasks: { none: {} } }, { tasks: { some: { status: { not: "COMPLETED" } } } }],
      },
    },
    include,
    orderBy: { updatedAt: "desc" },
  });

  // NEW
  const newRows = await prisma.studentProject.findMany({
    where: { studentId: userId, project: { team: null, rejectionReason: null } },
    include,
    orderBy: { updatedAt: "desc" },
  });

  const toOut = (rows: any[], bucket: "new" | "active" | "completed" | "rejected") =>
    rows.map((r) => ({ ...mapProject(r.project), status: bucket }));

  res.json({
    new: toOut(newRows, "new"),
    active: toOut(activeRows, "active"),
    completed: toOut(completedRows, "completed"),
    rejected: toOut(rejectedRows, "rejected"),
  });
});

/**
 * POST /api/projects
 * - departmentId is optional; if omitted, it’s derived from the course
 * - TEACHER may only create topics under their own courses
 */
projects.post("/", requireRole("STUDENT", "TEACHER", "ADMIN"), async (req: any, res) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { title, description, courseId } = parsed.data;
  const deadline = parsed.data.deadline ? new Date(parsed.data.deadline) : undefined;

  // Fetch course to validate and derive department
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, teacherId: true, departmentId: true },
  });
  if (!course) return res.status(404).json({ error: "Course not found" });

  if (req.auth.role === "TEACHER" && course.teacherId !== req.auth.userId) {
    return res.status(403).json({ error: "You can only create topics for your courses" });
  }

  const departmentId = parsed.data.departmentId ?? course.departmentId;

  const created = await prisma.project.create({
    data: {
      title,
      description,
      courseId,
      departmentId,
      deadline,
      createdById: req.auth.userId,
    },
  });

  res.status(201).json(created);
});

/**
 * GET /api/projects/:id
 * - STUDENT: must be the creator or a team member
 * - TEACHER: must own the course (createdBy can be ANY role)
 * - ADMIN:   full access
 */
projects.get("/:id", requireRole("STUDENT", "TEACHER", "ADMIN"), async (req: any, res) => {
  const id = req.params.id;

  const p = await prisma.project.findUnique({
    where: { id },
    include: {
      course: true,
      department: true,
      team: { include: { members: { include: { user: true } } } },
      tasks: true,
      createdBy: { select: { id: true, role: true } },
    },
  });
  if (!p) return res.status(404).json({ error: "Not found" });

  if (req.auth.role === "STUDENT") {
    const uid = req.auth.userId;
    const isCreator = p.createdBy?.id === uid;
    const isMember = !!p.team?.members.some((m) => m.userId === uid);
    if (!isCreator && !isMember) return res.status(403).json({ error: "Forbidden" });
  }

  if (req.auth.role === "TEACHER") {
    const isMyCourse = p.course?.teacherId === req.auth.userId;
    if (!isMyCourse) return res.status(403).json({ error: "Forbidden" });
  }

  res.json(p);
});