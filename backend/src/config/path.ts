import path from "path";

export const UPLOADS_DIR =
  process.env.UPLOADS_DIR ||
  (process.env.RENDER ? "/data/uploads" : path.join(process.cwd(), "uploads"));