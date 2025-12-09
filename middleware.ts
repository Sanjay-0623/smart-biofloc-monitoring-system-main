import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path.startsWith("/auth/") ||
    path.startsWith("/_next") ||
    path.startsWith("/api/auth/") ||
    path === "/api/predict" ||
    path.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("biofloc_session")

  if (!sessionCookie) {
    console.log("[v0] No session, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Validate session is not expired
  try {
    const session = JSON.parse(atob(sessionCookie.value))
    if (session.exp < Date.now()) {
      console.log("[v0] Session expired, redirecting to login")
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  } catch (error) {
    console.log("[v0] Invalid session, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
