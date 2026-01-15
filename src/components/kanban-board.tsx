'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { PipelineStage } from '@/lib/types'
import { updateLeadStage } from '@/lib/actions'
import { PipelineColumn } from './pipeline-column'
import { LeadCard } from './lead-card'

type Lead = {
  id: string
  name: string
  stage: string
  telegram: string | null
  twitter: string | null
  farcaster: string | null
  tiktok: string | null
  youtube: string | null
  twitch: string | null
  instagram: string | null
  email: string | null
  assignee: { id: string; name: string; email: string } | null
  notes: Array<{
    id: string
    content: string
    createdAt: Date
    author: { name: string }
  }>
}

type TeamMember = {
  id: string
  name: string
  email: string
}

interface KanbanBoardProps {
  leadsByStage: Record<PipelineStage, Lead[]>
  teamMembers: TeamMember[]
  stages: readonly PipelineStage[]
  stageLabels: Record<PipelineStage, string>
  stageColors: Record<PipelineStage, string>
}

export function KanbanBoard({
  leadsByStage,
  teamMembers,
  stages,
  stageLabels,
  stageColors,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localLeadsByStage, setLocalLeadsByStage] = useState(leadsByStage)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const activeLead = activeId
    ? Object.values(localLeadsByStage).flat().find(lead => lead.id === activeId)
    : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const newStage = over.id as PipelineStage

    // Find current stage
    let currentStage: PipelineStage | null = null
    for (const [stage, leads] of Object.entries(localLeadsByStage)) {
      if (leads.some(lead => lead.id === leadId)) {
        currentStage = stage as PipelineStage
        break
      }
    }

    if (!currentStage || currentStage === newStage) return

    // Optimistic update
    const lead = localLeadsByStage[currentStage].find(l => l.id === leadId)
    if (!lead) return

    setLocalLeadsByStage(prev => ({
      ...prev,
      [currentStage]: prev[currentStage].filter(l => l.id !== leadId),
      [newStage]: [...prev[newStage], { ...lead, stage: newStage }],
    }))

    // Server update
    try {
      await updateLeadStage(leadId, newStage)
    } catch (error) {
      // Rollback on error
      setLocalLeadsByStage(leadsByStage)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <PipelineColumn
            key={stage}
            stage={stage}
            label={stageLabels[stage]}
            color={stageColors[stage]}
            leads={localLeadsByStage[stage]}
            teamMembers={teamMembers}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <LeadCard lead={activeLead} teamMembers={teamMembers} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
