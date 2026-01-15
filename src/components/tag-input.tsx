'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { createTag, addTagToLead, removeTagFromLead } from '@/lib/actions'

type Tag = {
  id: string
  name: string
  color: string
}

interface TagInputProps {
  leadId: string
  selectedTags: Tag[]
  availableTags: Tag[]
  onTagsChange?: (tags: Tag[]) => void
}

export function TagInput({ leadId, selectedTags, availableTags, onTagsChange }: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [localTags, setLocalTags] = useState<Tag[]>(selectedTags)
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalTags(selectedTags)
  }, [selectedTags])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredTags = availableTags.filter(
    tag =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !localTags.some(t => t.id === tag.id)
  )

  const canCreateNew = search.trim() && !availableTags.some(
    t => t.name.toLowerCase() === search.toLowerCase()
  )

  async function handleAddTag(tag: Tag) {
    try {
      await addTagToLead(leadId, tag.id)
      const newTags = [...localTags, tag]
      setLocalTags(newTags)
      onTagsChange?.(newTags)
      setSearch('')
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  async function handleRemoveTag(tagId: string) {
    try {
      await removeTagFromLead(leadId, tagId)
      const newTags = localTags.filter(t => t.id !== tagId)
      setLocalTags(newTags)
      onTagsChange?.(newTags)
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  async function handleCreateTag() {
    if (!search.trim() || isCreating) return
    setIsCreating(true)
    try {
      const newTag = await createTag({ name: search.trim() })
      await addTagToLead(leadId, newTag.id)
      const newTags = [...localTags, newTag]
      setLocalTags(newTags)
      onTagsChange?.(newTags)
      setSearch('')
    } catch (error) {
      console.error('Failed to create tag:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <div className="flex flex-wrap gap-1.5">
        {localTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 border border-dashed border-gray-300 rounded-full hover:border-gray-400 hover:text-gray-600"
        >
          <Plus className="h-3 w-3" />
          Add tag
        </button>
      </div>

      {isOpen && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search or create tag..."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => {
              if (e.key === 'Enter' && canCreateNew) {
                e.preventDefault()
                handleCreateTag()
              }
            }}
          />
          {(filteredTags.length > 0 || canCreateNew) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))}
              {canCreateNew && (
                <button
                  onClick={handleCreateTag}
                  disabled={isCreating}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-blue-600 hover:bg-blue-50 border-t border-gray-100"
                >
                  <Plus className="h-4 w-4" />
                  Create &quot;{search}&quot;
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Simple display-only tag pills for lead cards
export function TagPills({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map(tag => (
        <span
          key={tag.id}
          className="px-1.5 py-0.5 text-[10px] font-medium rounded"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
        >
          {tag.name}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="px-1.5 py-0.5 text-[10px] text-gray-500">
          +{tags.length - 3}
        </span>
      )}
    </div>
  )
}
