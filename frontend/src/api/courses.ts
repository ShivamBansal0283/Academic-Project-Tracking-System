// src/api/courses.ts
import { http } from "./_client";

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  description?: string;
  teacherId: string;
  teacher: { name: string; email: string };
  students: Array<{ id: string; name: string; email: string }>;
  createdAt: string;
}

export const getDepartments = (): Promise<Department[]> =>
  http<Department[]>("/api/courses/departments");

export const getCourses = (): Promise<Course[]> =>
  http<Course[]>("/api/courses");

/** Only the logged-in student's courses */
export const getMyCourses = (): Promise<Course[]> =>
  http<Course[]>("/api/courses/mine");

export function createCourse(course: {
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  teacherId: string;
}) {
  return http("/api/courses", {
    method: "POST",
    body: JSON.stringify(course),
  });
}

export function enrollInCourse(courseId: string, studentId?: string) {
  return http(`/api/courses/${courseId}/enroll`, {
    method: "POST",
    body: JSON.stringify(studentId ? { studentId } : {}),
  });
}

/* ---------- Course Details (+ per-student project status) ---------- */

/** derived per-student status is LOWERCASE and includes 'rejected' */
export type StudentProjectStatus = "new" | "active" | "completed" | "rejected";

export interface CourseDetail {
  id: string;
  name: string;
  code: string;
  department: string;
  description?: string;
  teacherId: string;
  teacher: { id?: string; name: string; email: string };
  students: Array<{ id: string; name: string; email: string }>;
  createdAt: string;
  projects: Array<{
    id: string; // template id (staff/admin views)
    title: string;
    /** Global project status (enum, uppercase) for staff/admin */
    status: "NEW" | "ACTIVE" | "COMPLETED" | "REJECTED";
    /** Derived per-student status for the requester */
    myStatus: StudentProjectStatus | null;
    /** Student's OWN project id (navigate to this for students) */
    myProjectId: string | null;             // <-- ADDED
    deadline: string | null;
    /** For students, this reflects the team on their copy */
    hasTeam: boolean;
  }>;
}

export const getCourse = (id: string): Promise<CourseDetail> =>
  http<CourseDetail>(`/api/courses/${id}`);