// import type { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// const ACCESS_NAME = process.env.ACCESS_COOKIE || "at";
// const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-dev";

// export interface AuthUser {
//   userId: string;
//   role: "ADMIN" | "TEACHER" | "STUDENT";
//   email?: string;
// }

// declare global {
//   namespace Express {
//     interface Request {
//       auth?: AuthUser;
//     }
//   }
// }

// export function authOptional(req: Request, _res: Response, next: NextFunction) {
//   const token = (req.cookies && req.cookies[ACCESS_NAME]) as string | undefined;
//   if (token) {
//     try {
//       const p = jwt.verify(token, ACCESS_SECRET) as any;
//       req.auth = { userId: p.sub, role: p.role, email: p.email };
//     } catch { /* ignore */ }
//   }
//   next();
// }

// export function requireRole(...roles: AuthUser["role"][]) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.auth) return res.status(401).json({ error: "Unauthorized" });
//     if (!roles.includes(req.auth.role)) return res.status(403).json({ error: "Forbidden" });
//     next();
//   };
// }

// server/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_NAME = process.env.ACCESS_COOKIE || "at";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-dev";

export interface AuthUser {
  userId: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_NAME] as string | undefined;
  if (token) {
    try {
      const p = jwt.verify(token, ACCESS_SECRET) as any;
      req.auth = { userId: p.sub, role: p.role, email: p.email };
    } catch {
      // ignore
    }
  }
  next();
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Verify the access token right here so we don’t depend on authOptional
    const token = req.cookies?.[ACCESS_NAME] as string | undefined;
    if (!token) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const p = jwt.verify(token, ACCESS_SECRET) as any;
      req.auth = { userId: p.sub, role: p.role, email: p.email };

      if (roles.length && !roles.includes(req.auth.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    } catch {
      return res.status(401).json({ error: "Unauthenticated" });
    }
  };
}