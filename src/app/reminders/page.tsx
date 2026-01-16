import { getUpcomingReminders, getOverdueReminders, getTodaysReminders } from '@/lib/actions'
import { RemindersManager } from './reminders-manager'

export default async function RemindersPage() {
  const [todayReminders, upcomingReminders, overdueReminders] = await Promise.all([
    getTodaysReminders(),
    getUpcomingReminders(),
    getOverdueReminders(),
  ])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reminders</h2>
        <p className="text-gray-500">Stay on top of your follow-ups</p>
      </div>

      <RemindersManager
        todayReminders={todayReminders}
        upcomingReminders={upcomingReminders}
        overdueReminders={overdueReminders}
      />
    </div>
  )
}
