'use client'

import { useDroppable } from '@dnd-kit/core'
import { PipelineStage } from '@/lib/types'
import { LeadCard } from './lead-card'

type Tag = {
  id: string
  name: string
  color: string
}

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
  tags?: Tag[]
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

interface PipelineColumnProps {
  stage: PipelineStage
  label: string
  color: string
  leads: Lead[]
  teamMembers: TeamMember[]
  availableTags?: Tag[]
  selectionMode?: boolean
  selectedLeadIds?: Set<string>
  onSelectionChange?: (leadId: string, selected: boolean) => void
}

export function PipelineColumn({
  stage,
  label,
  color,
  leads,
  teamMembers,
  availableTags = [],
  selectionMode = false,
  selectedLeadIds = new Set(),
  onSelectionChange,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-gray-100 rounded-lg p-3 ${
        isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-gray-700">{label}</h3>
        </div>
        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
          {leads.length}
        </span>
      </div>

      <div className="space-y-2 min-h-[200px]">
        {leads.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No leads in this stage
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              teamMembers={teamMembers}
              availableTags={availableTags}
              selectionMode={selectionMode}
              isSelected={selectedLeadIds.has(lead.id)}
              onSelectionChange={onSelectionChange}
            />
          ))
        )}
      </div>
    </div>
  )
}
