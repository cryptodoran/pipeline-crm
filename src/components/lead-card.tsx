'use client'

import { useDraggable } from '@dnd-kit/core'
import { useState } from 'react'
import { SOCIAL_URLS, SocialPlatform, SOURCE_COLORS } from '@/lib/types'
import { LeadDetailModal } from './lead-detail-modal'
import { TagPills } from './tag-input'
import { QuickActionsCompact } from './quick-actions'
import {
  MessageCircle,
  Twitter,
  Cast,
  Music2,
  Youtube,
  Twitch,
  Instagram,
  Mail,
  User,
  Check,
  Bell,
  Flame,
} from 'lucide-react'

type Tag = {
  id: string
  name: string
  color: string
}

type Reminder = {
  id: string
  dueAt: Date
  note: string | null
  completed: boolean
}

type Lead = {
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
  source: string | null
  score?: number
  isHot?: boolean
  assignee: { id: string; name: string; email: string } | null
  tags?: Tag[]
  reminders?: Reminder[]
  notes: Array<{
    id: string
    content: string
    createdAt: Date
    author: { name: string }
  }>
}

type TeamMember = {
  id: string
  name: string
  email: string
}

interface LeadCardProps {
  lead: Lead
  teamMembers: TeamMember[]
  availableTags?: Tag[]
  isDragging?: boolean
  selectionMode?: boolean
  isSelected?: boolean
  onSelectionChange?: (leadId: string, selected: boolean) => void
}

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  telegram: MessageCircle,
  twitter: Twitter,
  farcaster: Cast,
  tiktok: Music2,
  youtube: Youtube,
  twitch: Twitch,
  instagram: Instagram,
  email: Mail,
}

export function LeadCard({
  lead,
  teamMembers,
  availableTags = [],
  isDragging,
  selectionMode = false,
  isSelected = false,
  onSelectionChange,
}: LeadCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
    disabled: selectionMode,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  // Get active social platforms
  const activeSocials = (Object.keys(SOCIAL_URLS) as SocialPlatform[]).filter(
    platform => lead[platform]
  )

  const handleClick = () => {
    if (selectionMode) {
      onSelectionChange?.(lead.id, !isSelected)
    } else {
      setIsModalOpen(true)
    }
  }

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectionChange?.(lead.id, !isSelected)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(selectionMode ? {} : { ...listeners, ...attributes })}
        onClick={handleClick}
        className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-2 hover:shadow-md transition-all ${
          isDragging ? 'shadow-lg opacity-90' : ''
        } ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} ${
          selectionMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectionMode && (
              <div
                onClick={handleCheckboxClick}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            )}
            {/* Hot lead indicator */}
            {(lead.isHot || (lead.score && lead.score >= 70)) && (
              <span title="Hot lead">
                <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
              </span>
            )}
            <h4 className="font-medium text-gray-900 dark:text-white truncate">{lead.name}</h4>
            {/* Lead score badge */}
            {lead.score !== undefined && lead.score > 0 && (
              <span 
                className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${
                  lead.score >= 70 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  lead.score >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
                title={`Lead score: ${lead.score}`}
              >
                {lead.score}
              </span>
            )}
            {lead.reminders && lead.reminders.length > 0 && (
              <div
                className={`flex-shrink-0 ${
                  new Date(lead.reminders[0].dueAt) <= new Date()
                    ? 'text-red-500'
                    : new Date(lead.reminders[0].dueAt) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
                    ? 'text-amber-500'
                    : 'text-blue-500'
                }`}
                title={`Reminder: ${new Date(lead.reminders[0].dueAt).toLocaleDateString()}`}
              >
                <Bell className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Social icons */}
        <div className="flex gap-1 mb-2 flex-wrap">
          {activeSocials.map(platform => {
            const Icon = SOCIAL_ICONS[platform]
            const handle = lead[platform]
            if (!handle) return null

            return (
              <a
                key={platform}
                href={SOCIAL_URLS[platform](handle)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title={`${platform}: ${handle}`}
              >
                <Icon className="w-4 h-4" />
              </a>
            )
          })}
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="mb-2">
            <TagPills tags={lead.tags} />
          </div>
        )}

        {/* Source badge */}
        {lead.source && (
          <div className="mb-2">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${SOURCE_COLORS[lead.source] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
              {lead.source}
            </span>
          </div>
        )}

        {/* Assignee and notes count */}
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            {lead.assignee ? (
              <>
                <User className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{lead.assignee.name}</span>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">Unassigned</span>
            )}
          </div>
          {lead.notes.length > 0 && (
            <span>{lead.notes.length} note{lead.notes.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <QuickActionsCompact leadId={lead.id} leadName={lead.name} />
        </div>
      </div>

      <LeadDetailModal
        lead={lead}
        teamMembers={teamMembers}
        availableTags={availableTags}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
