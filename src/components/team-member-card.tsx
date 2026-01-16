'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle, X, Edit2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTeamMember, updateTeamMember } from '@/lib/actions'

interface TeamMemberCardProps {
  member: {
    id: string
    name: string
    email: string
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
          email: editEmail.trim() 
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
    setIsEditing(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
        {isEditing ? (
          <div className="flex-1 space-y-2 mr-4">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name"
            />
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
            />
          </div>
        ) : (
          <div>
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{member._count.leads}</div>
            <div className="text-sm text-gray-500">leads assigned</div>
          </div>
          
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Team Member</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>{member.name}</strong>?
            </p>
            
            {member._count.leads > 0 && (
              <p className="text-amber-600 text-sm mb-4 p-3 bg-amber-50 rounded-lg">
                ⚠️ This will unassign {member._count.leads} lead{member._count.leads > 1 ? 's' : ''} currently assigned to this team member.
              </p>
            )}
            
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone. Any notes authored by this team member will also be deleted.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
