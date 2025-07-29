import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Middleware maison : redirige les utilisateurs non authentifiés
 * vers la page de connexion (/) pour toutes les routes protégées.
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuth = !!token
  const { pathname } = req.nextUrl

  // Liste des préfixes protégés
  const protectedPrefixes = [
    "/dashboard",
    "/terrains",
    "/analytics",
    "/api/terrains",
    "/api/analytics",
    "/api/init",
    "/api/profile",
  ]

  const requiresAuth = protectedPrefixes.some((p) => pathname.startsWith(p))

  // Allow registration and email verification without authentication
  const isAuthRoute = pathname.startsWith("/api/auth/register") || pathname.startsWith("/api/auth/verify-email")

  if (requiresAuth && !isAuth && !isAuthRoute) {
    const redirectURL = req.nextUrl.clone()
    redirectURL.pathname = "/"
    return NextResponse.redirect(redirectURL)
  }

  return NextResponse.next()
}

/**
 * Matcher : mêmes chemins que précédemment mais sans `withAuth`.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/terrains/:path*",
    "/analytics/:path*",
    "/profile/:path*", // New protected profile route
    "/api/terrains/:path*",
    "/api/analytics/:path*",
    "/api/init",
    "/api/profile/:path*", // New protected profile API route
    "/api/auth/register", // Allow registration POST request
    "/api/auth/verify-email", // Allow email verification GET request
  ],
}
