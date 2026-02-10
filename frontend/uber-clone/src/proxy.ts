import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const role = request.cookies.get("ride-role")?.value;
  const hasRole = role === "rider" || role === "captain";
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!hasRole && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasRole && isPublic) {
    const destination = role === "captain" ? "/captain" : "/ride";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (hasRole && pathname.startsWith("/captain") && role !== "captain") {
    return NextResponse.redirect(new URL("/ride", request.url));
  }

  if (hasRole && pathname.startsWith("/ride") && role === "captain") {
    return NextResponse.redirect(new URL("/captain", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
