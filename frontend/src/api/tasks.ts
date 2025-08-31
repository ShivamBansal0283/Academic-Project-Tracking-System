




// src/api/tasks.ts
import { http } from "./_client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  weightage: number | null;
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "EVALUATED";
  submittedAt?: string | null;
  grade?: number | null;
  feedback?: string | null;
  projectId: string;
  teamId?: string; // server includes inferred teamId on GET /api/tasks/:id
}

export function getProjectTasks(projectId: string): Promise<Task[]> {
  return http<Task[]>(`/api/projects/${projectId}/tasks`);
}

export function getTask(id: string): Promise<Task> {
  return http<Task>(`/api/tasks/${id}`);
}

export function submitTask(taskId: string, teamId: string, notes: string, files?: File[]) {
  const hasFiles = Array.isArray(files) && files.length > 0;
  if (hasFiles) {
    const fd = new FormData();
    fd.append("teamId", teamId);
    fd.append("notes", notes ?? "");
    (files as File[]).forEach((f) => fd.append("files", f));
    return http(`/api/tasks/${taskId}/submit`, { method: "POST", body: fd });
  }
  return http(`/api/tasks/${taskId}/submit`, {
    method: "POST",
    body: JSON.stringify({ teamId, notes }),
  });
}

/* ---------- Teacher submissions ---------- */
export type TeacherSubmission = {
  id: string; // task id
  title: string;
  status: "SUBMITTED" | "COMPLETED" | string;
  deadline: string | null;
  project: { id: string; title: string };
  course: { id: string; code: string; name: string };
  team: {
    id: string | null;
    memberCount: number;
    members: Array<{ id: string; name: string; email: string; avatarUrl: string | null }>;
  };
  submission: null | {
    id: string;
    notes: string | null;
    submittedAt: string | null;
    grade?: number | null;
    feedback?: string | null;
    files: Array<{ id: string; name: string; url: string; size?: number; mime?: string }>;
  };
};

export function getTeacherSubmissions(params?: { courseId?: string; projectId?: string; q?: string }) {
  const usp = new URLSearchParams();
  if (params?.courseId) usp.set("courseId", params.courseId);
  if (params?.projectId) usp.set("projectId", params.projectId);
  if (params?.q) usp.set("q", params.q);
  const qs = usp.toString();
  return http<TeacherSubmission[]>(`/api/tasks/teacher-submissions${qs ? `?${qs}` : ""}`);
}

// export type TeacherSubmission = {
//   id: string;
//   title: string;
//   status: "SUBMITTED" | "COMPLETED" | string;
//   deadline: string | null;
//   project: { id: string; title: string };
//   course: { id: string; code: string; name: string };
//   team: {
//     id: string | null;
//     memberCount: number;
//     members: Array<{ id: string; name: string; email: string; avatarUrl: string | null }>;
//   };
// };

// export function getTeacherSubmissions(params?: { courseId?: string; projectId?: string; q?: string }) {
//   const usp = new URLSearchParams();
//   if (params?.courseId) usp.set("courseId", params.courseId);
//   if (params?.projectId) usp.set("projectId", params.projectId);
//   if (params?.q) usp.set("q", params.q);
//   const qs = usp.toString();
//   return http<TeacherSubmission[]>(`/api/tasks/teacher-submissions${qs ? `?${qs}` : ""}`);
// }


