'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'
import { Decimal } from '@prisma/client/runtime/library'

export type CreateDistributionInput = {
  dealId: string
  amount?: number
  type: string
  txLink?: string
  paidAt: Date
  notes?: string
}

export async function createDistribution(data: CreateDistributionInput) {
  const distribution = await prisma.distribution.create({
    data: {
      dealId: data.dealId,
      amount: data.amount ? new Decimal(data.amount) : null,
      type: data.type,
      txLink: data.txLink || null,
      paidAt: data.paidAt,
      notes: data.notes || null,
    },
  })
  revalidatePath('/deals')
  revalidatePath('/distributions')
  return distribution
}

export async function updateDistribution(
  id: string,
  data: Partial<Omit<CreateDistributionInput, 'dealId'>>
) {
  const updateData: Record<string, unknown> = {}

  if (data.amount !== undefined)
    updateData.amount = data.amount ? new Decimal(data.amount) : null
  if (data.type !== undefined) updateData.type = data.type
  if (data.txLink !== undefined) updateData.txLink = data.txLink || null
  if (data.paidAt !== undefined) updateData.paidAt = data.paidAt
  if (data.notes !== undefined) updateData.notes = data.notes || null

  const distribution = await prisma.distribution.update({
    where: { id },
    data: updateData,
  })
  revalidatePath('/deals')
  revalidatePath('/distributions')
  return distribution
}

export async function deleteDistribution(id: string) {
  await prisma.distribution.delete({
    where: { id },
  })
  revalidatePath('/deals')
  revalidatePath('/distributions')
}

export async function getDistributions() {
  return prisma.distribution.findMany({
    include: {
      deal: {
        select: {
          id: true,
          communityName: true,
          status: true,
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  })
}

export async function getDistributionsByDeal(dealId: string) {
  return prisma.distribution.findMany({
    where: { dealId },
    orderBy: { paidAt: 'desc' },
  })
}

export async function getDistribution(id: string) {
  return prisma.distribution.findUnique({
    where: { id },
    include: {
      deal: {
        select: {
          id: true,
          communityName: true,
        },
      },
    },
  })
}

// Get distribution stats for a deal
export async function getDistributionStats(dealId: string) {
  const distributions = await prisma.distribution.findMany({
    where: { dealId },
  })

  const totalAmount = distributions.reduce((sum, d) => {
    if (d.amount) {
      return sum + Number(d.amount)
    }
    return sum
  }, 0)

  const byType = distributions.reduce(
    (acc, d) => {
      if (!acc[d.type]) {
        acc[d.type] = { count: 0, amount: 0 }
      }
      acc[d.type].count++
      if (d.amount) {
        acc[d.type].amount += Number(d.amount)
      }
      return acc
    },
    {} as Record<string, { count: number; amount: number }>
  )

  return {
    totalCount: distributions.length,
    totalAmount,
    byType,
  }
}
