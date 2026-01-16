'use client'

import { useTransition } from 'react'
import { Clock, Check, RotateCcw, AlertCircle, User } from 'lucide-react'
import { completeReminder, snoozeReminder } from '@/lib/actions'

type Reminder = {
  id: string
  dueAt: Date
  note: string | null
  completed: boolean
  lead: {
    id: string
    name: string
    assignee: { name: string } | null
  }
}

interface RemindersManagerProps {
  todayReminders: Reminder[]
  upcomingReminders: Reminder[]
  overdueReminders: Reminder[]
}

function ReminderCard({ reminder, isOverdue = false }: { reminder: Reminder; isOverdue?: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      await completeReminder(reminder.id)
    })
  }

  const handleSnooze = (days: number) => {
    startTransition(async () => {
      await snoozeReminder(reminder.id, days)
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  return (
    <div
      className={`p-4 rounded-lg border ${
        isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{reminder.lead.name}</h4>
            {isOverdue && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>

          {reminder.note && (
            <p className="text-sm text-gray-600 mt-1">{reminder.note}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(reminder.dueAt)} at {formatTime(reminder.dueAt)}
            </span>
            {reminder.lead.assignee && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {reminder.lead.assignee.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
            title="Mark complete"
          >
            <Check className="w-4 h-4" />
            Done
          </button>

          <div className="relative group">
            <button
              disabled={isPending}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Snooze
            </button>

            <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleSnooze(1)}
                disabled={isPending}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                Tomorrow
              </button>
              <button
                onClick={() => handleSnooze(3)}
                disabled={isPending}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                In 3 days
              </button>
              <button
                onClick={() => handleSnooze(7)}
                disabled={isPending}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                In 1 week
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RemindersManager({
  todayReminders,
  upcomingReminders,
  overdueReminders,
}: RemindersManagerProps) {
  const totalCount = todayReminders.length + upcomingReminders.length + overdueReminders.length

  if (totalCount === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No reminders</h3>
        <p className="text-gray-500">
          Set reminders from lead details to stay on top of follow-ups
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Overdue section */}
      {overdueReminders.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            Overdue ({overdueReminders.length})
          </h3>
          <div className="space-y-3">
            {overdueReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} isOverdue />
            ))}
          </div>
        </section>
      )}

      {/* Today section */}
      {todayReminders.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today ({todayReminders.length})
          </h3>
          <div className="space-y-3">
            {todayReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming section */}
      {upcomingReminders.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming ({upcomingReminders.length})
          </h3>
          <div className="space-y-3">
            {upcomingReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
