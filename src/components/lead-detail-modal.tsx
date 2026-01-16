'use client'

import { useState, useTransition } from 'react'
import { X, Trash2, ExternalLink, Clock } from 'lucide-react'
import { SOCIAL_URLS, SocialPlatform, PIPELINE_STAGES, STAGE_LABELS, PipelineStage } from '@/lib/types'
import { updateLead, deleteLead, addNote, assignLead, updateLeadStage } from '@/lib/actions'
import { TagInput } from './tag-input'
import { ReminderForm } from './reminder-form'

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

interface LeadDetailModalProps {
  lead: Lead
  teamMembers: TeamMember[]
  availableTags?: Tag[]
  isOpen: boolean
  onClose: () => void
}

export function LeadDetailModal({
  lead,
  teamMembers,
  availableTags = [],
  isOpen,
  onClose,
}: LeadDetailModalProps) {
  const [isPending, startTransition] = useTransition()
  const [noteContent, setNoteContent] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)

  if (!isOpen) return null

  const handleStageChange = (newStage: PipelineStage) => {
    startTransition(async () => {
      await updateLeadStage(lead.id, newStage)
    })
  }

  const handleAssigneeChange = (teamMemberId: string | null) => {
    startTransition(async () => {
      await assignLead(lead.id, teamMemberId)
    })
  }

  const handleAddNote = () => {
    if (!noteContent.trim()) return
    // For now, use the first team member as author (in production, use current user)
    const authorId = teamMembers[0]?.id
    if (!authorId) return

    startTransition(async () => {
      await addNote(lead.id, noteContent.trim(), authorId)
      setNoteContent('')
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLead(lead.id)
      onClose()
    })
  }

  const socialPlatforms: SocialPlatform[] = ['telegram', 'twitter', 'farcaster', 'tiktok', 'youtube', 'twitch', 'instagram', 'email']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(lead.notes[lead.notes.length - 1]?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReminderForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              Set Reminder
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Stage selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pipeline Stage
            </label>
            <select
              value={lead.stage}
              onChange={e => handleStageChange(e.target.value as PipelineStage)}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PIPELINE_STAGES.map(stage => (
                <option key={stage} value={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To
            </label>
            <select
              value={lead.assignee?.id || ''}
              onChange={e => handleAssigneeChange(e.target.value || null)}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <TagInput
            leadId={lead.id}
            selectedTags={lead.tags || []}
            availableTags={availableTags}
          />

          {/* Social handles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Presence
            </label>
            <div className="grid grid-cols-2 gap-2">
              {socialPlatforms.map(platform => {
                const handle = lead[platform]
                if (!handle) return null

                return (
                  <a
                    key={platform}
                    href={SOCIAL_URLS[platform](handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    <span className="capitalize font-medium text-gray-700">{platform}</span>
                    <span className="text-gray-500 truncate">{handle}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
                  </a>
                )
              })}
            </div>
            {!socialPlatforms.some(p => lead[p]) && (
              <p className="text-sm text-gray-400">No social handles added</p>
            )}
          </div>

          {/* Notes section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes ({lead.notes.length})
            </label>

            {/* Add note form */}
            <div className="mb-4">
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Add a note about this lead..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <button
                onClick={handleAddNote}
                disabled={isPending || !noteContent.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>

            {/* Notes timeline */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {lead.notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No notes yet. Add the first one above.
                </p>
              ) : (
                lead.notes.map(note => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {note.author.name} • {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-red-600">Delete this lead?</span>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-gray-600 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Lead
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>

      {/* Reminder Form Modal */}
      {showReminderForm && (
        <ReminderForm
          leadId={lead.id}
          leadName={lead.name}
          onClose={() => setShowReminderForm(false)}
        />
      )}
    </div>
  )
}
