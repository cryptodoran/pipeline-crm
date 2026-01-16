'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { createTag, updateTag, deleteTag } from '@/lib/actions'

type Tag = {
  id: string
  name: string
  color: string
  _count?: { leads: number }
}

const TAG_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Gray', value: '#6b7280' },
]

interface TagsManagerProps {
  initialTags: Tag[]
}

export function TagsManager({ initialTags }: TagsManagerProps) {
  const [tags, setTags] = useState(initialTags)
  const [isPending, startTransition] = useTransition()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newTagName.trim()) return

    startTransition(async () => {
      const tag = await createTag({ name: newTagName.trim(), color: newTagColor })
      setTags([...tags, { ...tag, _count: { leads: 0 } }])
      setNewTagName('')
      setNewTagColor(TAG_COLORS[0].value)
      setShowCreateForm(false)
    })
  }

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const handleSaveEdit = (tagId: string) => {
    if (!editName.trim()) return

    startTransition(async () => {
      await updateTag(tagId, { name: editName.trim(), color: editColor })
      setTags(tags.map(t =>
        t.id === tagId ? { ...t, name: editName.trim(), color: editColor } : t
      ))
      setEditingId(null)
    })
  }

  const handleDelete = (tagId: string) => {
    startTransition(async () => {
      await deleteTag(tagId)
      setTags(tags.filter(t => t.id !== tagId))
      setDeleteConfirmId(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Create new tag */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Tag
        </button>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="font-medium text-white mb-3">Create New Tag</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                placeholder="e.g., VIP, Hot Lead, Partner"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      newTagColor === color.value ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {newTagColor === color.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreate}
                disabled={isPending || !newTagName.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewTagName('')
                  setNewTagColor(TAG_COLORS[0].value)
                }}
                className="px-4 py-2 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags list */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {tags.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-lg font-medium">No tags yet</p>
            <p className="text-sm">Create your first tag to start categorizing leads</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {tags.map(tag => (
                <tr key={tag.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    {editingId === tag.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="px-2 py-1 border border-gray-600 bg-gray-700 text-white rounded text-sm focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          {TAG_COLORS.map(color => (
                            <button
                              key={color.value}
                              onClick={() => setEditColor(color.value)}
                              className={`w-6 h-6 rounded-full ${
                                editColor === color.value ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-gray-400' : ''
                              }`}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span
                        className="inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-full text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {tag._count?.leads || 0} lead{(tag._count?.leads || 0) !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === tag.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSaveEdit(tag.id)}
                          disabled={isPending}
                          className="p-1 text-green-400 hover:bg-gray-700 rounded"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-400 hover:bg-gray-700 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : deleteConfirmId === tag.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-red-400">Delete?</span>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          disabled={isPending}
                          className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-gray-400 text-xs font-medium hover:bg-gray-700 rounded"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-1 text-gray-400 hover:bg-gray-700 rounded"
                          title="Edit tag"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(tag.id)}
                          className="p-1 text-red-400 hover:bg-gray-700 rounded"
                          title="Delete tag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
