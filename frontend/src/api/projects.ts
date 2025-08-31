import { http } from "./_client";

export type ProjectStatus = "new" | "active" | "completed" | "rejected";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus; // lowercased from server
  course: string;
  department: string;
  deadline?: string;
  teamMembers?: Array<{ id?: string; name: string; avatar?: string }>;
  progress?: number;
}

export interface ProjectGroups {
  new: Project[];
  active: Project[];
  completed: Project[];
  rejected: Project[];
}

function groupByStatus(list: Project[]): ProjectGroups {
  const groups: ProjectGroups = { new: [], active: [], completed: [], rejected: [] };
  for (const p of list) groups[p.status].push(p);
  return groups;
}

/** Student-scoped: now returned grouped from the server */
export async function getMyProjects(): Promise<ProjectGroups> {
  return http<ProjectGroups>("/api/projects/mine");
}

/** Admin/Teacher listing; server returns an array -> group on client */
export async function getProjects(
  status?: "NEW" | "ACTIVE" | "COMPLETED" | "REJECTED"
): Promise<ProjectGroups> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const list = await http<Project[]>(`/api/projects${qs}`);
  return groupByStatus(list);
}

export async function getProject(id: string) {
  return http(`/api/projects/${id}`);
}

export async function createProject(input: {
  title: string;
  description: string;
  courseId: string;
  departmentId?: string;
  deadline?: string;
}) {
  return http(`/api/projects`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProject(
  id: string,
  patch: Partial<{ title: string; description: string; deadline: string; status: string }>
) {
  return http(`/api/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function approveProject(id: string) {
  return http(`/api/projects/${id}/approve`, { method: "PUT" });
}

export async function rejectProject(id: string, reason: string) {
  return http(`/api/projects/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  });
}