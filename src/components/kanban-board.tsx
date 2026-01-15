'use client'

import { useState, useMemo } from 'react'
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
import { SearchInput } from './search-input'
import { FilterDropdown, FilterBadges, PlatformFilter } from './filter-dropdown'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<PlatformFilter[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter leads by search query and platform filters
  const filteredLeadsByStage = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    const filtered = {} as Record<PipelineStage, Lead[]>

    for (const stage of stages) {
      filtered[stage] = localLeadsByStage[stage].filter(lead => {
        // Search filter
        if (query && !lead.name.toLowerCase().includes(query)) {
          return false
        }

        // Platform filters (AND logic - lead must have all selected platforms)
        if (selectedFilters.length > 0) {
          for (const platform of selectedFilters) {
            if (!lead[platform]) {
              return false
            }
          }
        }

        return true
      })
    }

    return filtered
  }, [localLeadsByStage, searchQuery, selectedFilters, stages])

  // Check if search has any results
  const hasResults = useMemo(() => {
    return Object.values(filteredLeadsByStage).some(leads => leads.length > 0)
  }, [filteredLeadsByStage])

  const totalFilteredLeads = useMemo(() => {
    return Object.values(filteredLeadsByStage).reduce((sum, leads) => sum + leads.length, 0)
  }, [filteredLeadsByStage])

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
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search leads by name..."
          />
          <FilterDropdown
            selectedFilters={selectedFilters}
            onChange={setSelectedFilters}
          />
          {(searchQuery || selectedFilters.length > 0) && (
            <span className="text-sm text-gray-500">
              {totalFilteredLeads} result{totalFilteredLeads !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
        <FilterBadges
          selectedFilters={selectedFilters}
          onRemove={(filter) => setSelectedFilters(selectedFilters.filter(f => f !== filter))}
          onClearAll={() => setSelectedFilters([])}
        />
      </div>

      {(searchQuery || selectedFilters.length > 0) && !hasResults ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm">
            {searchQuery && selectedFilters.length > 0
              ? `No leads match "${searchQuery}" with the selected filters`
              : searchQuery
              ? `No leads match "${searchQuery}"`
              : 'No leads match the selected filters'}
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <PipelineColumn
              key={stage}
              stage={stage}
              label={stageLabels[stage]}
              color={stageColors[stage]}
              leads={filteredLeadsByStage[stage]}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      )}

      <DragOverlay>
        {activeLead ? (
          <LeadCard lead={activeLead} teamMembers={teamMembers} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
