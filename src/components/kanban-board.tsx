'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { updateLeadStage } from '@/lib/actions'
import { PipelineColumn } from './pipeline-column'
import { LeadCard } from './lead-card'
import { SearchInput } from './search-input'
import { FilterDropdown, FilterBadges, PlatformFilter } from './filter-dropdown'
import { BulkActionToolbar } from './bulk-action-toolbar'
import { CheckSquare, Keyboard, RefreshCw } from 'lucide-react'

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
  assignee: { id: string; name: string; email: string; color?: string } | null
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
  leadsByStage: Record<string, Lead[]>
  teamMembers: TeamMember[]
  stages: string[]
  stageLabels: Record<string, string>
  stageColors: Record<string, string>
  currentUserId?: string | null
}

const POLL_INTERVAL = 10000 // 10 seconds

export function KanbanBoard({
  leadsByStage,
  teamMembers,
  stages,
  stageLabels,
  stageColors,
  currentUserId,
}: KanbanBoardProps) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localLeadsByStage, setLocalLeadsByStage] = useState(leadsByStage)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<PlatformFilter[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sync local state when props change (from server refresh)
  useEffect(() => {
    setLocalLeadsByStage(leadsByStage)
  }, [leadsByStage])

  // Polling for auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      router.refresh()
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [autoRefresh, router])

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true)
    router.refresh()
    // Reset refreshing state after a short delay
    setTimeout(() => setIsRefreshing(false), 500)
  }, [router])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          ;(target as HTMLInputElement).blur()
        }
        return
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          // Trigger add lead button click
          const addButton = document.querySelector('[data-add-lead-button]') as HTMLButtonElement
          addButton?.click()
          break
        case '/':
          e.preventDefault()
          searchInputRef.current?.focus()
          break
        case '?':
          e.preventDefault()
          setShowKeyboardHelp(true)
          break
        case 'escape':
          setShowKeyboardHelp(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Filter leads by search query, platform filters, and tags
  const filteredLeadsByStage = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    const filtered = {} as Record<string, Lead[]>

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

        // Source filters (OR logic - lead must have one of selected sources)
        if (selectedSources.length > 0) {
          if (!lead.source || !selectedSources.includes(lead.source)) {
            return false
          }
        }

        return true
      })
    }

    return filtered
  }, [localLeadsByStage, searchQuery, selectedFilters, selectedSources, stages])

  // Check if search has any results
  const hasResults = useMemo(() => {
    return Object.values(filteredLeadsByStage).some(leads => leads.length > 0)
  }, [filteredLeadsByStage])

  const totalFilteredLeads = useMemo(() => {
    return Object.values(filteredLeadsByStage).reduce((sum, leads) => sum + leads.length, 0)
  }, [filteredLeadsByStage])

  const allFilteredLeadIds = useMemo(() => {
    return Object.values(filteredLeadsByStage).flat().map(lead => lead.id)
  }, [filteredLeadsByStage])

  const activeLead = activeId
    ? Object.values(localLeadsByStage).flat().find(lead => lead.id === activeId)
    : null

  const hasActiveFilters = searchQuery || selectedFilters.length > 0 || selectedSources.length > 0

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const newStage = over.id as string

    // Find current stage
    let currentStage: string | null = null
    for (const [stage, leads] of Object.entries(localLeadsByStage)) {
      if (leads.some(lead => lead.id === leadId)) {
        currentStage = stage
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

  const handleClearAllFilters = () => {
    setSelectedFilters([])
    setSelectedSources([])
  }

  const handleSelectionChange = (leadId: string, selected: boolean) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(leadId)
      } else {
        next.delete(leadId)
      }
      return next
    })
  }

  const handleClearSelection = () => {
    setSelectedLeadIds(new Set())
    setSelectionMode(false)
  }

  const handleSelectAll = () => {
    setSelectedLeadIds(new Set(allFilteredLeadIds))
  }

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedLeadIds(new Set())
    }
    setSelectionMode(!selectionMode)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="flex-1">
            <SearchInput
              ref={searchInputRef}
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search leads... (Press /)"
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterDropdown
              selectedFilters={selectedFilters}
              onChange={setSelectedFilters}
              selectedSources={selectedSources}
              onSourcesChange={setSelectedSources}
            />
            <button
              onClick={toggleSelectionMode}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectionMode
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{selectionMode ? 'Exit Select' : 'Select'}</span>
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
              title="Refresh (auto-refreshes every 10s)"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`hidden sm:flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
              title={autoRefresh ? 'Auto-refresh ON (click to disable)' : 'Auto-refresh OFF (click to enable)'}
            >
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
          </div>
        </div>
        {hasActiveFilters && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalFilteredLeads} result{totalFilteredLeads !== 1 ? 's' : ''} found
          </span>
        )}
        <FilterBadges
          selectedFilters={selectedFilters}
          onRemove={(filter) => setSelectedFilters(selectedFilters.filter(f => f !== filter))}
          onClearAll={handleClearAllFilters}
          selectedSources={selectedSources}
          onRemoveSource={(source) => setSelectedSources(selectedSources.filter(s => s !== source))}
        />

        {/* Bulk Action Toolbar */}
        {selectionMode && (
          <BulkActionToolbar
            selectedCount={selectedLeadIds.size}
            selectedLeadIds={Array.from(selectedLeadIds)}
            teamMembers={teamMembers}
            stages={stages}
            stageLabels={stageLabels}
            onClearSelection={handleClearSelection}
            onSelectAll={handleSelectAll}
            totalLeads={totalFilteredLeads}
          />
        )}
      </div>

      {hasActiveFilters && !hasResults ? (
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
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory md:snap-none">
          {stages.map(stage => (
            <PipelineColumn
              key={stage}
              stage={stage}
              label={stageLabels[stage]}
              color={stageColors[stage]}
              leads={filteredLeadsByStage[stage] || []}
              teamMembers={teamMembers}
              stages={stages}
              stageLabels={stageLabels}
              selectionMode={selectionMode}
              currentUserId={currentUserId}
              selectedLeadIds={selectedLeadIds}
              onSelectionChange={handleSelectionChange}
            />
          ))}
        </div>
      )}

      <DragOverlay>
        {activeLead ? (
          <LeadCard lead={activeLead} teamMembers={teamMembers} stages={stages} stageLabels={stageLabels} isDragging />
        ) : null}
      </DragOverlay>

      {/* Keyboard Help Button */}
      <button
        onClick={() => setShowKeyboardHelp(true)}
        className="fixed bottom-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Add new lead</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono border border-gray-300 dark:border-gray-600">N</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Focus search</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono border border-gray-300 dark:border-gray-600">/</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Show shortcuts help</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono border border-gray-300 dark:border-gray-600">?</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Close modals</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono border border-gray-300 dark:border-gray-600">Esc</kbd>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">?</kbd> anytime to show this help
              </p>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}
