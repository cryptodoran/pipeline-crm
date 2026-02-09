'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { X, Trash2 } from 'lucide-react'
import { getTags, createTag, deleteTag } from '@/lib/actions'

type Tag = {
  id: string
  name: string
  color: string
}

interface TagInputProps {
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
  placeholder?: string
}

export function TagInput({ selectedTags, onChange, placeholder = 'Add tags...' }: TagInputProps) {
  const [input, setInput] = useState('')
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load all tags on mount
  useEffect(() => {
    getTags().then(tags => setAllTags(tags))
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter tags based on input
  const filteredTags = allTags.filter(
    tag =>
      tag.name.toLowerCase().includes(input.toLowerCase()) &&
      !selectedTags.some(t => t.id === tag.id)
  )

  const handleAddTag = async (tag: Tag) => {
    onChange([...selectedTags, tag])
    setInput('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleCreateTag = async () => {
    const name = input.trim()
    if (!name) return

    // Check if tag already exists (case-insensitive)
    const existing = allTags.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!selectedTags.some(t => t.id === existing.id)) {
        handleAddTag(existing)
      }
      return
    }

    // Create new tag
    startTransition(async () => {
      const newTag = await createTag({ name })
      setAllTags([...allTags, newTag])
      onChange([...selectedTags, newTag])
      setInput('')
      setShowDropdown(false)
    })
  }

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter(t => t.id !== tagId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (filteredTags.length > 0) {
        handleAddTag(filteredTags[0])
      } else if (input.trim()) {
        handleCreateTag()
      }
    } else if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1].id)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleDeleteTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      await deleteTag(tagId)
      setAllTags(allTags.filter(t => t.id !== tagId))
      // Also remove from selected if it was selected
      onChange(selectedTags.filter(t => t.id !== tagId))
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[42px]">
        {/* Selected tags */}
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-sm rounded-full"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:opacity-70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          disabled={isPending}
          className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (input || filteredTags.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredTags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <button
                type="button"
                onClick={() => handleAddTag(tag)}
                className="flex-1 px-3 py-2 text-left text-sm flex items-center gap-2"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteTag(tag.id, e)}
                className="px-2 py-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete tag"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {input.trim() && !allTags.some(t => t.name.toLowerCase() === input.toLowerCase()) && (
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={isPending}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
            >
              {isPending ? 'Creating...' : `Create "${input.trim()}"`}
            </button>
          )}
          {!input && filteredTags.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Type to search or create tags
            </div>
          )}
        </div>
      )}
    </div>
  )
}
