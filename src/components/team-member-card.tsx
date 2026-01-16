'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle, X, Edit2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTeamMember, updateTeamMember } from '@/lib/actions'

// Preset colors for team members
const TEAM_COLORS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#64748b', label: 'Gray' },
]

interface TeamMemberCardProps {
  member: {
    id: string
    name: string
    email: string
    color?: string
    slackUserId?: string | null
    telegramChatId?: string | null
    notifyOnReminder?: boolean
    _count: {
      leads: number
    }
  }
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(member.name)
  const [editEmail, setEditEmail] = useState(member.email)
  const [editColor, setEditColor] = useState(member.color || '#6366f1')
  const [editSlackUserId, setEditSlackUserId] = useState(member.slackUserId || '')
  const [editTelegramChatId, setEditTelegramChatId] = useState(member.telegramChatId || '')
  const [editNotifyOnReminder, setEditNotifyOnReminder] = useState(member.notifyOnReminder !== false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTeamMember(member.id)
        toast.success(`${member.name} has been removed`)
        setShowDeleteModal(false)
      } catch {
        toast.error('Failed to delete team member')
      }
    })
  }

  const handleSaveEdit = () => {
    if (!editName.trim() || !editEmail.trim()) {
      toast.error('Name and email are required')
      return
    }

    startTransition(async () => {
      try {
        await updateTeamMember(member.id, {
          name: editName.trim(),
          email: editEmail.trim(),
          color: editColor,
          slackUserId: editSlackUserId.trim() || null,
          telegramChatId: editTelegramChatId.trim() || null,
          notifyOnReminder: editNotifyOnReminder,
        })
        toast.success('Team member updated')
        setIsEditing(false)
      } catch {
        toast.error('Failed to update team member')
      }
    })
  }

  const handleCancelEdit = () => {
    setEditName(member.name)
    setEditEmail(member.email)
    setEditColor(member.color || '#6366f1')
    setEditSlackUserId(member.slackUserId || '')
    setEditTelegramChatId(member.telegramChatId || '')
    setEditNotifyOnReminder(member.notifyOnReminder !== false)
    setIsEditing(false)
  }

  return (
    <>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex justify-between items-center hover:bg-gray-750 transition-colors">
        {isEditing ? (
          <div className="flex-1 space-y-2 mr-4">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-600 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name"
            />
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-600 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Color:</span>
              <div className="flex gap-1">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setEditColor(color.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      editColor === color.value
                        ? 'border-white scale-110'
                        : 'border-transparent hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="pt-2 border-t border-gray-600 space-y-2">
              <span className="text-sm text-gray-400">Notifications:</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`notify-${member.id}`}
                  checked={editNotifyOnReminder}
                  onChange={(e) => setEditNotifyOnReminder(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor={`notify-${member.id}`} className="text-sm text-gray-300">
                  Receive reminder notifications
                </label>
              </div>
              <input
                type="text"
                value={editSlackUserId}
                onChange={(e) => setEditSlackUserId(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-600 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Slack User ID (e.g., U01234567)"
              />
              <input
                type="text"
                value={editTelegramChatId}
                onChange={(e) => setEditTelegramChatId(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-600 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Telegram Chat ID (optional)"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: member.color || '#6366f1' }}
              title="Team member color"
            />
            <div>
              <h3 className="font-medium text-white">{member.name}</h3>
              <p className="text-sm text-gray-400">{member.email}</p>
              {member.slackUserId && (
                <p className="text-xs text-purple-400 mt-0.5">
                  Slack: {member.slackUserId}
                </p>
              )}
              {!member.slackUserId && (
                <p className="text-xs text-gray-500 mt-0.5">
                  No Slack ID set
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{member._count.leads}</div>
            <div className="text-sm text-gray-400">leads assigned</div>
          </div>
          
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Team Member</h3>
            </div>
            
            <p className="text-gray-300 mb-2">
              Are you sure you want to delete <strong>{member.name}</strong>?
            </p>
            
            {member._count.leads > 0 && (
              <p className="text-amber-400 text-sm mb-4 p-3 bg-amber-900/30 rounded-lg">
                ⚠️ This will unassign {member._count.leads} lead{member._count.leads > 1 ? 's' : ''} currently assigned to this team member.
              </p>
            )}
            
            <p className="text-gray-400 text-sm mb-6">
              This action cannot be undone. Any notes authored by this team member will also be deleted.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
