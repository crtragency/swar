import { NextResponse, type NextRequest } from "next/server";

// Serves the admin dashboard on the `admin.` subdomain, fully separate from
// the public site. Point e.g. admin.yourdomain.com at this same deployment.
// Old locale-prefixed URLs (/ar, /en, /ar/*, /en/*) → redirect to the
// unprefixed equivalent so Google-indexed links don't 404.
const LOCALE_RE = /^\/(ar|en)(\/.*)?$/;

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  // Admin subdomain rewrite
  if (host.startsWith("admin.")) {
    if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/icon")) {
      return NextResponse.next();
    }
    if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
  }

  // Redirect /ar → /, /ar/booking → /booking, /en/... → /... (308 permanent)
  const localeMatch = pathname.match(LOCALE_RE);
  if (localeMatch) {
    const rest = localeMatch[2] || "/";
    const url = req.nextUrl.clone();
    url.pathname = rest;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
