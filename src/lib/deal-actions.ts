'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// DEAL ACTIONS
// ============================================================================

export type CreateDealInput = {
  communityName: string
  contactUsername?: string
  contactPlatform?: string
  fee?: number
  referralCode?: string
  referralRevShare?: number
  advisorTokenTotal?: number
  advisorVestingSchedule?: string
  homeTokenAllocation?: number
  homeTokenThreshold?: string
  purportedVolume?: string
  volumePeriod?: string
  executedDate?: Date
  status?: string
  notes?: string
  nextPaymentDue?: Date
  paymentFrequency?: string
}

export async function createDeal(data: CreateDealInput) {
  const deal = await prisma.deal.create({
    data: {
      communityName: data.communityName,
      contactUsername: data.contactUsername || null,
      contactPlatform: data.contactPlatform || null,
      fee: data.fee ? new Decimal(data.fee) : null,
      referralCode: data.referralCode || null,
      referralRevShare: data.referralRevShare ? new Decimal(data.referralRevShare) : null,
      advisorTokenTotal: data.advisorTokenTotal ? new Decimal(data.advisorTokenTotal) : null,
      advisorVestingSchedule: data.advisorVestingSchedule || null,
      homeTokenAllocation: data.homeTokenAllocation ? new Decimal(data.homeTokenAllocation) : null,
      homeTokenThreshold: data.homeTokenThreshold || null,
      purportedVolume: data.purportedVolume || null,
      volumePeriod: data.volumePeriod || null,
      executedDate: data.executedDate || null,
      status: data.status || 'ACTIVE',
      notes: data.notes || null,
      nextPaymentDue: data.nextPaymentDue || null,
      paymentFrequency: data.paymentFrequency || null,
    },
  })
  revalidatePath('/deals')
  return deal
}

export async function updateDeal(id: string, data: Partial<CreateDealInput>) {
  const updateData: Record<string, unknown> = {}
  
  if (data.communityName !== undefined) updateData.communityName = data.communityName
  if (data.contactUsername !== undefined) updateData.contactUsername = data.contactUsername || null
  if (data.contactPlatform !== undefined) updateData.contactPlatform = data.contactPlatform || null
  if (data.fee !== undefined) updateData.fee = data.fee ? new Decimal(data.fee) : null
  if (data.referralCode !== undefined) updateData.referralCode = data.referralCode || null
  if (data.referralRevShare !== undefined) updateData.referralRevShare = data.referralRevShare ? new Decimal(data.referralRevShare) : null
  if (data.advisorTokenTotal !== undefined) updateData.advisorTokenTotal = data.advisorTokenTotal ? new Decimal(data.advisorTokenTotal) : null
  if (data.advisorVestingSchedule !== undefined) updateData.advisorVestingSchedule = data.advisorVestingSchedule || null
  if (data.homeTokenAllocation !== undefined) updateData.homeTokenAllocation = data.homeTokenAllocation ? new Decimal(data.homeTokenAllocation) : null
  if (data.homeTokenThreshold !== undefined) updateData.homeTokenThreshold = data.homeTokenThreshold || null
  if (data.purportedVolume !== undefined) updateData.purportedVolume = data.purportedVolume || null
  if (data.volumePeriod !== undefined) updateData.volumePeriod = data.volumePeriod || null
  if (data.executedDate !== undefined) updateData.executedDate = data.executedDate || null
  if (data.status !== undefined) updateData.status = data.status
  if (data.notes !== undefined) updateData.notes = data.notes || null
  if (data.nextPaymentDue !== undefined) updateData.nextPaymentDue = data.nextPaymentDue || null
  if (data.paymentFrequency !== undefined) updateData.paymentFrequency = data.paymentFrequency || null
  
  const deal = await prisma.deal.update({
    where: { id },
    data: updateData,
  })
  revalidatePath('/deals')
  return deal
}

export async function deleteDeal(id: string) {
  await prisma.deal.delete({
    where: { id },
  })
  revalidatePath('/deals')
}

export async function getDeals() {
  return prisma.deal.findMany({
    include: {
      reminders: {
        where: { completed: false },
        orderBy: { dueAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getDeal(id: string) {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      reminders: {
        orderBy: { dueAt: 'asc' },
      },
    },
  })
}

// ============================================================================
// DEAL REMINDER ACTIONS
// ============================================================================

export async function createDealReminder(data: {
  dealId: string
  dueAt: Date
  note?: string
  type?: string
}) {
  const reminder = await prisma.dealReminder.create({
    data: {
      dealId: data.dealId,
      dueAt: data.dueAt,
      note: data.note || null,
      type: data.type || 'PAYMENT',
    },
  })
  revalidatePath('/deals')
  return reminder
}

export async function completeDealReminder(id: string) {
  const reminder = await prisma.dealReminder.update({
    where: { id },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  })
  revalidatePath('/deals')
  return reminder
}

export async function deleteDealReminder(id: string) {
  await prisma.dealReminder.delete({
    where: { id },
  })
  revalidatePath('/deals')
}

export async function getUpcomingDealReminders() {
  return prisma.dealReminder.findMany({
    where: {
      completed: false,
    },
    include: {
      deal: true,
    },
    orderBy: { dueAt: 'asc' },
    take: 20,
  })
}

export async function getOverdueDealReminders() {
  return prisma.dealReminder.findMany({
    where: {
      completed: false,
      dueAt: { lt: new Date() },
    },
    include: {
      deal: true,
    },
    orderBy: { dueAt: 'asc' },
  })
}
