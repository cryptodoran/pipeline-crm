import { getArchivedLeads } from '@/lib/actions'
import { requireAuth } from '@/lib/current-user'
import { ArchivedLeadsManager } from './archived-manager'
import { Archive } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ArchivedPage() {
  await requireAuth()
  const leads = await getArchivedLeads()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Archive className="w-8 h-8 text-gray-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Archived Leads</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {leads.length} archived lead{leads.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <ArchivedLeadsManager initialLeads={leads} />
    </div>
  )
}
