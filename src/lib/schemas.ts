import { z } from 'zod'
import { PIPELINE_STAGES, LEAD_SOURCES } from './types'

// ============================================================================
// LEAD SCHEMAS
// ============================================================================

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  telegram: z.string().max(50).optional(),
  twitter: z.string().max(50).optional(),
  farcaster: z.string().max(50).optional(),
  tiktok: z.string().max(50).optional(),
  youtube: z.string().max(50).optional(),
  twitch: z.string().max(50).optional(),
  instagram: z.string().max(50).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  assigneeId: z.string().cuid().optional(),
  source: z.enum(LEAD_SOURCES as readonly [string, ...string[]]).optional(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  telegram: z.string().max(50).optional().nullable(),
  twitter: z.string().max(50).optional().nullable(),
  farcaster: z.string().max(50).optional().nullable(),
  tiktok: z.string().max(50).optional().nullable(),
  youtube: z.string().max(50).optional().nullable(),
  twitch: z.string().max(50).optional().nullable(),
  instagram: z.string().max(50).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  assigneeId: z.string().cuid().optional().nullable(),
  stage: z.enum(PIPELINE_STAGES as readonly [string, ...string[]]).optional(),
  source: z.string().optional().nullable(),
})

export const updateLeadStageSchema = z.object({
  id: z.string().cuid(),
  stage: z.enum(PIPELINE_STAGES as readonly [string, ...string[]]),
})

// ============================================================================
// NOTE SCHEMAS
// ============================================================================

export const addNoteSchema = z.object({
  leadId: z.string().cuid(),
  content: z.string().min(1, 'Note content is required').max(5000, 'Note too long'),
  authorId: z.string().cuid(),
})

// ============================================================================
// TEAM MEMBER SCHEMAS
// ============================================================================

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email'),
})

// ============================================================================
// TAG SCHEMAS
// ============================================================================

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
})

export const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
})

// ============================================================================
// REMINDER SCHEMAS
// ============================================================================

export const createReminderSchema = z.object({
  leadId: z.string().cuid(),
  dueAt: z.coerce.date(),
  note: z.string().max(500, 'Note too long').optional(),
})

export const updateReminderSchema = z.object({
  dueAt: z.coerce.date().optional(),
  note: z.string().max(500, 'Note too long').optional().nullable(),
  completed: z.boolean().optional(),
})

// ============================================================================
// BULK ACTION SCHEMAS
// ============================================================================

export const bulkAssignSchema = z.object({
  leadIds: z.array(z.string().cuid()).min(1, 'Select at least one lead'),
  teamMemberId: z.string().cuid().nullable(),
})

export const bulkMoveSchema = z.object({
  leadIds: z.array(z.string().cuid()).min(1, 'Select at least one lead'),
  stage: z.enum(PIPELINE_STAGES as readonly [string, ...string[]]),
})

// ============================================================================
// IMPORT SCHEMAS
// ============================================================================

export const importLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stage: z.string().optional(),
  telegram: z.string().optional(),
  twitter: z.string().optional(),
  farcaster: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  twitch: z.string().optional(),
  instagram: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

// Type exports
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type AddNoteInput = z.infer<typeof addNoteSchema>
export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
export type CreateReminderInput = z.infer<typeof createReminderSchema>
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>
export type ImportLeadInput = z.infer<typeof importLeadSchema>
