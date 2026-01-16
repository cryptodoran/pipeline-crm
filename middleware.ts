import { NextRequest, NextResponse } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth', '/api/team-members']

// Routes that require auth but not identity
const authOnlyRoutes = ['/select-identity']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('crm-auth')

  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Auth-only routes don't need identity check
  if (authOnlyRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for identity cookie
  const identityCookie = request.cookies.get('crm-user-id')

  if (!identityCookie) {
    // Redirect to identity selection
    const identityUrl = new URL('/select-identity', request.url)
    return NextResponse.redirect(identityUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
