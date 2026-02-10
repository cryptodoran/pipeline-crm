'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Trash2, ExternalLink, Clock, Edit2, Save, Loader2, Pencil } from 'lucide-react'
import { SOCIAL_URLS, SocialPlatform } from '@/lib/types'
import { updateLead, deleteLead, addNote, updateNote, deleteNote, assignLead, updateLeadStage, archiveLead, addTagToLead, removeTagFromLead, getLead } from '@/lib/actions'
import { ReminderForm } from './reminder-form'
import { TagInput } from './tag-input'
import { toast } from 'sonner'

type Tag = {
  id: string
  name: string
  color: string
}

type Note = {
  id: string
  content: string
  createdAt: Date
  author: { name: string }
}

type LeadBasic = {
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
  altEmail: string | null
  discord: string | null
  phone: string | null
  website: string | null
  linkedin: string | null
  pitchAngle: string | null
  assignee: { id: string; name: string; email: string } | null
  tags: Tag[]
}

type TeamMember = {
  id: string
  name: string
  email: string
}

interface LeadDetailModalProps {
  lead: LeadBasic
  teamMembers: TeamMember[]
  stages?: string[]
  stageLabels?: Record<string, string>
  isOpen: boolean
  onClose: () => void
  currentUserId?: string | null
}

export function LeadDetailModal({
  lead,
  teamMembers,
  stages = [],
  stageLabels = {},
  isOpen,
  onClose,
  currentUserId,
}: LeadDetailModalProps) {
  const [isPending, startTransition] = useTransition()
  const [noteContent, setNoteContent] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [localStage, setLocalStage] = useState(lead.stage)
  const [editForm, setEditForm] = useState({
    name: lead.name,
    telegram: lead.telegram || '',
    twitter: lead.twitter || '',
    farcaster: lead.farcaster || '',
    tiktok: lead.tiktok || '',
    youtube: lead.youtube || '',
    twitch: lead.twitch || '',
    instagram: lead.instagram || '',
    email: lead.email || '',
    altEmail: lead.altEmail || '',
    discord: lead.discord || '',
    phone: lead.phone || '',
    website: lead.website || '',
    linkedin: lead.linkedin || '',
    pitchAngle: lead.pitchAngle || '',
  })

  // Sync local stage when lead prop updates from server (after revalidation)
  useEffect(() => {
    setLocalStage(lead.stage)
  }, [lead.stage])

  // Sync edit form when a different lead is opened (lead.id changes)
  useEffect(() => {
    setEditForm({
      name: lead.name,
      telegram: lead.telegram || '',
      twitter: lead.twitter || '',
      farcaster: lead.farcaster || '',
      tiktok: lead.tiktok || '',
      youtube: lead.youtube || '',
      twitch: lead.twitch || '',
      instagram: lead.instagram || '',
      email: lead.email || '',
      altEmail: lead.altEmail || '',
      discord: lead.discord || '',
      phone: lead.phone || '',
      website: lead.website || '',
      linkedin: lead.linkedin || '',
      pitchAngle: lead.pitchAngle || '',
    })
    setIsEditing(false)
    setNoteContent('')
    setShowDeleteConfirm(false)
  }, [lead.id])

  // Fetch notes when modal opens or lead changes
  useEffect(() => {
    if (isOpen) {
      setIsLoadingNotes(true)
      getLead(lead.id).then((fullLead) => {
        if (fullLead?.notes) {
          setNotes(fullLead.notes as Note[])
        }
        setIsLoadingNotes(false)
      })
    }
  }, [isOpen, lead.id])

  if (!isOpen) return null

  const handleStageChange = (newStage: string) => {
    setLocalStage(newStage) // Optimistic update
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
    // Use current user as author
    const authorId = currentUserId || teamMembers[0]?.id
    if (!authorId) return
    const author = teamMembers.find(m => m.id === authorId)

    startTransition(async () => {
      const newNote = await addNote(lead.id, noteContent.trim(), authorId)
      // Add to local state immediately
      setNotes(prev => [{
        id: newNote.id,
        content: newNote.content,
        createdAt: newNote.createdAt,
        author: { name: author?.name || 'Unknown' }
      }, ...prev])
      setNoteContent('')
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLead(lead.id)
      toast.success('Lead deleted')
      onClose()
    })
  }

  const handleArchive = () => {
    startTransition(async () => {
      await archiveLead(lead.id)
      toast.success('Lead archived')
      onClose()
    })
  }

  const handleDeleteNote = (noteId: string) => {
    startTransition(async () => {
      await deleteNote(noteId)
      // Remove from local state
      setNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success('Note deleted')
    })
  }

  const handleStartEditNote = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingNoteContent(note.content)
  }

  const handleCancelEditNote = () => {
    setEditingNoteId(null)
    setEditingNoteContent('')
  }

  const handleSaveNote = (noteId: string) => {
    if (!editingNoteContent.trim()) return
    startTransition(async () => {
      const result = await updateNote(noteId, editingNoteContent.trim())
      if (result && 'error' in result) {
        toast.error(result.error)
        return
      }
      // Update local state
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: editingNoteContent.trim() } : n))
      setEditingNoteId(null)
      setEditingNoteContent('')
      toast.success('Note updated')
    })
  }

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required')
      return
    }
    startTransition(async () => {
      const result = await updateLead(lead.id, {
        name: editForm.name,
        telegram: editForm.telegram || undefined,
        twitter: editForm.twitter || undefined,
        farcaster: editForm.farcaster || undefined,
        tiktok: editForm.tiktok || undefined,
        youtube: editForm.youtube || undefined,
        twitch: editForm.twitch || undefined,
        instagram: editForm.instagram || undefined,
        email: editForm.email || undefined,
        altEmail: editForm.altEmail || undefined,
        discord: editForm.discord || undefined,
        phone: editForm.phone || undefined,
        website: editForm.website || undefined,
        linkedin: editForm.linkedin || undefined,
        pitchAngle: editForm.pitchAngle || undefined,
      })
      if (result && 'error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Lead updated')
      setIsEditing(false)
    })
  }

  const socialPlatforms: SocialPlatform[] = ['telegram', 'twitter', 'farcaster', 'tiktok', 'youtube', 'twitch', 'instagram', 'email', 'discord', 'linkedin']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                autoFocus
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lead.name}</h2>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Created {new Date(notes[notes.length - 1]?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowReminderForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium"
                >
                  <Clock className="w-4 h-4" />
                  Reminder
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              value={localStage}
              onChange={e => handleStageChange(e.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>
                  {stageLabels[stage] || stage}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <TagInput
              selectedTags={lead.tags}
              onChange={async (newTags) => {
                // Find added tags
                const addedTags = newTags.filter(t => !lead.tags.some(lt => lt.id === t.id))
                // Find removed tags
                const removedTags = lead.tags.filter(lt => !newTags.some(t => t.id === lt.id))

                startTransition(async () => {
                  for (const tag of addedTags) {
                    await addTagToLead(lead.id, tag.id)
                  }
                  for (const tag of removedTags) {
                    await removeTagFromLead(lead.id, tag.id)
                  }
                })
              }}
              placeholder="Add tags..."
            />
          </div>

          {/* Social handles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Social Presence
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                {socialPlatforms.map(platform => (
                  <div key={platform}>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">{platform}</label>
                    <input
                      type={platform === 'email' ? 'email' : 'text'}
                      value={editForm[platform]}
                      onChange={(e) => setEditForm({ ...editForm, [platform]: e.target.value })}
                      placeholder={platform === 'email' ? 'email@example.com' : `@${platform}`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Alt Email</label>
                  <input
                    type="text"
                    value={editForm.altEmail}
                    onChange={(e) => setEditForm({ ...editForm, altEmail: e.target.value })}
                    placeholder="alt@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Website</label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <>
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
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                    <span className="capitalize font-medium text-gray-700 dark:text-gray-200">{platform}</span>
                    <span className="text-gray-500 dark:text-gray-400 truncate">{handle}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
                  </a>
                )
              })}
            </div>
            {/* Non-linkable contact fields */}
            <div className="grid grid-cols-2 gap-2">
              {lead.altEmail && (
                <a
                  href={`mailto:${lead.altEmail}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200">Alt Email</span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">{lead.altEmail}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200">Phone</span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">{lead.phone}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
                </a>
              )}
              {lead.website && (
                <a
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200">Website</span>
                  <span className="text-gray-500 dark:text-gray-400 truncate">{lead.website}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
                </a>
              )}
            </div>
            {!socialPlatforms.some(p => lead[p]) && !lead.altEmail && !lead.phone && !lead.website && (
              <p className="text-sm text-gray-400 dark:text-gray-500">No social handles added</p>
            )}
              </>
            )}
          </div>

          {/* Pitch Angle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pitch Angle
            </label>
            {isEditing ? (
              <textarea
                value={editForm.pitchAngle}
                onChange={(e) => setEditForm({ ...editForm, pitchAngle: e.target.value })}
                placeholder="How should we pitch this lead? What's the angle?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : lead.pitchAngle ? (
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {lead.pitchAngle}
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No pitch angle set</p>
            )}
          </div>

          {/* Notes section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes ({isLoadingNotes ? '...' : notes.length})
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
              {isLoadingNotes ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No notes yet. Add the first one above.
                </p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 group">
                    {editingNoteId === note.id ? (
                      <>
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveNote(note.id)}
                            disabled={isPending || !editingNoteContent.trim()}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEditNote}
                            className="px-3 py-1.5 text-gray-600 dark:text-gray-300 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap flex-1">{note.content}</p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEditNote(note)}
                              disabled={isPending}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Edit note"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={isPending}
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {note.author.name} • {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-red-600 dark:text-red-400">Delete this lead?</span>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleArchive}
                disabled={isPending}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
              >
                Archive
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
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
