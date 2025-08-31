import { Router } from "express";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

export const users = Router();

// ---------- uploads (avatar) ----------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

/**
 * All routes here require a logged-in user.
 * Any role is fine; use requireRole to enforce auth.
 */
users.use(requireRole("ADMIN", "TEACHER", "STUDENT"));

// GET /api/users/me
users.get("/me", async (req: any, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  });
  res.json(me);
});

// PATCH /api/users/me (update profile fields)
const PatchBody = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(), // optional: allow manual URL (CDN)
});
users.patch("/me", async (req: any, res) => {
  const parsed = PatchBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const updated = await prisma.user.update({
    where: { id: req.auth.userId },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  });
  res.json(updated);
});

// POST /api/users/me/avatar  (multipart: avatar)
users.post("/me/avatar", upload.single("avatar"), async (req: any, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const avatarUrl = `/uploads/${req.file.filename}`;
  const updated = await prisma.user.update({
    where: { id: req.auth.userId },
    data: { avatarUrl },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  });

  res.status(201).json({ avatarUrl: updated.avatarUrl });
});

// POST /api/users/change-password
const ChangePw = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});
users.post("/change-password", async (req: any, res) => {
  const parsed = ChangePw.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Current password is incorrect" });

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ ok: true });
});

export default users;