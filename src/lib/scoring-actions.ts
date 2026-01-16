'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'

// Scoring weights
const SCORE_WEIGHTS = {
  // Social presence (max 30 points)
  hasTelegram: 5,
  hasTwitter: 5,
  hasEmail: 10,
  hasMultipleSocials: 10,
  
  // Engagement (max 40 points)
  hasNotes: 5,
  multipleNotes: 10,
  recentActivity: 15,
  hasReminder: 10,
  
  // Pipeline progress (max 30 points)
  stageProgress: {
    NEW: 0,
    CONTACTED: 5,
    ENGAGED: 15,
    PROPOSAL: 25,
    WON: 30,
    LOST: 0,
  },
}

export async function calculateLeadScore(leadId: string): Promise<number> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      notes: true,
      reminders: { where: { completed: false } },
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!lead) return 0

  let score = 0

  // Social presence scoring
  const socials = [lead.telegram, lead.twitter, lead.farcaster, lead.tiktok, 
    lead.youtube, lead.twitch, lead.instagram, lead.email].filter(Boolean)
  
  if (lead.telegram) score += SCORE_WEIGHTS.hasTelegram
  if (lead.twitter) score += SCORE_WEIGHTS.hasTwitter
  if (lead.email) score += SCORE_WEIGHTS.hasEmail
  if (socials.length >= 3) score += SCORE_WEIGHTS.hasMultipleSocials

  // Engagement scoring
  if (lead.notes.length > 0) score += SCORE_WEIGHTS.hasNotes
  if (lead.notes.length >= 3) score += SCORE_WEIGHTS.multipleNotes
  if (lead.reminders.length > 0) score += SCORE_WEIGHTS.hasReminder
  
  // Recent activity (within 7 days)
  if (lead.activities.length > 0) {
    const lastActivity = lead.activities[0]
    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSince <= 7) score += SCORE_WEIGHTS.recentActivity
  }

  // Stage progress
  const stageScore = SCORE_WEIGHTS.stageProgress[lead.stage as keyof typeof SCORE_WEIGHTS.stageProgress] || 0
  score += stageScore

  // Cap at 100
  return Math.min(score, 100)
}

export async function updateLeadScore(leadId: string) {
  const score = await calculateLeadScore(leadId)
  
  await prisma.lead.update({
    where: { id: leadId },
    data: { score },
  })
  
  revalidatePath('/')
  return score
}

export async function updateAllLeadScores() {
  const leads = await prisma.lead.findMany({
    where: { archived: false },
    select: { id: true },
  })

  for (const lead of leads) {
    await updateLeadScore(lead.id)
  }

  revalidatePath('/')
}

export async function toggleHotLead(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { isHot: true },
  })

  if (!lead) return

  await prisma.lead.update({
    where: { id: leadId },
    data: { isHot: !lead.isHot },
  })

  revalidatePath('/')
}

export async function getHotLeads() {
  return prisma.lead.findMany({
    where: { 
      archived: false,
      OR: [
        { isHot: true },
        { score: { gte: 70 } },
      ],
    },
    include: {
      assignee: true,
      tags: true,
    },
    orderBy: { score: 'desc' },
  })
}
