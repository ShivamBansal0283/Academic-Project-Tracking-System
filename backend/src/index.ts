// // server/index.ts
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import path from "path";

// import authRoutes from "./routes/auth";
// import { projects } from "./routes/projects";
// import { courses } from "./routes/courses";
// import tasks from "./routes/tasks";
// import { teams } from "./routes/teams";
// import { authOptional } from "./middleware/auth"; // ⬅️ add
// import users from "./routes/users"; // <- add

// dotenv.config();
// const app = express();

// const origin = process.env.ORIGIN || "http://localhost:8080";
// app.use(cors({ origin, credentials: true }));
// app.use(helmet());
// app.use(express.json({ limit: "2mb" }));
// app.use(cookieParser());
// app.use(morgan("dev"));

// // ⬅️ make sure every request gets req.auth if cookies are present
// app.use(authOptional);

// // serve uploaded files
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")
// // ,{
// //     index: false,
// //     // optional: set stronger cache/control headers if you want
// //     setHeaders(res, filePath) {
// //       // Basic type will be set by express.static; you can add security headers here
// //       res.setHeader("Cross-Origin-Resource-Policy", "same-site");
// //     },
// // }
// ));

// app.use("/api/users", users);

// app.get("/health", (_req, res) => res.json({ status: "ok" }));

// app.use("/auth", authRoutes);

// app.use("/api/projects", projects);
// app.use("/api/courses", courses);
// app.use("/api", tasks);     // /api/projects/:projectId/tasks, /api/tasks/:id, /api/tasks/:id/submit
// app.use("/api/teams", teams);

// const port = Number(process.env.PORT || 4000);
// app.listen(port, () => console.log(`APTS server on http://localhost:${port}`));




// server/index.ts
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

dotenv.config();
const app = express();

// behind a proxy (Render/Heroku/etc.) so secure cookies work
app.set("trust proxy", 1);

// ---- CORS (allow multiple origins via ORIGIN env, comma-separated)
const originEnv =
  process.env.ORIGIN || "http://localhost:5173,http://localhost:8080";
const allowedOrigins = originEnv.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: (reqOrigin, cb) => {
      if (!reqOrigin) return cb(null, true); // non-browser / server-to-server
      if (allowedOrigins.includes(reqOrigin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Loosen CORP so files served from /uploads can be accessed cross-origin
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// attach req.auth when cookies are present
app.use(authOptional);

// ---- Static uploads (configurable + persistent-disk friendly)
const uploadsDir = process.env.UPLOADS_DIR || path.join("/tmp", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(
  "/uploads",
  express.static(uploadsDir, {
    index: false,
  })
);

// ---- Routes
app.use("/api/users", users);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/api/projects", projects);
app.use("/api/courses", courses);
app.use("/api", tasks); // /api/projects/:projectId/tasks, /api/tasks/:id, /api/tasks/:id/submit, /api/submissions/:id/evaluate
app.use("/api/teams", teams);

// ---- Basic error handler (incl. CORS origin errors)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS: origin not allowed" });
  }
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`APTS server on http://localhost:${port}`));