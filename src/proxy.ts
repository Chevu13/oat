import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate only: bounce visitors without a session cookie. Real verification
// (signature + expiry) happens in requireAdmin() on every admin page and action.
export function proxy(req: NextRequest) {
  if (process.env.ADMIN_REQUIRE_LOGIN !== "true") return NextResponse.next(); // open demo admin
  if (req.nextUrl.pathname.startsWith("/admin/prijava")) return NextResponse.next();
  if (!req.cookies.has("ob_admin")) return NextResponse.redirect(new URL("/admin/prijava", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
