// src/api/client.ts
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

export async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...defaultHeaders, ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}
