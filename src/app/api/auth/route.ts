import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Password for accessing the CRM
const APP_PASSWORD = process.env.APP_PASSWORD || 'sesame'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === APP_PASSWORD) {
      // Set auth cookie (expires in 30 days)
      const cookieStore = await cookies()
      cookieStore.set('crm-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE() {
  // Logout - clear the auth cookie
  const cookieStore = await cookies()
  cookieStore.delete('crm-auth')
  return NextResponse.json({ success: true })
}
