import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth";
import { projects } from "./routes/projects";
import { courses } from "./routes/courses";
import tasks from "./routes/tasks";
import { teams } from "./routes/teams";
import { authOptional } from "./middleware/auth";
import users from "./routes/users";
import { UPLOADS_DIR } from "./config/path";

dotenv.config();
const app = express();

app.set("trust proxy", 1);

/* ---------------- CORS with wildcard support ---------------- */
const originEnv =
  process.env.ORIGIN || "http://localhost:5173,http://localhost:8080";
const allowList = originEnv
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function isAllowedOrigin(reqOrigin?: string) {
  if (!reqOrigin) return true; // non-browser or same-origin
  let host = "";
  try {
    host = new URL(reqOrigin).host; // e.g. apts-two.vercel.app
  } catch {
    return false;
  }
  return allowList.some(pat => {
    if (pat === reqOrigin) return true; // exact match like https://myapp.com
    if (pat.startsWith("*.")) {
      // wildcard like *.vercel.app
      const domain = pat.slice(2);
      return host === domain || host.endsWith("." + domain);
    }
    // also allow raw host patterns (rare): e.g., vercel.app
    try {
      const u = new URL(pat);
      return u.host === host;
    } catch {
      return host === pat || host.endsWith("." + pat);
    }
  });
}

app.use(
  cors({
    origin: (reqOrigin, cb) =>
      isAllowedOrigin(reqOrigin) ? cb(null, true) : cb(new Error("Not allowed by CORS")),
    credentials: true,
  })
);

/* -------------- Security / parsing / logging ---------------- */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(authOptional);

/* ------------------- Static uploads dir --------------------- */
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOADS_DIR, { index: false }));

/* ------------------------- Routes --------------------------- */
app.use("/api/users", users);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/api/projects", projects);
app.use("/api/courses", courses);
app.use("/api", tasks); // tasks, submissions, files
app.use("/api/teams", teams);

/* -------------------- Error handler ------------------------- */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS: origin not allowed" });
  }
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`APTS server on http://localhost:${port}`));