'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'
import { ACTIVITY_TYPES, type ActivityType } from './activity-types'

export async function createActivity(data: {
  leadId: string
  type: ActivityType
  description?: string
  metadata?: Record<string, unknown>
  authorId?: string
}) {
  const activity = await prisma.activity.create({
    data: {
      leadId: data.leadId,
      type: data.type,
      description: data.description || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      authorId: data.authorId || null,
    },
  })
  revalidatePath('/')
  revalidatePath('/activity')
  return activity
}

export async function logQuickAction(
  leadId: string,
  type: ActivityType,
  authorId?: string
) {
  return createActivity({
    leadId,
    type,
    authorId,
    description: ACTIVITY_TYPES[type].label,
  })
}

export async function getLeadActivities(leadId: string) {
  return prisma.activity.findMany({
    where: { leadId },
    include: {
      author: true,
      lead: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRecentActivities(limit = 50) {
  return prisma.activity.findMany({
    include: {
      author: true,
      lead: {
        select: { id: true, name: true, stage: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getActivityStats(days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const activities = await prisma.activity.groupBy({
    by: ['type'],
    where: {
      createdAt: { gte: since },
    },
    _count: true,
  })

  return activities.map(a => ({
    type: a.type,
    count: a._count,
  }))
}

export async function getTeamActivityStats(days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const activities = await prisma.activity.groupBy({
    by: ['authorId'],
    where: {
      createdAt: { gte: since },
      authorId: { not: null },
    },
    _count: true,
  })

  // Get team member names
  const memberIds = activities.map(a => a.authorId).filter(Boolean) as string[]
  const members = await prisma.teamMember.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, name: true },
  })

  const memberMap = Object.fromEntries(members.map(m => [m.id, m.name]))

  return activities.map(a => ({
    memberId: a.authorId,
    memberName: memberMap[a.authorId!] || 'Unknown',
    count: a._count,
  }))
}

export async function deleteActivity(id: string) {
  await prisma.activity.delete({
    where: { id },
  })
  revalidatePath('/')
  revalidatePath('/activity')
}
