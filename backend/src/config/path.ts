import path from "path";

export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ||
  (process.env.RENDER ? "/tmp/uploads" : path.join(process.cwd(), "uploads"));