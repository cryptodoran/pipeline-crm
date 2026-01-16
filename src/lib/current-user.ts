'use server'

import { cookies } from 'next/headers'
import { prisma } from './db'

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get('crm-user-id')
  return userIdCookie?.value || null
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return null
  }

  return prisma.teamMember.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      color: true,
    },
  })
}
