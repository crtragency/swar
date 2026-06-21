import { NextResponse, type NextRequest } from "next/server";

// Serves the admin dashboard on the `admin.` subdomain, fully separate from
// the public site. Point e.g. admin.yourdomain.com at this same deployment.
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  if (host.startsWith("admin.")) {
    // let API calls and assets pass through untouched
    if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/icon")) {
      return NextResponse.next();
    }
    if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
