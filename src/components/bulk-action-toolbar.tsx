'use client'

import { useState, useTransition } from 'react'
import { X, Users, ArrowRight, CheckSquare, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { PipelineStage, PIPELINE_STAGES, STAGE_LABELS } from '@/lib/types'
import { bulkAssignLeads, bulkMoveLeads } from '@/lib/actions'

type TeamMember = {
  id: string
  name: string
  email: string
}

interface BulkActionToolbarProps {
  selectedCount: number
  selectedLeadIds: string[]
  teamMembers: TeamMember[]
  onClearSelection: () => void
  onSelectAll: () => void
  totalLeads: number
}

export function BulkActionToolbar({
  selectedCount,
  selectedLeadIds,
  teamMembers,
  onClearSelection,
  onSelectAll,
  totalLeads,
}: BulkActionToolbarProps) {
  const [isPending, startTransition] = useTransition()
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [showMoveDropdown, setShowMoveDropdown] = useState(false)
  const [lastAction, setLastAction] = useState<{
    type: 'assign' | 'move'
    leadIds: string[]
    previousValue: string | null
  } | null>(null)

  const handleAssign = (teamMemberId: string | null, teamMemberName?: string) => {
    const leadIds = [...selectedLeadIds]
    startTransition(async () => {
      try {
        await bulkAssignLeads(leadIds, teamMemberId)
        setShowAssignDropdown(false)
        onClearSelection()
        
        const message = teamMemberId 
          ? `${leadIds.length} lead${leadIds.length !== 1 ? 's' : ''} assigned to ${teamMemberName}`
          : `${leadIds.length} lead${leadIds.length !== 1 ? 's' : ''} unassigned`
        
        toast.success(message, {
          action: {
            label: 'Undo',
            onClick: () => handleUndoAssign(leadIds),
          },
          duration: 10000,
        })
        
        setLastAction({ type: 'assign', leadIds, previousValue: null })
      } catch {
        toast.error('Failed to assign leads')
      }
    })
  }

  const handleMove = (stage: PipelineStage) => {
    const leadIds = [...selectedLeadIds]
    startTransition(async () => {
      try {
        await bulkMoveLeads(leadIds, stage)
        setShowMoveDropdown(false)
        onClearSelection()
        
        toast.success(`${leadIds.length} lead${leadIds.length !== 1 ? 's' : ''} moved to ${STAGE_LABELS[stage]}`, {
          action: {
            label: 'Undo',
            onClick: () => handleUndoMove(leadIds),
          },
          duration: 10000,
        })
        
        setLastAction({ type: 'move', leadIds, previousValue: stage })
      } catch {
        toast.error('Failed to move leads')
      }
    })
  }

  const handleUndoAssign = async (leadIds: string[]) => {
    try {
      await bulkAssignLeads(leadIds, null)
      toast.success('Action undone')
    } catch {
      toast.error('Failed to undo')
    }
  }

  const handleUndoMove = async (leadIds: string[]) => {
    try {
      // Move back to NEW stage as a simple undo
      await bulkMoveLeads(leadIds, 'NEW')
      toast.success('Action undone - leads moved to New')
    } catch {
      toast.error('Failed to undo')
    }
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          <span className="font-medium">
            {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        {selectedCount < totalLeads && (
          <button
            onClick={onSelectAll}
            className="text-blue-100 hover:text-white text-sm underline"
          >
            Select all ({totalLeads})
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Assign dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAssignDropdown(!showAssignDropdown)
              setShowMoveDropdown(false)
            }}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            Assign
          </button>

          {showAssignDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
              <button
                onClick={() => handleAssign(null, undefined)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Unassign
              </button>
              <div className="border-t border-gray-100 my-1" />
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleAssign(member.id, member.name)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {member.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Move dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMoveDropdown(!showMoveDropdown)
              setShowAssignDropdown(false)
            }}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
            Move to
          </button>

          {showMoveDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
              {PIPELINE_STAGES.map(stage => (
                <button
                  key={stage}
                  onClick={() => handleMove(stage)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          className="p-1.5 hover:bg-blue-500 rounded-lg"
          title="Clear selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Click outside to close dropdowns */}
      {(showAssignDropdown || showMoveDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowAssignDropdown(false)
            setShowMoveDropdown(false)
          }}
        />
      )}
    </div>
  )
}
