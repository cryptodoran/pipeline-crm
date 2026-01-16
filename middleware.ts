import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/team-members') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('crm-auth')

  if (!authCookie || authCookie.value !== 'authenticated') {
    // Not authenticated - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // /select-identity only needs auth, not identity
  if (pathname === '/select-identity') {
    return NextResponse.next()
  }

  // Check for identity cookie
  const identityCookie = request.cookies.get('crm-user-id')

  if (!identityCookie || !identityCookie.value) {
    // No identity selected - redirect to identity selection
    return NextResponse.redirect(new URL('/select-identity', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
