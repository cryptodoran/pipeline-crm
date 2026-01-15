'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'
import { PipelineStage } from './types'

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
}) {
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      telegram: data.telegram || null,
      twitter: data.twitter || null,
      farcaster: data.farcaster || null,
      tiktok: data.tiktok || null,
      youtube: data.youtube || null,
      twitch: data.twitch || null,
      instagram: data.instagram || null,
      email: data.email || null,
      assigneeId: data.assigneeId || null,
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
  }
) {
  const lead = await prisma.lead.update({
    where: { id },
    data,
  })
  revalidatePath('/')
  return lead
}

export async function updateLeadStage(id: string, stage: PipelineStage) {
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

export async function getLeads() {
  return prisma.lead.findMany({
    include: {
      assignee: true,
      tags: true,
      notes: {
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
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
  const member = await prisma.teamMember.create({
    data,
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
  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      color: data.color || '#6366f1',
    },
  })
  revalidatePath('/')
  revalidatePath('/tags')
  return tag
}

export async function updateTag(id: string, data: { name?: string; color?: string }) {
  const tag = await prisma.tag.update({
    where: { id },
    data,
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
