'use client'

import { useDroppable } from '@dnd-kit/core'
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
  source: string | null
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

interface PipelineColumnProps {
  stage: string
  label: string
  color: string
  leads: Lead[]
  teamMembers: TeamMember[]
  stages?: string[]
  stageLabels?: Record<string, string>
  selectionMode?: boolean
  selectedLeadIds?: Set<string>
  onSelectionChange?: (leadId: string, selected: boolean) => void
  currentUserId?: string | null
}

export function PipelineColumn({
  stage,
  label,
  color,
  leads,
  teamMembers,
  stages = [],
  stageLabels = {},
  selectionMode = false,
  selectedLeadIds = new Set(),
  onSelectionChange,
  currentUserId,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[280px] sm:w-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 sm:p-3 snap-start ${
        isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">{label}</h3>
        </div>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
          {leads.length}
        </span>
      </div>

      <div className="space-y-2 min-h-[200px]">
        {leads.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No leads in this stage
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              teamMembers={teamMembers}
              stages={stages}
              stageLabels={stageLabels}
              selectionMode={selectionMode}
              isSelected={selectedLeadIds.has(lead.id)}
              onSelectionChange={onSelectionChange}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}
