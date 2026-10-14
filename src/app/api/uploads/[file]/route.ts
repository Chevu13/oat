import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/data/demo-store";

// Serves admin-uploaded images in demo mode (files added after build aren't served from /public).
const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

export async function GET(_req: Request, ctx: RouteContext<"/api/uploads/[file]">) {
  const { file } = await ctx.params;
  const m = /^([0-9a-f-]{36})\.(jpg|png|webp|avif)$/.exec(file);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(buf, { headers: { "content-type": TYPES[m[2]], "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
