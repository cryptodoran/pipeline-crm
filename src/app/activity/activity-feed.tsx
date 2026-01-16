'use client'

import { useState } from 'react'
import { 
  Phone, Voicemail, PhoneOff, Mail, MessageCircle, 
  Users, FileText, ArrowRight, UserPlus, Plus,
  File, Calendar, Clock
} from 'lucide-react'
import { ACTIVITY_TYPES } from '@/lib/activity-types'

type Activity = {
  id: string
  leadId: string
  type: string
  description: string | null
  metadata: string | null
  createdAt: Date
  author: { id: string; name: string } | null
  lead: { id: string; name: string; stage: string }
}

interface ActivityFeedProps {
  activities: Activity[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  LEFT_VM: Voicemail,
  NO_ANSWER: PhoneOff,
  EMAIL: Mail,
  DM_SENT: MessageCircle,
  MEETING: Users,
  NOTE: FileText,
  STAGE_CHANGE: ArrowRight,
  ASSIGNMENT: UserPlus,
  CREATED: Plus,
  FOLLOW_UP: Calendar,
  PROPOSAL_SENT: File,
}

const COLOR_MAP: Record<string, string> = {
  CALL: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  LEFT_VM: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  NO_ANSWER: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  EMAIL: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  DM_SENT: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
  MEETING: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  NOTE: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
  STAGE_CHANGE: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  ASSIGNMENT: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  CREATED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  FOLLOW_UP: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  PROPOSAL_SENT: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

function groupActivitiesByDate(activities: Activity[]) {
  const groups: Record<string, Activity[]> = {}
  
  activities.forEach(activity => {
    const date = new Date(activity.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let key: string
    if (date.toDateString() === today.toDateString()) {
      key = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday'
    } else {
      key = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(activity)
  })

  return groups
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>('all')
  
  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter)

  const grouped = groupActivitiesByDate(filteredActivities)

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Quick actions on lead cards will appear here
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        {['CALL', 'LEFT_VM', 'NO_ANSWER', 'EMAIL', 'DM_SENT', 'MEETING'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === type
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES]?.label || type}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {Object.entries(grouped).map(([dateGroup, groupActivities]) => (
          <div key={dateGroup}>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{dateGroup}</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {groupActivities.map(activity => {
                const Icon = ICON_MAP[activity.type] || FileText
                const colorClass = COLOR_MAP[activity.type] || 'bg-gray-100 text-gray-600'
                const typeInfo = ACTIVITY_TYPES[activity.type as keyof typeof ACTIVITY_TYPES]

                return (
                  <div key={activity.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{typeInfo?.label || activity.type}</span>
                        {' '}on{' '}
                        <a 
                          href={`/?lead=${activity.leadId}`}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {activity.lead.name}
                        </a>
                      </p>
                      {activity.description && activity.description !== typeInfo?.label && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {activity.author && (
                          <span className="text-xs text-gray-400">by {activity.author.name}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      activity.lead.stage === 'WON' ? 'bg-green-100 text-green-700' :
                      activity.lead.stage === 'LOST' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {activity.lead.stage}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
