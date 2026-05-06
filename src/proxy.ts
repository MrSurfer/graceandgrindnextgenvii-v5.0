import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isTeacherRoute = nextUrl.pathname.startsWith("/dashboard/teacher");
  const isProfileRoute = nextUrl.pathname.startsWith("/profile");

  // Protect routes
  if (isAdminRoute || isTeacherRoute || isProfileRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    const userRole = (req.auth?.user as any)?.role;

    // Admin authorization
    if (isAdminRoute && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Teacher Route Protection (Includes Admin & Super Admin)
    if (isTeacherRoute && userRole !== "TEACHER" && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/teacher/:path*", "/profile/:path*"],
};
