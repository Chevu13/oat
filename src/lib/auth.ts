import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { io } from "next/cache";

// Demo admin auth: one account from env (ADMIN_EMAIL / ADMIN_PASSWORD), HMAC-signed httpOnly cookie.
// Replaced by Supabase Auth when the real backend is connected.
export const SESSION_COOKIE = "ob_admin";
const MAX_AGE = 60 * 60 * 12; // 12h

const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET (min. 32 karaktera) nije podešen.");
  return s;
};
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigured = () =>
  Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && (process.env.SESSION_SECRET?.length ?? 0) >= 32);

export function checkCredentials(email: string, password: string) {
  if (!adminConfigured()) return false;
  // Evaluate both so timing doesn't reveal which one was wrong.
  const okEmail = safeEqual(email.trim().toLowerCase(), process.env.ADMIN_EMAIL!.toLowerCase());
  const okPass = safeEqual(password, process.env.ADMIN_PASSWORD!);
  return okEmail && okPass;
}

export async function createSession() {
  const payload = Buffer.from(JSON.stringify({ sub: process.env.ADMIN_EMAIL, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getAdmin(): Promise<{ email: string } | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw || !adminConfigured()) return null;
  await io(); // expiry check reads the clock — keep it out of prerendering
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return exp > Date.now() && sub === process.env.ADMIN_EMAIL ? { email: sub } : null;
  } catch {
    return null;
  }
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/prijava");
  return admin;
}
