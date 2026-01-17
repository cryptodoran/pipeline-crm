import { getDistributions } from '@/lib/distribution-actions'
import { getDeals } from '@/lib/deal-actions'
import { requireAuth } from '@/lib/current-user'
import { DistributionsManager } from './distributions-manager'
import { Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DistributionsPage() {
  await requireAuth()
  const [distributions, deals] = await Promise.all([
    getDistributions(),
    getDeals(),
  ])

  // Calculate totals
  const totalAmount = distributions.reduce((sum, d) => {
    if (d.amount) {
      return sum + Number(d.amount)
    }
    return sum
  }, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Distributions</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {distributions.length} payment{distributions.length !== 1 ? 's' : ''} totaling ${totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <DistributionsManager
        initialDistributions={distributions}
        deals={deals.map(d => ({ id: d.id, communityName: d.communityName, status: d.status }))}
      />
    </div>
  )
}
