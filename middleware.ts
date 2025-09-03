import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  console.log("Middleware called for path:", pathname)
  console.log("Token found:", token ? `Yes (${token.substring(0, 20)}...)` : "No")

  // Rutas que requieren autenticación
  const protectedRoutes = ["/user-dashboard", "/admin-dashboard"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!token) {
      console.log("No token found, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const decoded = await verifyToken(token) as any
    if (!decoded) {
      console.log("Invalid token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("Valid token found for user:", decoded.email, "role:", decoded.role)

    // Verificar permisos de rol
    if (pathname.startsWith("/admin-dashboard") && decoded.role !== "admin") {
      console.log("Non-admin trying to access admin dashboard, redirecting to user dashboard")
      return NextResponse.redirect(new URL("/user-dashboard", request.url))
    }
  }

  // Redirigir usuarios autenticados desde login
  if (pathname === "/login" && token) {
    const decoded = await verifyToken(token) as any
    if (decoded) {
      const redirectTo = decoded.role === "admin" ? "/admin-dashboard" : "/user-dashboard"
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/user-dashboard/:path*", "/admin-dashboard/:path*", "/login"],
}
