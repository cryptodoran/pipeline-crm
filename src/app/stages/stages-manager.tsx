'use client'

import { useState, useTransition } from 'react'
import { 
  Plus, X, Edit2, Trash2, GripVertical, Check,
  Star, Trophy, XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { createStage, updateStage, deleteStage, reorderStages } from '@/lib/stage-actions'

type Stage = {
  id: string
  name: string
  key: string
  color: string
  order: number
  isDefault: boolean
  isWon: boolean
  isLost: boolean
}

interface StagesManagerProps {
  initialStages: Stage[]
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Blue', preview: 'bg-blue-500' },
  { value: 'bg-purple-500', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'bg-amber-500', label: 'Amber', preview: 'bg-amber-500' },
  { value: 'bg-cyan-500', label: 'Cyan', preview: 'bg-cyan-500' },
  { value: 'bg-green-500', label: 'Green', preview: 'bg-green-500' },
  { value: 'bg-red-500', label: 'Red', preview: 'bg-red-500' },
  { value: 'bg-pink-500', label: 'Pink', preview: 'bg-pink-500' },
  { value: 'bg-indigo-500', label: 'Indigo', preview: 'bg-indigo-500' },
  { value: 'bg-teal-500', label: 'Teal', preview: 'bg-teal-500' },
  { value: 'bg-orange-500', label: 'Orange', preview: 'bg-orange-500' },
  { value: 'bg-gray-500', label: 'Gray', preview: 'bg-gray-500' },
]

export function StagesManager({ initialStages }: StagesManagerProps) {
  const [stages, setStages] = useState(initialStages)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<Stage | null>(null)
  const [isPending, startTransition] = useTransition()
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    color: 'bg-blue-500',
    isWon: false,
    isLost: false,
  })

  const resetForm = () => {
    setFormData({ name: '', color: 'bg-blue-500', isWon: false, isLost: false })
  }

  const handleOpenEdit = (stage: Stage) => {
    setFormData({
      name: stage.name,
      color: stage.color,
      isWon: stage.isWon,
      isLost: stage.isLost,
    })
    setEditingStage(stage)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Stage name is required')
      return
    }

    startTransition(async () => {
      try {
        if (editingStage) {
          await updateStage(editingStage.id, {
            name: formData.name,
            color: formData.color,
            isWon: formData.isWon,
            isLost: formData.isLost,
          })
          toast.success('Stage updated')
          setEditingStage(null)
        } else {
          const key = formData.name.toUpperCase().replace(/\s+/g, '_')
          await createStage({
            name: formData.name,
            key,
            color: formData.color,
            isWon: formData.isWon,
            isLost: formData.isLost,
          })
          toast.success('Stage created')
          setIsAddModalOpen(false)
        }
        resetForm()
        window.location.reload()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save stage')
      }
    })
  }

  const handleDelete = (stage: Stage) => {
    if (stage.isDefault) {
      toast.error('Cannot delete the default stage')
      return
    }

    if (!confirm(`Delete "${stage.name}" stage? Leads in this stage must be moved first.`)) return

    startTransition(async () => {
      try {
        await deleteStage(stage.id)
        setStages(stages.filter(s => s.id !== stage.id))
        toast.success('Stage deleted')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete stage')
      }
    })
  }

  const handleSetDefault = (stage: Stage) => {
    startTransition(async () => {
      try {
        await updateStage(stage.id, { isDefault: true })
        setStages(stages.map(s => ({
          ...s,
          isDefault: s.id === stage.id,
        })))
        toast.success(`"${stage.name}" is now the default stage for new leads`)
      } catch {
        toast.error('Failed to set default stage')
      }
    })
  }

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, stageId: string) => {
    setDraggedId(stageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const draggedIndex = stages.findIndex(s => s.id === draggedId)
    const targetIndex = stages.findIndex(s => s.id === targetId)

    const newStages = [...stages]
    const [removed] = newStages.splice(draggedIndex, 1)
    newStages.splice(targetIndex, 0, removed)

    setStages(newStages)
    setDraggedId(null)

    // Save new order
    startTransition(async () => {
      try {
        await reorderStages(newStages.map(s => s.id))
        toast.success('Stages reordered')
      } catch {
        toast.error('Failed to reorder stages')
      }
    })
  }

  return (
    <>
      {/* Add Stage Button */}
      <button
        onClick={() => { resetForm(); setIsAddModalOpen(true) }}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Stage
      </button>

      {/* Stages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag stages to reorder. The order here is how they appear on the Kanban board.
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stages.map(stage => (
            <div
              key={stage.id}
              draggable
              onDragStart={(e) => handleDragStart(e, stage.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-move ${
                draggedId === stage.id ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              
              <div className={`w-4 h-4 rounded-full ${stage.color} flex-shrink-0`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{stage.name}</h3>
                  {stage.isDefault && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                      Default
                    </span>
                  )}
                  {stage.isWon && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      <Trophy className="w-3 h-3" />
                      Won
                    </span>
                  )}
                  {stage.isLost && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                      <XCircle className="w-3 h-3" />
                      Lost
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Key: {stage.key}</p>
              </div>

              <div className="flex items-center gap-2">
                {!stage.isDefault && (
                  <button
                    onClick={() => handleSetDefault(stage)}
                    disabled={isPending}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg disabled:opacity-50"
                    title="Set as default for new leads"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleOpenEdit(stage)}
                  disabled={isPending}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(stage)}
                  disabled={isPending || stage.isDefault}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                  title={stage.isDefault ? "Cannot delete default stage" : "Delete"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingStage) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingStage ? 'Edit Stage' : 'Add New Stage'}
              </h2>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingStage(null); resetForm() }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Qualified, Negotiation"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full ${color.preview} ${
                        formData.color === color.value 
                          ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' 
                          : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isWon}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isWon: e.target.checked,
                      isLost: e.target.checked ? false : formData.isLost,
                    })}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Won stage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isLost}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isLost: e.target.checked,
                      isWon: e.target.checked ? false : formData.isWon,
                    })}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Lost stage</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingStage(null); resetForm() }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : editingStage ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
