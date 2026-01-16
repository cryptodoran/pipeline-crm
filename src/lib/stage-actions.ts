'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'

// Default stages to seed if none exist
const DEFAULT_STAGES = [
  { key: 'NEW', name: 'New', color: 'bg-blue-500', order: 0, isDefault: true },
  { key: 'CONTACTED', name: 'Contacted', color: 'bg-purple-500', order: 1 },
  { key: 'ENGAGED', name: 'Engaged', color: 'bg-amber-500', order: 2 },
  { key: 'PROPOSAL', name: 'Proposal', color: 'bg-cyan-500', order: 3 },
  { key: 'WON', name: 'Won', color: 'bg-green-500', order: 4, isWon: true },
  { key: 'LOST', name: 'Lost', color: 'bg-red-500', order: 5, isLost: true },
]

export async function getStages() {
  let stages = await prisma.pipelineStage.findMany({
    orderBy: { order: 'asc' },
  })

  // Seed default stages if none exist
  if (stages.length === 0) {
    await prisma.pipelineStage.createMany({
      data: DEFAULT_STAGES,
    })
    stages = await prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' },
    })
  }

  return stages
}

export async function createStage(data: {
  name: string
  key: string
  color?: string
  isWon?: boolean
  isLost?: boolean
}) {
  // Get the highest order
  const lastStage = await prisma.pipelineStage.findFirst({
    orderBy: { order: 'desc' },
  })
  const newOrder = (lastStage?.order ?? -1) + 1

  // Create uppercase key from name if not provided
  const key = data.key || data.name.toUpperCase().replace(/\s+/g, '_')

  const stage = await prisma.pipelineStage.create({
    data: {
      name: data.name,
      key,
      color: data.color || 'bg-gray-500',
      order: newOrder,
      isWon: data.isWon || false,
      isLost: data.isLost || false,
    },
  })

  revalidatePath('/')
  revalidatePath('/stages')
  return stage
}

export async function updateStage(
  id: string,
  data: {
    name?: string
    key?: string
    color?: string
    isDefault?: boolean
    isWon?: boolean
    isLost?: boolean
  }
) {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.pipelineStage.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })
  }

  const stage = await prisma.pipelineStage.update({
    where: { id },
    data,
  })

  revalidatePath('/')
  revalidatePath('/stages')
  return stage
}

export async function deleteStage(id: string) {
  const stage = await prisma.pipelineStage.findUnique({
    where: { id },
  })

  if (!stage) throw new Error('Stage not found')

  // Check if any leads use this stage
  const leadsInStage = await prisma.lead.count({
    where: { stage: stage.key },
  })

  if (leadsInStage > 0) {
    throw new Error(`Cannot delete stage with ${leadsInStage} leads. Move leads first.`)
  }

  await prisma.pipelineStage.delete({
    where: { id },
  })

  revalidatePath('/')
  revalidatePath('/stages')
}

export async function reorderStages(stageIds: string[]) {
  // Update order based on array position
  await Promise.all(
    stageIds.map((id, index) =>
      prisma.pipelineStage.update({
        where: { id },
        data: { order: index },
      })
    )
  )

  revalidatePath('/')
  revalidatePath('/stages')
}

// Get stages as a record for the Kanban board
export async function getStagesConfig() {
  const stages = await getStages()
  
  const stageKeys = stages.map(s => s.key)
  const stageLabels: Record<string, string> = {}
  const stageColors: Record<string, string> = {}
  
  stages.forEach(s => {
    stageLabels[s.key] = s.name
    stageColors[s.key] = s.color
  })

  return { stages: stageKeys, stageLabels, stageColors }
}
