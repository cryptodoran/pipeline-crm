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
  assigneeId?: string
  source?: string
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
      assigneeId: validated.assigneeId || null,
      source: validated.source || null,
      stage: 'NEW',
    },
  })
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
    assigneeId?: string | null
    stage?: PipelineStage
    source?: string | null
  }
) {
  // Validate input
  const validated = updateLeadSchema.parse(data)
  
  const lead = await prisma.lead.update({
    where: { id },
    data: validated,
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
      notes: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      },
      reminders: {
        where: {
          completed: false,
        },
        orderBy: { dueAt: 'asc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getArchivedLeads() {
  return prisma.lead.findMany({
    where: { archived: true },
    include: {
      assignee: true,
      tags: true,
      notes: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
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
        select: { leads: true },
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

export async function updateTeamMember(id: string, data: { name?: string; email?: string; color?: string }) {
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
        select: { leads: true },
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
