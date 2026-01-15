'use client'

import { useDraggable } from '@dnd-kit/core'
import { useState } from 'react'
import { SOCIAL_URLS, SocialPlatform } from '@/lib/types'
import { LeadDetailModal } from './lead-detail-modal'
import { TagPills } from './tag-input'
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
} from 'lucide-react'

type Tag = {
  id: string
  name: string
  color: string
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
  assignee: { id: string; name: string; email: string } | null
  tags?: Tag[]
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
  isDragging?: boolean
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

export function LeadCard({ lead, teamMembers, isDragging }: LeadCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
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

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => setIsModalOpen(true)}
        className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
          isDragging ? 'shadow-lg opacity-90' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900 truncate">{lead.name}</h4>
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
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Assignee and notes count */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {lead.assignee ? (
              <>
                <User className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{lead.assignee.name}</span>
              </>
            ) : (
              <span className="text-gray-400">Unassigned</span>
            )}
          </div>
          {lead.notes.length > 0 && (
            <span>{lead.notes.length} note{lead.notes.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <LeadDetailModal
        lead={lead}
        teamMembers={teamMembers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
