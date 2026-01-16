import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for auth cookie
  const authCookie = request.cookies.get('crm-auth')
  const isAuthenticated = authCookie?.value === 'authenticated'

  // Allow login page and auth API
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    // If already authenticated, redirect away from login
    if (pathname === '/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Allow team-members API (needed for identity selection)
  if (pathname.startsWith('/api/team-members')) {
    return NextResponse.next()
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow identity selection page
  if (pathname === '/select-identity') {
    return NextResponse.next()
  }

  // Check for identity cookie
  const identityCookie = request.cookies.get('crm-user-id')
  if (!identityCookie?.value) {
    return NextResponse.redirect(new URL('/select-identity', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
