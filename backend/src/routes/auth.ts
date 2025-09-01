import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
// IMPORTANT: choose the right import depending on your tsconfig
// If esModuleInterop: true -> default import; else use the * import
import jwt from "jsonwebtoken"; // or: import * as jwt from "jsonwebtoken";

const router = Router();

/** Parse env TTL like "15m", "7d", "3600" into seconds (number). */
function parseTtlSeconds(val: string | undefined, fallback: number): number {
  if (!val) return fallback;
  if (/^\d+$/.test(val)) return Number(val); // already seconds
  const m = /^(\d+)([smhd])$/.exec(val);
  if (!m) return fallback;
  const n = Number(m[1]);
  const mul = m[2] === "s" ? 1 : m[2] === "m" ? 60 : m[2] === "h" ? 3600 : 86400;
  return n * mul;
}

const ACCESS_TTL_SEC = parseTtlSeconds(process.env.ACCESS_TTL, 15 * 60);
const REFRESH_TTL_SEC = parseTtlSeconds(process.env.REFRESH_TTL, 7 * 24 * 3600);

const ACCESS_NAME = process.env.ACCESS_COOKIE || "at";
const REFRESH_NAME = process.env.REFRESH_COOKIE || "rt";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-dev";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-dev";
const COOKIE_SECURE = (process.env.COOKIE_SECURE || "false") === "true";

const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE || "none") as
  | "lax"
  | "strict"
  | "none";

function setTokens(res: any, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_NAME, accessToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "none",
    path: "/",
    maxAge: ACCESS_TTL_SEC * 1000,
  });
  res.cookie(REFRESH_NAME, refreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "none",
    path: "/",
    maxAge: REFRESH_TTL_SEC * 1000,
  });
}

function clearTokens(res: any) {
  const base = {
    path: "/",
    sameSite: "none" as const,
    secure: COOKIE_SECURE,
    // domain: "<your domain>" // only if you set one when creating cookies
  };
  res.clearCookie(ACCESS_NAME, base);
  res.clearCookie(REFRESH_NAME, base);
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// helper to keep types happy with options
function signJwt(
  payload: object,
  secret: string,
  expiresInSeconds: number
): string {
  return jwt.sign(payload, secret, { expiresIn: expiresInSeconds });
}

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      passwordHash: true,
    },
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signJwt(payload, ACCESS_SECRET, ACCESS_TTL_SEC);
  const refreshToken = signJwt(payload, REFRESH_SECRET, REFRESH_TTL_SEC);

  setTokens(res, accessToken, refreshToken);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
    },
  });
});

router.post("/logout", (req, res) => {
  clearTokens(res);
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const raw = req.cookies?.[ACCESS_NAME];
  if (!raw) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const payload = jwt.verify(raw, ACCESS_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
    if (!user) return res.status(401).json({ error: "Unauthenticated" });
    res.json({ user });
  } catch {
    return res.status(401).json({ error: "Unauthenticated" });
  }
});

router.post("/refresh", (req, res) => {
  const raw = req.cookies?.[REFRESH_NAME];
  if (!raw) return res.status(401).json({ error: "Unauthenticated" });
  try {
    const payload = jwt.verify(raw, REFRESH_SECRET) as any;
    const newAccess = signJwt(
      { sub: payload.sub, role: payload.role, email: payload.email },
      ACCESS_SECRET,
      ACCESS_TTL_SEC
    );
    const newRefresh = signJwt(
      { sub: payload.sub, role: payload.role, email: payload.email },
      REFRESH_SECRET,
      REFRESH_TTL_SEC
    );
    setTokens(res, newAccess, newRefresh);
    res.json({ ok: true });
  } catch {
    clearTokens(res);
    res.status(401).json({ error: "Unauthenticated" });
  }
});

export default router;