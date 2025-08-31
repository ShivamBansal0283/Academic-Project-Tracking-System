import { http } from "./_client";

export interface TeamMember {
  userId?: string;
  role: "Leader" | "Member";
  user?: { id: string; name?: string | null; email: string; avatarUrl?: string | null };
}

export interface Team {
  id: string;
  name: string;
  projectId: string;
  leaderId: string;
  members: TeamMember[];
  project?: { id: string; title: string; status: string };
}

export interface Invitation {
  id: string;
  teamId: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt?: string;
}

export function createTeam(input: { name: string; projectId: string }) {
  return http<Team>(`/api/teams`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function inviteToTeam(teamId: string, email: string) {
  return http<Invitation>(`/api/teams/${teamId}/invite`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function acceptInvitation(invId: string) {
  return http<{ ok: boolean }>(`/api/teams/invitations/${invId}/accept`, {
    method: "PUT",
  });
}

export function declineInvitation(invId: string) {
  return http<{ ok: boolean }>(`/api/teams/invitations/${invId}/decline`, {
    method: "PUT",
  });
}

export function removeMember(teamId: string, userId: string) {
  return http<{ ok: boolean }>(`/api/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
  });
}

export function getMyTeams() {
  return http<Team[]>(`/api/teams/mine`);
}

// NEW: generic getter (pending by default)
export function getInvitations(
  status: "pending" | "accepted" | "declined" = "pending"
) {
  return http<Invitation[]>(`/api/teams/invitations?status=${encodeURIComponent(status)}`);
}

// (keep if used elsewhere)
export function getPendingInvitations() {
  return getInvitations("pending");
}