import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        color: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    return NextResponse.json([], { status: 500 })
  }
}
