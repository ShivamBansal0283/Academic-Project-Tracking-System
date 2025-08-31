const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function isJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

let refreshing: Promise<boolean> | null = null;
async function refreshTokens(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFD = typeof FormData !== "undefined" && init.body instanceof FormData;

  const headers = new Headers(init.headers || {});
  // do NOT set Content-Type for FormData (browser sets boundary)
  if (!isFD && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const doFetch = () =>
    fetch(`${BASE}${path}`, {
      credentials: "include", // send httpOnly cookies
      headers,
      ...init,
    });

  let res = await doFetch();

  if (res.status === 401) {
    const ok = await refreshTokens();
    if (ok) res = await doFetch();
  }

  if (!res.ok) {
    // Try to surface server error body for easier debugging
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }

  if (!isJson(res)) return undefined as T;
  return (await res.json()) as T;
}

// Convenience wrappers
export const httpGet =  <T>(p: string, init: RequestInit = {}) =>
  http<T>(p, { ...init, method: "GET" });

export const httpPost = <T>(p: string, body?: any, init: RequestInit = {}) =>
  http<T>(p, {
    ...init,
    method: "POST",
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

export const httpPatch = <T>(p: string, body?: any, init: RequestInit = {}) =>
  http<T>(p, {
    ...init,
    method: "PATCH",
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

export const httpPut = <T>(p: string, body?: any, init: RequestInit = {}) =>
  http<T>(p, {
    ...init,
    method: "PUT",
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

export const httpDelete = <T>(p: string, init: RequestInit = {}) =>
  http<T>(p, { ...init, method: "DELETE" });