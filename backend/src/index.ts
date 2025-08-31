// server/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth";
import { projects } from "./routes/projects";
import { courses } from "./routes/courses";
import tasks from "./routes/tasks";
import { teams } from "./routes/teams";
import { authOptional } from "./middleware/auth"; // ⬅️ add
import users from "./routes/users"; // <- add

dotenv.config();
const app = express();

const origin = process.env.ORIGIN || "http://localhost:8080";
app.use(cors({ origin, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ⬅️ make sure every request gets req.auth if cookies are present
app.use(authOptional);

// serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")
// ,{
//     index: false,
//     // optional: set stronger cache/control headers if you want
//     setHeaders(res, filePath) {
//       // Basic type will be set by express.static; you can add security headers here
//       res.setHeader("Cross-Origin-Resource-Policy", "same-site");
//     },
// }
));

app.use("/api/users", users);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);

app.use("/api/projects", projects);
app.use("/api/courses", courses);
app.use("/api", tasks);     // /api/projects/:projectId/tasks, /api/tasks/:id, /api/tasks/:id/submit
app.use("/api/teams", teams);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`APTS server on http://localhost:${port}`));