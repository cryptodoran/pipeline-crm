'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'
import { PipelineStage } from './types'
import {
  createLeadSchema,
  updateLeadSchema,
  addNoteSchema,
  createTeamMemberSchema,
  createTagSchema,
  updateTagSchema,
  createReminderSchema,
  bulkAssignSchema,
  bulkMoveSchema,
  importLeadSchema,
} from './schemas'
import { z } from 'zod'

// ============================================================================
// DUPLICATE DETECTION HELPERS
// ============================================================================

function normalizeForComparison(value: string | null | undefined): string | null {
  if (!value) return null
  // Strip leading @ for social handles, then lowercase and trim
  return value.trim().replace(/^@/, '').toLowerCase() || null
}

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  return digits || null
}

export async function checkDuplicates(data: {
  name?: string
  email?: string
  altEmail?: string
  phone?: string
  twitter?: string
  telegram?: string
  discord?: string
  linkedin?: string
  instagram?: string
  farcaster?: string
}) {
  const orConditions: Record<string, unknown>[] = []

  // Email cross-matching: check new email/altEmail against both email and altEmail columns
  const emailValues = [data.email, data.altEmail]
    .map(v => v?.trim())
    .filter((v): v is string => !!v)

  for (const emailVal of emailValues) {
    orConditions.push({ email: { equals: emailVal, mode: 'insensitive' as const } })
    orConditions.push({ altEmail: { equals: emailVal, mode: 'insensitive' as const } })
  }

  // Phone: normalize and compare
  const normalizedPhone = normalizePhone(data.phone)
  if (normalizedPhone) {
    // We'll filter phone matches in JS after fetching since we need digit-only comparison
    // But we can still include a raw match for indexing help
    orConditions.push({ phone: { not: null } })
  }

  // Social handles with normalization (strip @, case-insensitive)
  // Search for both with and without @ prefix since DB values may vary
  const socialFields = ['twitter', 'telegram', 'discord', 'linkedin', 'instagram', 'farcaster'] as const
  for (const field of socialFields) {
    const normalized = normalizeForComparison(data[field])
    if (normalized) {
      orConditions.push({ [field]: { equals: normalized, mode: 'insensitive' as const } })
      orConditions.push({ [field]: { equals: `@${normalized}`, mode: 'insensitive' as const } })
    }
  }

  // Name: case-insensitive exact match
  if (data.name?.trim()) {
    orConditions.push({ name: { equals: data.name.trim(), mode: 'insensitive' as const } })
  }

  if (orConditions.length === 0) return []

  const matches = await prisma.lead.findMany({
    where: {
      archived: false,
      OR: orConditions,
    },
    include: {
      assignee: true,
    },
    take: 50, // Fetch more than needed so we can filter phone matches
  })

  // Now determine which fields actually matched for each result
  type MatchResult = {
    id: string
    name: string
    stage: string
    assigneeName: string | null
    matchedFields: string[]
  }

  const results: MatchResult[] = []

  for (const match of matches) {
    const matchedFields: string[] = []

    // Check email cross-matches
    for (const emailVal of emailValues) {
      if (match.email && match.email.toLowerCase() === emailVal.toLowerCase()) {
        matchedFields.push('email')
      }
      if (match.altEmail && match.altEmail.toLowerCase() === emailVal.toLowerCase()) {
        matchedFields.push('altEmail')
      }
    }

    // Check phone (digit-only comparison)
    if (normalizedPhone && match.phone) {
      const matchPhone = normalizePhone(match.phone)
      if (matchPhone === normalizedPhone) {
        matchedFields.push('phone')
      }
    }

    // Check social handles
    for (const field of socialFields) {
      const inputNorm = normalizeForComparison(data[field])
      const matchNorm = normalizeForComparison(match[field])
      if (inputNorm && matchNorm && inputNorm === matchNorm) {
        matchedFields.push(field)
      }
    }

    // Check name
    if (data.name?.trim() && match.name.toLowerCase() === data.name.trim().toLowerCase()) {
      matchedFields.push('name')
    }

    // Only include if there's an actual field match (phone OR query may have produced false positives)
    if (matchedFields.length > 0) {
      results.push({
        id: match.id,
        name: match.name,
        stage: match.stage,
        assigneeName: match.assignee?.name || null,
        matchedFields: Array.from(new Set(matchedFields)),
      })
    }
  }

  return results.slice(0, 10)
}

export async function sweepDuplicates(): Promise<{ duplicateCount: number; groupCount: number }> {
  const leads = await prisma.lead.findMany({
    where: { archived: false },
    select: {
      id: true,
      name: true,
      email: true,
      altEmail: true,
      phone: true,
      twitter: true,
      telegram: true,
      discord: true,
      linkedin: true,
      instagram: true,
      farcaster: true,
    },
  })

  // Build a hash map: normalized value -> set of lead IDs
  const valueToLeadIds = new Map<string, Set<string>>()

  function addToMap(key: string, value: string | null | undefined, leadId: string) {
    if (!value) return
    let normalized: string | null
    if (key === 'phone') {
      normalized = normalizePhone(value)
    } else {
      normalized = normalizeForComparison(value)
    }
    if (!normalized) return

    const mapKey = `${key}:${normalized}`
    if (!valueToLeadIds.has(mapKey)) {
      valueToLeadIds.set(mapKey, new Set())
    }
    valueToLeadIds.get(mapKey)!.add(leadId)
  }

  for (const lead of leads) {
    addToMap('name', lead.name, lead.id)
    // Cross-match emails: both email and altEmail go into the same "email" bucket
    addToMap('email', lead.email, lead.id)
    addToMap('email', lead.altEmail, lead.id)
    addToMap('phone', lead.phone, lead.id)
    addToMap('twitter', lead.twitter, lead.id)
    addToMap('telegram', lead.telegram, lead.id)
    addToMap('discord', lead.discord, lead.id)
    addToMap('linkedin', lead.linkedin, lead.id)
    addToMap('instagram', lead.instagram, lead.id)
    addToMap('farcaster', lead.farcaster, lead.id)
  }

  // Find all lead IDs that share at least one value with another lead
  const duplicateLeadIds = new Set<string>()
  let groupCount = 0

  Array.from(valueToLeadIds.values()).forEach(leadIds => {
    if (leadIds.size > 1) {
      groupCount++
      Array.from(leadIds).forEach(id => {
        duplicateLeadIds.add(id)
      })
    }
  })

  // Create or find the "Possible Duplicate" tag
  let tag = await prisma.tag.findFirst({
    where: { name: 'Possible Duplicate' },
  })
  if (!tag) {
    tag = await prisma.tag.create({
      data: { name: 'Possible Duplicate', color: '#f59e0b' },
    })
  }

  const duplicateIdArray = Array.from(duplicateLeadIds)

  // Apply tag to duplicates
  for (const leadId of duplicateIdArray) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        tags: { connect: { id: tag.id } },
      },
    }).catch(() => {
      // Ignore if already connected
    })
  }

  // Remove tag from non-duplicates (leads that currently have the tag but are not in duplicateLeadIds)
  const nonDuplicateIds = leads
    .map(l => l.id)
    .filter(id => !duplicateLeadIds.has(id))

  for (const leadId of nonDuplicateIds) {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        tags: { disconnect: { id: tag.id } },
      },
    }).catch(() => {
      // Ignore if not connected
    })
  }

  revalidatePath('/')
  return { duplicateCount: duplicateLeadIds.size, groupCount }
}

// ============================================================================
// LEAD ACTIONS
// ============================================================================

export async function createLead(data: {
  name: string
  telegram?: string
  twitter?: string
  farcaster?: string
  tiktok?: string
  youtube?: string
  twitch?: string
  instagram?: string
  email?: string
  altEmail?: string
  discord?: string
  phone?: string
  website?: string
  linkedin?: string
  pitchAngle?: string
  assigneeId?: string
  source?: string
  stage?: string
  initialNote?: string
  authorId?: string // Current user ID for note authorship
}) {
  // Validate input
  const validated = createLeadSchema.parse(data)

  const lead = await prisma.lead.create({
    data: {
      name: validated.name,
      telegram: validated.telegram || null,
      twitter: validated.twitter || null,
      farcaster: validated.farcaster || null,
      tiktok: validated.tiktok || null,
      youtube: validated.youtube || null,
      twitch: validated.twitch || null,
      instagram: validated.instagram || null,
      email: validated.email || null,
      altEmail: validated.altEmail || null,
      discord: validated.discord || null,
      phone: validated.phone || null,
      website: validated.website || null,
      linkedin: validated.linkedin || null,
      pitchAngle: validated.pitchAngle || null,
      assigneeId: validated.assigneeId || null,
      source: validated.source || null,
      stage: validated.stage || 'NEW',
    },
  })

  // Add initial note if provided
  if (data.initialNote) {
    // Use authorId (current user), or assigneeId as fallback
    const noteAuthorId = data.authorId || data.assigneeId
    if (noteAuthorId) {
      await prisma.note.create({
        data: {
          content: data.initialNote,
          leadId: lead.id,
          authorId: noteAuthorId,
        },
      })
    }
  }

  revalidatePath('/')
  return lead
}

export async function updateLead(
  id: string,
  data: {
    name?: string
    telegram?: string
    twitter?: string
    farcaster?: string
    tiktok?: string
    youtube?: string
    twitch?: string
    instagram?: string
    email?: string
    altEmail?: string
    discord?: string
    phone?: string
    website?: string
    linkedin?: string
    pitchAngle?: string
    assigneeId?: string | null
    stage?: PipelineStage
    source?: string | null
  }
) {
  // Validate input
  const result = updateLeadSchema.safeParse(data)
  if (!result.success) {
    const fieldErrors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    throw new Error(`Validation failed: ${fieldErrors}`)
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: result.data,
  })
  revalidatePath('/')
  return lead
}

export async function updateLeadStage(id: string, stage: string) {
  const lead = await prisma.lead.update({
    where: { id },
    data: { stage },
  })
  revalidatePath('/')
  return lead
}

export async function assignLead(leadId: string, teamMemberId: string | null) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { assigneeId: teamMemberId },
  })
  revalidatePath('/')
  return lead
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({
    where: { id },
  })
  revalidatePath('/')
}

export async function archiveLead(id: string) {
  const lead = await prisma.lead.update({
    where: { id },
    data: { 
      archived: true,
      archivedAt: new Date(),
    },
  })
  revalidatePath('/')
  revalidatePath('/archived')
  return lead
}

export async function unarchiveLead(id: string) {
  const lead = await prisma.lead.update({
    where: { id },
    data: { 
      archived: false,
      archivedAt: null,
    },
  })
  revalidatePath('/')
  revalidatePath('/archived')
  return lead
}

export async function bulkArchiveLeads(leadIds: string[]) {
  await prisma.lead.updateMany({
    where: { id: { in: leadIds } },
    data: { 
      archived: true,
      archivedAt: new Date(),
    },
  })
  revalidatePath('/')
  revalidatePath('/archived')
}

export async function getLeads() {
  return prisma.lead.findMany({
    where: { archived: false },
    include: {
      assignee: true,
      tags: true,
      _count: {
        select: { notes: true },
      },
      reminders: {
        where: {
          completed: false,
        },
        orderBy: { dueAt: 'asc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getArchivedLeads() {
  return prisma.lead.findMany({
    where: { archived: true },
    include: {
      assignee: true,
      tags: true,
      _count: {
        select: { notes: true },
      },
    },
    orderBy: { archivedAt: 'desc' },
  })
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      assignee: true,
      tags: true,
      notes: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

// ============================================================================
// NOTE ACTIONS
// ============================================================================

export async function addNote(leadId: string, content: string, authorId: string) {
  // Validate input
  addNoteSchema.parse({ leadId, content, authorId })

  const note = await prisma.note.create({
    data: {
      content,
      leadId,
      authorId,
    },
    include: { author: true },
  })
  revalidatePath('/')
  return note
}

export async function deleteNote(noteId: string) {
  await prisma.note.delete({
    where: { id: noteId },
  })
  revalidatePath('/')
}

// ============================================================================
// TEAM MEMBER ACTIONS
// ============================================================================

export async function createTeamMember(data: { name: string; email: string }) {
  // Validate input
  const validated = createTeamMemberSchema.parse(data)
  
  const member = await prisma.teamMember.create({
    data: validated,
  })
  revalidatePath('/team')
  return member
}

export async function getTeamMembers() {
  return prisma.teamMember.findMany({
    include: {
      _count: {
        select: {
          leads: { where: { archived: false } }
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getTeamMember(id: string) {
  return prisma.teamMember.findUnique({
    where: { id },
    include: {
      leads: {
        include: { notes: true },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })
}

export async function updateTeamMember(id: string, data: {
  name?: string
  email?: string
  color?: string
  slackUserId?: string | null
  telegramChatId?: string | null
  notifyOnReminder?: boolean
  timezone?: string
}) {
  const member = await prisma.teamMember.update({
    where: { id },
    data,
  })
  revalidatePath('/team')
  revalidatePath('/')
  return member
}

export async function deleteTeamMember(id: string) {
  // First unassign all leads from this team member
  await prisma.lead.updateMany({
    where: { assigneeId: id },
    data: { assigneeId: null },
  })
  
  // Delete any notes authored by this team member
  await prisma.note.deleteMany({
    where: { authorId: id },
  })
  
  // Delete the team member
  await prisma.teamMember.delete({
    where: { id },
  })
  
  revalidatePath('/team')
  revalidatePath('/')
}

// ============================================================================
// TAG ACTIONS
// ============================================================================

export async function getTags() {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: {
          leads: { where: { archived: false } }
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function createTag(data: { name: string; color?: string }) {
  // Validate input
  const validated = createTagSchema.parse({
    name: data.name,
    color: data.color || '#6366f1',
  })
  
  const tag = await prisma.tag.create({
    data: validated,
  })
  revalidatePath('/')
  revalidatePath('/tags')
  return tag
}

export async function updateTag(id: string, data: { name?: string; color?: string }) {
  // Validate input
  const validated = updateTagSchema.parse(data)
  
  const tag = await prisma.tag.update({
    where: { id },
    data: validated,
  })
  revalidatePath('/')
  revalidatePath('/tags')
  return tag
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({
    where: { id },
  })
  revalidatePath('/')
  revalidatePath('/tags')
}

export async function addTagToLead(leadId: string, tagId: string) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      tags: {
        connect: { id: tagId },
      },
    },
    include: { tags: true },
  })
  revalidatePath('/')
  return lead
}

export async function removeTagFromLead(leadId: string, tagId: string) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      tags: {
        disconnect: { id: tagId },
      },
    },
    include: { tags: true },
  })
  revalidatePath('/')
  return lead
}

export async function getLeadWithTags(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      assignee: true,
      tags: true,
      notes: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

// ============================================================================
// REMINDER ACTIONS
// ============================================================================

export async function createReminder(data: {
  leadId: string
  dueAt: Date
  note?: string
}) {
  const reminder = await prisma.reminder.create({
    data: {
      leadId: data.leadId,
      dueAt: data.dueAt,
      note: data.note || null,
    },
    include: { lead: true },
  })
  revalidatePath('/')
  revalidatePath('/reminders')
  return reminder
}

export async function getReminders() {
  return prisma.reminder.findMany({
    where: { completed: false },
    include: {
      lead: {
        include: { assignee: true },
      },
    },
    orderBy: { dueAt: 'asc' },
  })
}

export async function getRemindersForLead(leadId: string) {
  return prisma.reminder.findMany({
    where: { leadId },
    orderBy: { dueAt: 'asc' },
  })
}

export async function getTodaysReminders() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return prisma.reminder.findMany({
    where: {
      completed: false,
      dueAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      lead: {
        include: { assignee: true },
      },
    },
    orderBy: { dueAt: 'asc' },
  })
}

export async function getUpcomingReminders() {
  const now = new Date()

  return prisma.reminder.findMany({
    where: {
      completed: false,
      dueAt: { gte: now },
    },
    include: {
      lead: {
        include: { assignee: true },
      },
    },
    orderBy: { dueAt: 'asc' },
    take: 20,
  })
}

export async function getOverdueReminders() {
  const now = new Date()

  return prisma.reminder.findMany({
    where: {
      completed: false,
      dueAt: { lt: now },
    },
    include: {
      lead: {
        include: { assignee: true },
      },
    },
    orderBy: { dueAt: 'asc' },
  })
}

export async function completeReminder(id: string) {
  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  })
  revalidatePath('/')
  revalidatePath('/reminders')
  return reminder
}

export async function snoozeReminder(id: string, days: number) {
  const reminder = await prisma.reminder.findUnique({ where: { id } })
  if (!reminder) throw new Error('Reminder not found')

  const newDueAt = new Date(reminder.dueAt)
  newDueAt.setDate(newDueAt.getDate() + days)

  const updated = await prisma.reminder.update({
    where: { id },
    data: { dueAt: newDueAt },
  })
  revalidatePath('/')
  revalidatePath('/reminders')
  return updated
}

export async function deleteReminder(id: string) {
  await prisma.reminder.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/reminders')
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

export async function bulkAssignLeads(leadIds: string[], teamMemberId: string | null) {
  await prisma.lead.updateMany({
    where: { id: { in: leadIds } },
    data: { assigneeId: teamMemberId },
  })

  // Add a note about the bulk assignment
  if (teamMemberId) {
    const teamMember = await prisma.teamMember.findUnique({ where: { id: teamMemberId } })
    if (teamMember) {
      for (const leadId of leadIds) {
        await prisma.note.create({
          data: {
            content: `Bulk assigned to ${teamMember.name}`,
            leadId,
            authorId: teamMemberId,
          },
        })
      }
    }
  }

  revalidatePath('/')
}

export async function bulkMoveLeads(leadIds: string[], stage: string) {
  await prisma.lead.updateMany({
    where: { id: { in: leadIds } },
    data: { stage },
  })

  revalidatePath('/')
}

// ============================================================================
// IMPORT/EXPORT ACTIONS
// ============================================================================

type ImportLead = {
  name: string
  stage?: string
  telegram?: string
  twitter?: string
  farcaster?: string
  tiktok?: string
  youtube?: string
  twitch?: string
  instagram?: string
  email?: string
  altEmail?: string
  discord?: string
  phone?: string
  website?: string
  linkedin?: string
  pitchAngle?: string
}

export async function importLeads(leads: ImportLead[]): Promise<{ imported: number; skipped: number }> {
  let imported = 0
  let skipped = 0

  // Get existing emails to check for duplicates
  const existingLeads = await prisma.lead.findMany({
    where: {
      email: {
        in: leads.filter(l => l.email).map(l => l.email as string),
      },
    },
    select: { email: true },
  })
  const existingEmails = new Set(existingLeads.map(l => l.email?.toLowerCase()))

  for (const lead of leads) {
    // Skip if email already exists
    if (lead.email && existingEmails.has(lead.email.toLowerCase())) {
      skipped++
      continue
    }

    // Validate stage or default to NEW
    const validStages = ['NEW', 'CONTACTED', 'ENGAGED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']
    const stage = lead.stage?.toUpperCase()
    const finalStage = stage && validStages.includes(stage) ? stage : 'NEW'

    await prisma.lead.create({
      data: {
        name: lead.name,
        stage: finalStage,
        telegram: lead.telegram || null,
        twitter: lead.twitter || null,
        farcaster: lead.farcaster || null,
        tiktok: lead.tiktok || null,
        youtube: lead.youtube || null,
        twitch: lead.twitch || null,
        instagram: lead.instagram || null,
        email: lead.email || null,
        altEmail: lead.altEmail || null,
        discord: lead.discord || null,
        phone: lead.phone || null,
        website: lead.website || null,
        linkedin: lead.linkedin || null,
        pitchAngle: lead.pitchAngle || null,
      },
    })
    imported++

    // Add email to set to prevent duplicates within same import
    if (lead.email) {
      existingEmails.add(lead.email.toLowerCase())
    }
  }

  revalidatePath('/')
  return { imported, skipped }
}
