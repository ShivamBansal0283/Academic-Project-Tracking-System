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
import { UPLOADS_DIR } from "./config/paths";   // ⬅️ add

dotenv.config();
const app = express();

app.set("trust proxy", 1);

// CORS (comma-separated ORIGIN)
const originEnv = process.env.ORIGIN || "http://localhost:5173,http://localhost:8080";
const allowedOrigins = originEnv.split(",").map(s => s.trim());
app.use(
  cors({
    origin: (reqOrigin, cb) => {
      if (!reqOrigin) return cb(null, true);
      if (allowedOrigins.includes(reqOrigin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Helmet: allow cross-origin resource policy for /uploads
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(authOptional);

// Ensure uploads dir exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Serve files from the same dir the uploader writes to
app.use("/uploads", express.static(UPLOADS_DIR, { index: false }));

// Routes
app.use("/api/users", users);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/api/projects", projects);
app.use("/api/courses", courses);
app.use("/api", tasks); // tasks, submissions, files
app.use("/api/teams", teams);

// Basic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS: origin not allowed" });
  }
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`APTS server on http://localhost:${port}`));