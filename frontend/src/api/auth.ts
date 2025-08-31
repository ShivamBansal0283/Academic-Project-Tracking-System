import { http } from "./_client";

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  avatarUrl?: string | null;
};

export function login(email: string, password: string) {
  return http<{ user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return http<{ ok: boolean }>("/auth/logout", { method: "POST" });
}

export function me() {
  return http<{ user: User }>("/auth/me");
}