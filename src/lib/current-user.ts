'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './db'

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('crm-auth')
  return authCookie?.value === 'authenticated'
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/login')
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get('crm-user-id')
  return userIdCookie?.value || null
}

export async function requireIdentity(): Promise<string> {
  await requireAuth()
  const userId = await getCurrentUserId()
  if (!userId) {
    redirect('/select-identity')
  }
  return userId
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
