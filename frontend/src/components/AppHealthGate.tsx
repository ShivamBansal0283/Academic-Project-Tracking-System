// // src/components/AppHealthGate.tsx
// import React from "react";
// import { checkHealth } from "@/api/health";

// type State = "checking" | "ok" | "down";

// export default function AppHealthGate({
//   children,
//   timeoutMs = 3000,
//   retryEveryMs = 5000, // set to 0 to disable auto-retry
// }: {
//   children: React.ReactNode;
//   timeoutMs?: number;
//   retryEveryMs?: number;
// }) {
//   const [state, setState] = React.useState<State>("checking");

//   const probe = React.useCallback(async () => {
//     setState("checking");
//     const s = await checkHealth(timeoutMs);
//     setState(s === "ok" ? "ok" : "down");
//   }, [timeoutMs]);

//   React.useEffect(() => {
//     probe();
//   }, [probe]);

//   React.useEffect(() => {
//     if (state !== "down" || !retryEveryMs) return;
//     const id = setInterval(probe, retryEveryMs);
//     return () => clearInterval(id);
//   }, [state, retryEveryMs, probe]);

//   if (state === "ok") return <>{children}</>;

//   if (state === "checking") {
//     return (
//       <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
//         <p>Checking service health…</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", textAlign: "center", padding: 16 }}>
//       <div>
//         <h1 style={{ fontSize: 28, marginBottom: 8 }}>we are under maintainance</h1>
//         <p style={{ marginBottom: 12 }}>Please try again in a moment.</p>
//         <button
//           onClick={probe}
//           style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
//         >
//           Retry
//         </button>
//       </div>
//     </div>
//   );
// }












// src/components/AppHealthGate.tsx
import React from "react";
import { checkHealth } from "@/api/health";

/**
 * Expected behavior of checkHealth():
 * - Resolves to "ok" when the service is healthy.
 * - Resolves to anything else OR rejects when not healthy yet (cold start / error).
 *   We treat these as "not ready yet" and retry with backoff until maxWaitMs.
 */

type GateState = "checking" | "waking" | "ok" | "down" | "maintenance" | "error";

type Props = {
  children: React.ReactNode;
  /** Per-attempt timeout for the health call */
  timeoutMs?: number;       // default 3500
  /** Base retry interval; exponential backoff up to 10s */
  retryEveryMs?: number;    // default 1200 (set 0 to disable auto-retry)
  /** Max total wait across retries before showing error screen */
  maxWaitMs?: number;       // default 120_000
};

export default function AppHealthGate({
  children,
  timeoutMs = 3500,
  retryEveryMs = 1200,
  maxWaitMs = 120_000,
}: Props) {
  const [state, setState] = React.useState<GateState>("checking");
  const [detail, setDetail] = React.useState<string>("");
  const startedAtRef = React.useRef<number>(Date.now());
  const retryTimerRef = React.useRef<number | null>(null);

  const clearRetry = () => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const probe = React.useCallback(
    async (attempt = 0) => {
      // Cancel any pending scheduled probe before firing a new one
      clearRetry();

      setState((prev) => (prev === "ok" ? prev : attempt === 0 ? "checking" : "waking"));
      try {
        const result = await checkHealth(timeoutMs as number);
        // Accept "ok" (string) or object { status: "ok" }
        const status =
          typeof result === "string"
            ? result
            : (result?.status as string | undefined) || "down";

        if (status === "ok") {
          setState("ok");
          setDetail("");
          return;
        }

        if (status === "maintenance") {
          setState("maintenance");
          setDetail(
            typeof result === "object" && result?.message
              ? String(result.message)
              : "Temporarily unavailable"
          );
          return;
        }

        // Not ok → maybe still waking
        const elapsed = Date.now() - startedAtRef.current;
        if (retryEveryMs > 0 && elapsed < maxWaitMs) {
          setState("waking");
          const backoff = Math.min(10_000, retryEveryMs * 2 ** attempt);
          retryTimerRef.current = window.setTimeout(() => {
            probe(attempt + 1);
          }, backoff);
        } else {
          setState("error");
          setDetail(`Health not ready after ${Math.round(elapsed / 1000)}s`);
        }
      } catch (e: any) {
        // Network error / timeout → treat as waking until cap
        const elapsed = Date.now() - startedAtRef.current;
        if (retryEveryMs > 0 && elapsed < maxWaitMs) {
          setState("waking");
          const backoff = Math.min(10_000, retryEveryMs * 2 ** attempt);
          retryTimerRef.current = window.setTimeout(() => {
            probe(attempt + 1);
          }, backoff);
        } else {
          setState("error");
          setDetail(e?.message ?? "Health check failed");
        }
      }
    },
    [timeoutMs, retryEveryMs, maxWaitMs]
  );

  // First probe on mount
  React.useEffect(() => {
    startedAtRef.current = Date.now();
    probe(0);
    return () => clearRetry();
  }, [probe]);

  // Manual "Retry" resets the window and polls from attempt 0
  const handleManualRetry = React.useCallback(() => {
    startedAtRef.current = Date.now();
    probe(0);
  }, [probe]);

  if (state === "ok") return <>{children}</>;

  if (state === "checking" || state === "waking") {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div className="space-y-2 max-w-lg">
          <h1 className="text-2xl font-semibold">Warming up…</h1>
          <p className="opacity-80">
            Starting the service. This can take a few seconds on a cold start.
          </p>
        </div>
      </div>
    );
  }

  if (state === "maintenance") {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div className="space-y-3 max-w-lg">
          <h1 className="text-2xl font-semibold">Under maintenance</h1>
          <p className="opacity-80">{detail}</p>
          <button
            onClick={handleManualRetry}
            className="px-4 py-2 rounded-2xl border"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // state === "down" or "error"
  return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div className="space-y-3 max-w-lg">
        <h1 className="text-2xl font-semibold">Can’t reach the server</h1>
        <p className="opacity-80">{detail || "Please try again in a moment."}</p>
        <button
          onClick={handleManualRetry}
          className="px-4 py-2 rounded-2xl border"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
