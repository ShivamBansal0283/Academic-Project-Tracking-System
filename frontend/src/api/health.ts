const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function join(base: string, path: string) {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}

export async function checkHealth(timeoutMs = 3000): Promise<"ok" | "down"> {
  const url = join(BASE, "/health");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return "down";
    const data = await res.json().catch(() => ({}));
    return data?.status === "ok" ? "ok" : "down";
  } catch {
    clearTimeout(timer);
    return "down";
  }
}