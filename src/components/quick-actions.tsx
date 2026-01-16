'use client'

import { useTransition } from 'react'
import { 
  Phone, Voicemail, PhoneOff, Mail, 
  MessageCircle, Users 
} from 'lucide-react'
import { toast } from 'sonner'
import { logQuickAction } from '@/lib/activity-actions'
import type { ActivityType } from '@/lib/activity-types'

interface QuickActionsProps {
  leadId: string
  leadName: string
  onAction?: () => void
}

const ACTION_CONFIG: Record<string, { 
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortLabel: string
  color: string
}> = {
  CALL: { 
    icon: Phone, 
    label: 'Log Call', 
    shortLabel: 'Call',
    color: 'hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400' 
  },
  LEFT_VM: { 
    icon: Voicemail, 
    label: 'Left Voicemail', 
    shortLabel: 'VM',
    color: 'hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400' 
  },
  NO_ANSWER: { 
    icon: PhoneOff, 
    label: 'No Answer', 
    shortLabel: 'N/A',
    color: 'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300' 
  },
  EMAIL: { 
    icon: Mail, 
    label: 'Sent Email', 
    shortLabel: 'Email',
    color: 'hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/30 dark:hover:text-purple-400' 
  },
  DM_SENT: { 
    icon: MessageCircle, 
    label: 'Sent DM', 
    shortLabel: 'DM',
    color: 'hover:bg-sky-100 hover:text-sky-700 dark:hover:bg-sky-900/30 dark:hover:text-sky-400' 
  },
  MEETING: { 
    icon: Users, 
    label: 'Had Meeting', 
    shortLabel: 'Meet',
    color: 'hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-400' 
  },
}

export function QuickActions({ leadId, leadName, onAction }: QuickActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleAction = (type: ActivityType) => {
    startTransition(async () => {
      try {
        await logQuickAction(leadId, type)
        toast.success(`${ACTION_CONFIG[type].label} logged for ${leadName}`)
        onAction?.()
      } catch {
        toast.error('Failed to log action')
      }
    })
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {Object.entries(ACTION_CONFIG).map(([type, config]) => {
        const Icon = config.icon
        return (
          <button
            key={type}
            onClick={(e) => {
              e.stopPropagation()
              handleAction(type as ActivityType)
            }}
            disabled={isPending}
            className={`p-1.5 rounded text-gray-400 transition-colors ${config.color} disabled:opacity-50`}
            title={config.label}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        )
      })}
    </div>
  )
}

// Compact version for lead cards
export function QuickActionsCompact({ leadId, leadName }: QuickActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleAction = (type: ActivityType, e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      try {
        await logQuickAction(leadId, type)
        toast.success(`${ACTION_CONFIG[type].label}`)
      } catch {
        toast.error('Failed to log action')
      }
    })
  }

  // Show only the 3 most common actions
  const quickTypes: ActivityType[] = ['CALL', 'LEFT_VM', 'NO_ANSWER']

  return (
    <div className="flex gap-0.5">
      {quickTypes.map(type => {
        const config = ACTION_CONFIG[type]
        const Icon = config.icon
        return (
          <button
            key={type}
            onClick={(e) => handleAction(type, e)}
            disabled={isPending}
            className={`p-1 rounded text-gray-400 transition-colors ${config.color} disabled:opacity-50`}
            title={config.label}
          >
            <Icon className="w-3 h-3" />
          </button>
        )
      })}
    </div>
  )
}
