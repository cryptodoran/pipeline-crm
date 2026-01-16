'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, X, ChevronDown, Tag as TagIcon } from 'lucide-react'
import { LEAD_SOURCES } from '@/lib/types'

export type PlatformFilter =
  | 'telegram'
  | 'twitter'
  | 'farcaster'
  | 'tiktok'
  | 'youtube'
  | 'twitch'
  | 'instagram'
  | 'email'

interface FilterOption {
  value: PlatformFilter
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'telegram', label: 'Has Telegram' },
  { value: 'twitter', label: 'Has Twitter' },
  { value: 'farcaster', label: 'Has Farcaster' },
  { value: 'tiktok', label: 'Has TikTok' },
  { value: 'youtube', label: 'Has YouTube' },
  { value: 'twitch', label: 'Has Twitch' },
  { value: 'instagram', label: 'Has Instagram' },
  { value: 'email', label: 'Has Email' },
]

type Tag = {
  id: string
  name: string
  color: string
}

interface FilterDropdownProps {
  selectedFilters: PlatformFilter[]
  onChange: (filters: PlatformFilter[]) => void
  availableTags?: Tag[]
  selectedTagIds?: string[]
  onTagsChange?: (tagIds: string[]) => void
  selectedSources?: string[]
  onSourcesChange?: (sources: string[]) => void
}

export function FilterDropdown({
  selectedFilters,
  onChange,
  availableTags = [],
  selectedTagIds = [],
  onTagsChange,
  selectedSources = [],
  onSourcesChange,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleFilter = (filter: PlatformFilter) => {
    if (selectedFilters.includes(filter)) {
      onChange(selectedFilters.filter(f => f !== filter))
    } else {
      onChange([...selectedFilters, filter])
    }
  }

  const toggleTag = (tagId: string) => {
    if (!onTagsChange) return
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTagIds, tagId])
    }
  }

  const toggleSource = (source: string) => {
    if (!onSourcesChange) return
    if (selectedSources.includes(source)) {
      onSourcesChange(selectedSources.filter(s => s !== source))
    } else {
      onSourcesChange([...selectedSources, source])
    }
  }

  const clearAll = () => {
    onChange([])
    onTagsChange?.([])
    onSourcesChange?.([])
    setIsOpen(false)
  }

  const totalFilters = selectedFilters.length + selectedTagIds.length + selectedSources.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
          totalFilters > 0
            ? 'border-blue-500 bg-blue-900/30 text-blue-400'
            : 'border-gray-600 hover:bg-gray-700 text-gray-300'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Filter</span>
        {totalFilters > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {totalFilters}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {/* Tags Section */}
            {availableTags.length > 0 && (
              <>
                <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 uppercase tracking-wide">
                  <span className="flex items-center gap-1">
                    <TagIcon className="h-3 w-3" />
                    Tags
                  </span>
                </div>
                <div className="mt-1 space-y-0.5 mb-3">
                  {availableTags.map(tag => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTagIds.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm text-gray-200 truncate">{tag.name}</span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-gray-700 my-2" />
              </>
            )}

            {/* Platforms Section */}
            <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 uppercase tracking-wide">
              <span>Platforms</span>
              {totalFilters > 0 && (
                <button
                  onClick={clearAll}
                  className="text-blue-400 hover:text-blue-300 normal-case"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-1 space-y-0.5">
              {FILTER_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(option.value)}
                    onChange={() => toggleFilter(option.value)}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-200">{option.label}</span>
                </label>
              ))}
            </div>

            {/* Sources Section */}
            <div className="border-t border-gray-700 my-2" />
            <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 uppercase tracking-wide">
              <span>Sources</span>
            </div>
            <div className="mt-1 space-y-0.5">
              {LEAD_SOURCES.map(source => (
                <label
                  key={source}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-200">{source}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface FilterBadgesProps {
  selectedFilters: PlatformFilter[]
  onRemove: (filter: PlatformFilter) => void
  onClearAll: () => void
  availableTags?: Tag[]
  selectedTagIds?: string[]
  onRemoveTag?: (tagId: string) => void
  selectedSources?: string[]
  onRemoveSource?: (source: string) => void
}

export function FilterBadges({
  selectedFilters,
  onRemove,
  onClearAll,
  availableTags = [],
  selectedTagIds = [],
  onRemoveTag,
  selectedSources = [],
  onRemoveSource,
}: FilterBadgesProps) {
  const totalFilters = selectedFilters.length + selectedTagIds.length + selectedSources.length
  if (totalFilters === 0) return null

  const getLabel = (filter: PlatformFilter) => {
    return FILTER_OPTIONS.find(o => o.value === filter)?.label || filter
  }

  const getTag = (tagId: string) => {
    return availableTags.find(t => t.id === tagId)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Tag badges */}
      {selectedTagIds.map(tagId => {
        const tag = getTag(tagId)
        if (!tag) return null
        return (
          <span
            key={tagId}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
            {onRemoveTag && (
              <button
                onClick={() => onRemoveTag(tagId)}
                className="hover:bg-black/10 rounded-full p-0.5"
                aria-label={`Remove ${tag.name} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        )
      })}
      {/* Platform badges */}
      {selectedFilters.map(filter => (
        <span
          key={filter}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
        >
          {getLabel(filter)}
          <button
            onClick={() => onRemove(filter)}
            className="hover:bg-blue-200 rounded-full p-0.5"
            aria-label={`Remove ${getLabel(filter)} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {/* Source badges */}
      {selectedSources.map(source => (
        <span
          key={source}
          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
        >
          {source}
          {onRemoveSource && (
            <button
              onClick={() => onRemoveSource(source)}
              className="hover:bg-purple-200 rounded-full p-0.5"
              aria-label={`Remove ${source} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      {totalFilters > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
