import { NextResponse, NextRequest } from "next/server";
import { UserRole } from "@/types/auth";

export function getDefaultDashboardRoute(role?: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/dashboard/super-admin";
    case "ADMIN":
      return "/dashboard/admin";
    case "SHIFTER":
      return "/dashboard/shifter";
    case "MEMBER":
    default:
      return "/dashboard/member";
  }
}

function decodeJwtPayload(token: string): { role?: UserRole; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Explicit list of public routes that must never trigger authentication checks or redirects
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/books",
  "/cart",
  "/checkout",
  "/wishlist",
  "/donate",
  "/gallery",
  "/blogs",
  "/about",
  "/contact",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathWithQuery = `${pathname}${search}`;

  // 1. Bypass static files, internal Next.js assets, icons, and media files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") // matches static file extensions (.png, .svg, etc.)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("accessToken")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;
  const isExpired = decoded?.exp ? decoded.exp * 1000 < Date.now() : false;
  const isAuthenticated = Boolean(token && decoded && !isExpired);
  const userRole = decoded?.role;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // 2. If authenticated user visits login or register page, redirect to their role-specific dashboard
  if (isAuthPage) {
    if (isAuthenticated && userRole) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole), request.url)
      );
    }
    return NextResponse.next();
  }

  // 3. For any public route (or dynamic sub-route like /books/[id], /blogs/[id]), let it pass immediately
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isDashboardPage && isPublicRoute) {
    return NextResponse.next();
  }

  // 4. Protect dashboard routes: if not authenticated, redirect to /login
  if (isDashboardPage && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathWithQuery);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-based authorization guard within dashboard routes
  if (isDashboardPage && isAuthenticated && userRole) {
    if (pathname.startsWith("/dashboard/super-admin") && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole), request.url)
      );
    }

    if (
      pathname.startsWith("/dashboard/admin") &&
      userRole !== "SUPER_ADMIN" &&
      userRole !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole), request.url)
      );
    }

    if (
      pathname.startsWith("/dashboard/shifter") &&
      userRole !== "SUPER_ADMIN" &&
      userRole !== "ADMIN" &&
      userRole !== "SHIFTER"
    ) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole), request.url)
      );
    }

    if (
      pathname.startsWith("/dashboard/member") &&
      userRole !== "MEMBER" &&
      userRole !== "SUPER_ADMIN" &&
      userRole !== "ADMIN" &&
      userRole !== "SHIFTER"
    ) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole), request.url)
      );
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};


