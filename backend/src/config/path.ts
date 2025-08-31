// server/src/config/paths.ts
import path from "path";

/**
 * Single source of truth for where uploads live on disk.
 * If UPLOADS_DIR is unset, default to /tmp/uploads (works on Render & locally).
 */
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join("/tmp", "uploads");