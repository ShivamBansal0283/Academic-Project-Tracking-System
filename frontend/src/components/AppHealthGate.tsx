// src/components/AppHealthGate.tsx
import React from "react";
import { checkHealth } from "@/api/health";

type State = "checking" | "ok" | "down";

export default function AppHealthGate({
  children,
  timeoutMs = 3000,
  retryEveryMs = 5000, // set to 0 to disable auto-retry
}: {
  children: React.ReactNode;
  timeoutMs?: number;
  retryEveryMs?: number;
}) {
  const [state, setState] = React.useState<State>("checking");

  const probe = React.useCallback(async () => {
    setState("checking");
    const s = await checkHealth(timeoutMs);
    setState(s === "ok" ? "ok" : "down");
  }, [timeoutMs]);

  React.useEffect(() => {
    probe();
  }, [probe]);

  React.useEffect(() => {
    if (state !== "down" || !retryEveryMs) return;
    const id = setInterval(probe, retryEveryMs);
    return () => clearInterval(id);
  }, [state, retryEveryMs, probe]);

  if (state === "ok") return <>{children}</>;

  if (state === "checking") {
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <p>Checking service health…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", textAlign: "center", padding: 16 }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>we are under maintainance</h1>
        <p style={{ marginBottom: 12 }}>Please try again in a moment.</p>
        <button
          onClick={probe}
          style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}