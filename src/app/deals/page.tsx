import { getDeals, getOverdueDealReminders } from '@/lib/deal-actions'
import { requireAuth } from '@/lib/current-user'
import { DealsManager } from './deals-manager'
import { Handshake, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DealsPage() {
  await requireAuth()
  const deals = await getDeals()
  const overdueReminders = await getOverdueDealReminders()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Handshake className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Closed Deals</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {deals.length} active contract{deals.length !== 1 ? 's' : ''} with trading communities
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Payments Alert */}
      {overdueReminders.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold">Overdue Payments</h3>
          </div>
          <div className="space-y-2">
            {overdueReminders.map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between text-sm">
                <span className="text-red-600 dark:text-red-300">
                  {reminder.deal.communityName} - {reminder.note || reminder.type}
                </span>
                <span className="text-red-500">
                  Due {new Date(reminder.dueAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DealsManager initialDeals={deals} />
    </div>
  )
}
