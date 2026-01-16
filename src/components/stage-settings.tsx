'use client'

import { useState, useTransition } from 'react'
import { 
  Settings2, Plus, X, GripVertical, Check, Star, Trophy, XCircle, Pencil, Trash2
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

interface StageSettingsProps {
  stages: Stage[]
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-amber-500', label: 'Amber' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-teal-500', label: 'Teal' },
  { value: 'bg-orange-500', label: 'Orange' },
]

export function StageSettings({ stages: initialStages }: StageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stages, setStages] = useState(initialStages)
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', color: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStage, setNewStage] = useState({ name: '', color: 'bg-blue-500', isWon: false, isLost: false })
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleStartEdit = (stage: Stage) => {
    setEditingId(stage.id)
    setEditForm({ name: stage.name, color: stage.color })
  }

  const handleSaveEdit = (stageId: string) => {
    if (!editForm.name.trim()) {
      toast.error('Stage name is required')
      return
    }

    startTransition(async () => {
      try {
        await updateStage(stageId, {
          name: editForm.name,
          color: editForm.color,
        })
        setStages(stages.map(s => 
          s.id === stageId ? { ...s, name: editForm.name, color: editForm.color } : s
        ))
        setEditingId(null)
        toast.success('Stage updated')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update stage')
      }
    })
  }

  const handleDelete = (stage: Stage) => {
    if (stage.isDefault) {
      toast.error('Cannot delete the default stage')
      return
    }

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
        toast.success(`"${stage.name}" is now the default stage`)
      } catch {
        toast.error('Failed to set default stage')
      }
    })
  }

  const handleAddStage = () => {
    if (!newStage.name.trim()) {
      toast.error('Stage name is required')
      return
    }

    startTransition(async () => {
      try {
        const key = newStage.name.toUpperCase().replace(/\s+/g, '_')
        await createStage({
          name: newStage.name,
          key,
          color: newStage.color,
          isWon: newStage.isWon,
          isLost: newStage.isLost,
        })
        toast.success('Stage created')
        setShowAddForm(false)
        setNewStage({ name: '', color: 'bg-blue-500', isWon: false, isLost: false })
        // Reload to get the new stage
        window.location.reload()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create stage')
      }
    })
  }

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
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        title="Manage pipeline stages"
      >
        <Settings2 className="w-4 h-4" />
        <span className="hidden sm:inline">Stages</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Pipeline Stages</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-130px)]">
              <p className="text-sm text-gray-400 mb-4">
                Drag to reorder stages. Click the star to set the default stage for new leads.
              </p>

              <div className="space-y-2">
                {stages.map(stage => (
                  <div
                    key={stage.id}
                    draggable={!editingId}
                    onDragStart={(e) => handleDragStart(e, stage.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                    className={`flex items-center gap-3 p-3 bg-gray-750 rounded-lg ${
                      draggedId === stage.id ? 'opacity-50' : ''
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                    
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    
                    {editingId === stage.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                          autoFocus
                        />
                        <select
                          value={editForm.color}
                          onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                        >
                          {COLOR_OPTIONS.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSaveEdit(stage.id)}
                          disabled={isPending}
                          className="p-1 text-green-400 hover:bg-gray-700 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-400 hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-white font-medium">{stage.name}</span>
                        
                        <div className="flex items-center gap-1">
                          {stage.isWon && (
                            <span title="Won stage">
                              <Trophy className="w-4 h-4 text-green-400" />
                            </span>
                          )}
                          {stage.isLost && (
                            <span title="Lost stage">
                              <XCircle className="w-4 h-4 text-red-400" />
                            </span>
                          )}
                          {stage.isDefault && (
                            <span title="Default stage">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </span>
                          )}
                          
                          {!stage.isDefault && (
                            <button
                              onClick={() => handleSetDefault(stage)}
                              className="p-1 text-gray-500 hover:text-yellow-400 hover:bg-gray-700 rounded"
                              title="Set as default"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(stage)}
                            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {!stage.isDefault && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${stage.name}"? Leads in this stage must be moved first.`)) {
                                  handleDelete(stage)
                                }
                              }}
                              disabled={isPending}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Stage Form */}
              {showAddForm ? (
                <div className="mt-4 p-4 bg-gray-750 rounded-lg border border-gray-600">
                  <h4 className="font-medium text-white mb-3">Add New Stage</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={newStage.name}
                        onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                        placeholder="e.g., Qualified"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map(c => (
                          <button
                            key={c.value}
                            onClick={() => setNewStage({ ...newStage, color: c.value })}
                            className={`w-6 h-6 rounded-full ${c.value} ${
                              newStage.color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-750' : ''
                            }`}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={newStage.isWon}
                          onChange={(e) => setNewStage({ ...newStage, isWon: e.target.checked, isLost: false })}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                        <Trophy className="w-4 h-4 text-green-400" />
                        Won stage
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={newStage.isLost}
                          onChange={(e) => setNewStage({ ...newStage, isLost: e.target.checked, isWon: false })}
                          className="rounded bg-gray-700 border-gray-600"
                        />
                        <XCircle className="w-4 h-4 text-red-400" />
                        Lost stage
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleAddStage}
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Add Stage
                      </button>
                      <button
                        onClick={() => {
                          setShowAddForm(false)
                          setNewStage({ name: '', color: 'bg-blue-500', isWon: false, isLost: false })
                        }}
                        className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Stage
                </button>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-750">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
