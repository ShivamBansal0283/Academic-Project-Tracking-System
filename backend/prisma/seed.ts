// prisma/seed.ts
import { PrismaClient, Role, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* helpers (users, dept, course, enrollment) same as before ... */

async function upsertUser(name: string, email: string, role: Role, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash },
    create: { name, email, role, passwordHash },
  });
}
async function upsertDepartment(code: string, name: string) {
  return prisma.department.upsert({ where: { code }, update: { name }, create: { code, name } });
}
async function upsertCourse(code: string, name: string, departmentId: string, teacherId: string, description?: string) {
  return prisma.course.upsert({
    where: { code },
    update: { name, departmentId, teacherId, description },
    create: { code, name, departmentId, teacherId, description },
  });
}
async function upsertEnrollment(courseId: string, studentId: string) {
  return prisma.enrollment.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    update: {},
    create: { courseId, studentId },
  });
}

/** Project de-duped by (title, courseId, createdById). Status left at default NEW. */
async function ensureProject(
  title: string,
  description: string,
  courseId: string,
  departmentId: string,
  createdById: string,
  deadline?: Date,
  rejectionReason?: string
) {
  const existing = await prisma.project.findFirst({ where: { title, courseId, createdById } });
  if (existing) {
    return prisma.project.update({
      where: { id: existing.id },
      data: { description, departmentId, deadline, rejectionReason: rejectionReason ?? null },
    });
  }
  return prisma.project.create({
    data: { title, description, courseId, departmentId, createdById, deadline, rejectionReason: rejectionReason ?? null },
  });
}

async function ensureTeam(projectId: string, leaderId: string, name: string) {
  const existing = await prisma.team.findFirst({ where: { projectId } });
  if (existing) return existing;
  return prisma.team.create({
    data: { name, projectId, leaderId, members: { create: [{ userId: leaderId, role: "Leader" }] } },
  });
}
async function ensureMember(teamId: string, userId: string, role = "Member") {
  try {
    return await prisma.teamMember.create({ data: { teamId, userId, role } });
  } catch {
    return prisma.teamMember.findFirst({ where: { teamId, userId } });
  }
}
async function ensureTask(
  projectId: string,
  title: string,
  description: string,
  daysFromNow: number,
  weightage: number,
  status: TaskStatus = "PENDING",
  grade?: number,
  feedback?: string
) {
  const existing = await prisma.task.findFirst({ where: { projectId, title } });
  const deadline = new Date(Date.now() + daysFromNow * 24 * 3600 * 1000);
  if (existing) {
    return prisma.task.update({
      where: { id: existing.id },
      data: { description, deadline, weightage, status, grade: grade ?? null, feedback: feedback ?? null },
    });
  }
  return prisma.task.create({
    data: { projectId, title, description, deadline, weightage, status, grade: grade ?? null, feedback: feedback ?? null },
  });
}
async function ensureSubmission(taskId: string, teamId: string, notes?: string) {
  return prisma.submission.upsert({
    where: { taskId_teamId: { taskId, teamId } },
    update: { notes },
    create: { taskId, teamId, notes },
  });
}
async function addSubmissionFile(
  submissionId: string,
  uniqueSuffix: string,
  file: { originalName: string; filename: string; mime: string; size: number; url: string }
) {
  const id = `${submissionId}_${uniqueSuffix}`;
  await prisma.file.upsert({ where: { id }, update: { ...file, submissionId }, create: { id, ...file, submissionId } });
}

/** create StudentProject=NEW for each enrolled student & project of the course */
async function seedStudentProjectsForCourse(courseId: string) {
  const [enrs, projs] = await Promise.all([
    prisma.enrollment.findMany({ where: { courseId }, select: { studentId: true } }),
    prisma.project.findMany({ where: { courseId }, select: { id: true } }),
  ]);
  if (!enrs.length || !projs.length) return;
  await prisma.studentProject.createMany({
    data: enrs.flatMap((e) => projs.map((p) => ({ studentId: e.studentId, projectId: p.id, status: "NEW" as const }))),
    skipDuplicates: true,
  });
}

async function main() {
  // Departments
  const eee = await upsertDepartment("EEE", "Electrical & Electronics Engineering");
  const cse = await upsertDepartment("CSE", "Computer Science & Engineering");
  const mec = await upsertDepartment("MEC", "Mechanical Engineering");

  // Staff
  const tRao   = await upsertUser("Prof. Rao",  "rao@univ.edu",   Role.TEACHER, "teacher123");
  const tKumar = await upsertUser("Dr. Kumar",  "kumar@univ.edu", Role.TEACHER, "teacher123");
  const tSmith = await upsertUser("Dr. Smith",  "smith@univ.edu", Role.TEACHER, "teacher123");
  await upsertUser("Admin", "admin@example.com", Role.ADMIN, "admin123");

  // Students
  const s1 = await upsertUser("Shivam Bansal", "s1@univ.edu", Role.STUDENT, "student123");
  const s2 = await upsertUser("Aisha Khan",   "s2@univ.edu", Role.STUDENT, "student123");
  const s3 = await upsertUser("Rohan Mehta",  "s3@univ.edu", Role.STUDENT, "student123");
  const s4 = await upsertUser("Emily Chen",   "s4@univ.edu", Role.STUDENT, "student123");
  const s5 = await upsertUser("Carlos Diaz",  "s5@univ.edu", Role.STUDENT, "student123");
  const s6 = await upsertUser("Zara Ali",     "s6@univ.edu", Role.STUDENT, "student123");
  const s7 = await upsertUser("Anil Sharma",  "s7@univ.edu", Role.STUDENT, "student123");
  const s8 = await upsertUser("Maya Patel",   "s8@univ.edu", Role.STUDENT, "student123");

  // Courses
  const eee101 = await upsertCourse("EEE101", "Digital Systems",  eee.id, tRao.id,   "Intro to digital logic and systems");
  const eee201 = await upsertCourse("EEE201", "Power Electronics", eee.id, tKumar.id,"Switching converters, inverters, drives");
  const cse101 = await upsertCourse("CSE101", "Data Structures",   cse.id, tSmith.id,"Core DS & algorithms");
  const mec101 = await upsertCourse("MEC101", "Thermodynamics",    mec.id, tKumar.id,"Energy, entropy, cycles");

  // Enrollments
  const enroll = async (courseId: string, ss: string[]) => Promise.all(ss.map((sid) => upsertEnrollment(courseId, sid)));
  await enroll(eee101.id, [s1.id, s2.id, s3.id]);
  await enroll(eee201.id, [s2.id, s4.id, s5.id]);
  await enroll(cse101.id, [s3.id, s6.id, s7.id, s8.id]);
  await enroll(mec101.id, [s5.id, s6.id]);

  // Project topics (status left NEW; only rejection uses rejectionReason)
  const pNew1 = await ensureProject("Smart Lighting System", "Adaptive lighting using motion & ambient sensors.", eee101.id, eee.id, tRao.id,  new Date(Date.now() + 21*24*3600*1000));
  const pNew2 = await ensureProject("Campus Navigation App", "Mobile app for campus maps with accessibility routes.", cse101.id, cse.id, tSmith.id, new Date(Date.now() + 28*24*3600*1000));
  const pA1   = await ensureProject("Vending Machine on FPGA", "FSM-based vending machine on Xilinx FPGA.", eee101.id, eee.id, tRao.id,  new Date(Date.now() + 14*24*3600*1000));
  const pA2   = await ensureProject("IoT Energy Monitor", "Real-time energy monitoring with ESP32 + MQTT.", eee201.id, eee.id, tKumar.id, new Date(Date.now() + 20*24*3600*1000));
  const pComp = await ensureProject("Mini Compiler", "Lexing, parsing, and code-gen for a toy language.", cse101.id, cse.id, tSmith.id, new Date(Date.now() - 1*24*3600*1000));
  const pRej  = await ensureProject("Drone Swarm", "Autonomous drone coordination for search & rescue.", eee201.id, eee.id, tKumar.id, new Date(Date.now() + 30*24*3600*1000), "Scope too broad for course timeline");
  const pMec  = await ensureProject("Solar Still Optimization", "Improve water yield using selective coatings.", mec101.id, mec.id, tKumar.id, new Date(Date.now() + 25*24*3600*1000));

  // Teams & tasks
  const teamAlpha = await ensureTeam(pA1.id, s1.id, "Team Alpha");
  await Promise.all([ensureMember(teamAlpha.id, s2.id), ensureMember(teamAlpha.id, s3.id)]);
  const t1a = await ensureTask(pA1.id, "FSM Diagram", "Design the state diagram and transitions.", 7, 20, "SUBMITTED");
  await ensureTask(pA1.id, "Verilog Implementation", "Implement FSM in Verilog and simulate.", 10, 40, "IN_PROGRESS");
  await ensureTask(pA1.id, "FPGA Testing", "Synthesize and test on FPGA board.", 14, 40, "PENDING");
  const subAlphaT1 = await ensureSubmission(t1a.id, teamAlpha.id, "Initial FSM draft");
  await addSubmissionFile(subAlphaT1.id, "fsm_pdf", { originalName: "fsm-diagram.pdf", filename: "fsm-diagram.pdf", mime: "application/pdf", size: 154000, url: "https://example.com/files/fsm-diagram.pdf" });

  const teamWatts = await ensureTeam(pA2.id, s2.id, "Team Watts");
  await Promise.all([ensureMember(teamWatts.id, s4.id), ensureMember(teamWatts.id, s5.id)]);
  await ensureTask(pA2.id, "Hardware Bring-up", "Assemble sensors and verify readings.", 6, 25, "COMPLETED", 95, "Great job");
  await ensureTask(pA2.id, "Cloud Ingestion", "Publish telemetry to broker and store.", 12, 35, "IN_PROGRESS");
  await ensureTask(pA2.id, "Dashboard", "Visualize consumption patterns.", 18, 40, "PENDING");

  const teamParsers = await ensureTeam(pComp.id, s3.id, "Team Parsers");
  await Promise.all([ensureMember(teamParsers.id, s6.id), ensureMember(teamParsers.id, s8.id)]);
  const t1c = await ensureTask(pComp.id, "Lexer & Parser", "Tokenization and LL(1) parser.", -14, 40, "COMPLETED", 100, "Excellent structure");
  await ensureTask(pComp.id, "Code Generation", "IR & target code emission.", -7, 40, "COMPLETED", 95, "Clean IR");
  await ensureTask(pComp.id, "Report & Demo", "Write-up and demo video.", -2, 20, "COMPLETED", 98, "Well-presented");
  const subParsersT1 = await ensureSubmission(t1c.id, teamParsers.id, "Final submission");
  await addSubmissionFile(subParsersT1.id, "report_pdf", { originalName: "compiler-report.pdf", filename: "compiler-report.pdf", mime: "application/pdf", size: 420000, url: "https://example.com/files/compiler-report.pdf" });

  // Seed StudentProject for all courses/projects
  await Promise.all([
    seedStudentProjectsForCourse(eee101.id),
    seedStudentProjectsForCourse(eee201.id),
    seedStudentProjectsForCourse(cse101.id),
    seedStudentProjectsForCourse(mec101.id),
  ]);

  console.log("Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());