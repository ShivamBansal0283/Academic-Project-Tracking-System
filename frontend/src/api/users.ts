import { http } from "./_client";

export type Me = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  avatarUrl?: string | null;
  createdAt?: string;
};

export function getMe(): Promise<Me> {
  return http<Me>("/api/users/me");
}

export function updateMe(patch: Partial<Pick<Me, "name" | "avatarUrl">>) {
  return http<Me>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const fd = new FormData();
  fd.append("avatar", file);
  return http<{ avatarUrl: string }>("/api/users/me/avatar", {
    method: "POST",
    body: fd,
  });
}

export function changePassword(body: { currentPassword: string; newPassword: string }) {
  return http<{ ok: boolean }>("/api/users/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}