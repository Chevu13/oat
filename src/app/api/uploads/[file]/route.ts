import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, imageKey } from "@/lib/data/demo-store";
import { redis, redisEnabled } from "@/lib/data/redis";

// Serves admin-uploaded images in demo mode (files added after build aren't served from /public).
const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

export async function GET(_req: Request, ctx: RouteContext<"/api/uploads/[file]">) {
  const { file } = await ctx.params;
  const m = /^([0-9a-f-]{36})\.(jpg|png|webp|avif)$/.exec(file);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const buf = redisEnabled ? Buffer.from((await redis<string | null>("GET", imageKey(file))) ?? "", "base64") : await fs.readFile(path.join(UPLOAD_DIR, file));
    if (!buf.length) throw new Error("missing");
    return new Response(buf, { headers: { "content-type": TYPES[m[2]], "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
