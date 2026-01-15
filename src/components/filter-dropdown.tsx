'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'

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

interface FilterDropdownProps {
  selectedFilters: PlatformFilter[]
  onChange: (filters: PlatformFilter[]) => void
}

export function FilterDropdown({ selectedFilters, onChange }: FilterDropdownProps) {
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

  const clearAll = () => {
    onChange([])
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-md transition-colors ${
          selectedFilters.length > 0
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 hover:bg-gray-50 text-gray-700'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Filter</span>
        {selectedFilters.length > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {selectedFilters.length}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-500 uppercase tracking-wide">
              <span>Platforms</span>
              {selectedFilters.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-blue-500 hover:text-blue-700 normal-case"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-1 space-y-0.5">
              {FILTER_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(option.value)}
                    onChange={() => toggleFilter(option.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
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
}

export function FilterBadges({ selectedFilters, onRemove, onClearAll }: FilterBadgesProps) {
  if (selectedFilters.length === 0) return null

  const getLabel = (filter: PlatformFilter) => {
    return FILTER_OPTIONS.find(o => o.value === filter)?.label || filter
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
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
      {selectedFilters.length > 1 && (
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
