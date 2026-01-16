import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { memberId } = await request.json()

    // Verify the member exists
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
    })

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Set identity cookie (expires in 30 days)
    const cookieStore = await cookies()
    cookieStore.set('crm-user-id', memberId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return NextResponse.json({ success: true, name: member.name })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get('crm-user-id')

    if (!userIdCookie) {
      return NextResponse.json({ user: null })
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: userIdCookie.value },
      select: {
        id: true,
        name: true,
        email: true,
        color: true,
      },
    })

    return NextResponse.json({ user: member })
  } catch {
    return NextResponse.json({ user: null })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('crm-user-id')
  return NextResponse.json({ success: true })
}
