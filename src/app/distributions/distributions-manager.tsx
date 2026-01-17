'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  Plus, X, Trash2, ExternalLink, Filter, Calendar,
  DollarSign, Link2, Search
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createDistribution, updateDistribution, deleteDistribution,
  DISTRIBUTION_TYPES
} from '@/lib/distribution-actions'
import { Decimal } from '@prisma/client/runtime/library'

type Distribution = {
  id: string
  dealId: string
  amount: Decimal | null
  type: string
  txLink: string | null
  paidAt: Date
  notes: string | null
  deal: {
    id: string
    communityName: string
    status: string
  }
}

type Deal = {
  id: string
  communityName: string
  status: string
}

interface DistributionsManagerProps {
  initialDistributions: Distribution[]
  deals: Deal[]
}

const DISTRIBUTION_TYPE_LABELS: Record<string, string> = {
  ADVISOR_TOKENS: 'Advisor Tokens',
  REVENUE_SHARE: 'Revenue Share',
  TOKEN_ALLOCATION: 'Token Allocation',
  FEE: 'Fee',
  OTHER: 'Other',
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'ADVISOR_TOKENS': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'REVENUE_SHARE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'TOKEN_ALLOCATION': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'FEE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

export function DistributionsManager({ initialDistributions, deals }: DistributionsManagerProps) {
  const [distributions, setDistributions] = useState(initialDistributions)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDeal, setFilterDeal] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })

  // Form state
  const [formData, setFormData] = useState({
    dealId: '',
    amount: '',
    type: 'REVENUE_SHARE',
    txLink: '',
    paidAt: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const resetForm = () => {
    setFormData({
      dealId: '',
      amount: '',
      type: 'REVENUE_SHARE',
      txLink: '',
      paidAt: new Date().toISOString().split('T')[0],
      notes: '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.dealId) {
      toast.error('Please select a deal')
      return
    }

    startTransition(async () => {
      try {
        await createDistribution({
          dealId: formData.dealId,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          type: formData.type,
          txLink: formData.txLink || undefined,
          paidAt: new Date(formData.paidAt),
          notes: formData.notes || undefined,
        })
        toast.success('Distribution recorded')
        setIsAddModalOpen(false)
        resetForm()
        window.location.reload()
      } catch {
        toast.error('Failed to record distribution')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this distribution record? This cannot be undone.')) return

    startTransition(async () => {
      try {
        await deleteDistribution(id)
        setDistributions(distributions.filter(d => d.id !== id))
        toast.success('Distribution deleted')
      } catch {
        toast.error('Failed to delete distribution')
      }
    })
  }

  // Filter distributions
  const filteredDistributions = useMemo(() => {
    return distributions.filter(dist => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesCommunity = dist.deal.communityName.toLowerCase().includes(query)
        const matchesNotes = dist.notes?.toLowerCase().includes(query)
        if (!matchesCommunity && !matchesNotes) return false
      }

      // Type filter
      if (filterType !== 'all' && dist.type !== filterType) return false

      // Deal filter
      if (filterDeal !== 'all' && dist.dealId !== filterDeal) return false

      // Date range filter
      if (dateRange.start) {
        const startDate = new Date(dateRange.start)
        if (new Date(dist.paidAt) < startDate) return false
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59) // Include full end day
        if (new Date(dist.paidAt) > endDate) return false
      }

      return true
    })
  }, [distributions, searchQuery, filterType, filterDeal, dateRange])

  // Calculate filtered totals
  const filteredTotal = useMemo(() => {
    return filteredDistributions.reduce((sum, d) => {
      if (d.amount) return sum + Number(d.amount)
      return sum
    }, 0)
  }, [filteredDistributions])

  // Get unique deals that have distributions
  const dealsWithDistributions = useMemo(() => {
    const dealIds = new Set(distributions.map(d => d.dealId))
    return deals.filter(d => dealIds.has(d.id))
  }, [distributions, deals])

  return (
    <>
      {/* Add Distribution Button and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Record Distribution
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by community or notes..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Filter className="w-4 h-4 text-gray-500" />

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            {DISTRIBUTION_TYPES.map(type => (
              <option key={type} value={type}>{DISTRIBUTION_TYPE_LABELS[type]}</option>
            ))}
          </select>

          {/* Deal Filter */}
          <select
            value={filterDeal}
            onChange={(e) => setFilterDeal(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Deals</option>
            {dealsWithDistributions.map(deal => (
              <option key={deal.id} value={deal.id}>{deal.communityName}</option>
            ))}
          </select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Clear Filters */}
          {(filterType !== 'all' || filterDeal !== 'all' || dateRange.start || dateRange.end || searchQuery) && (
            <button
              onClick={() => {
                setFilterType('all')
                setFilterDeal('all')
                setDateRange({ start: '', end: '' })
                setSearchQuery('')
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear filters
            </button>
          )}

          {/* Filtered Total */}
          <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredDistributions.length} of {distributions.length} ({filteredTotal > 0 ? `$${filteredTotal.toLocaleString()}` : '$0'})
          </div>
        </div>
      </div>

      {/* Distributions Table */}
      {filteredDistributions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {distributions.length === 0 ? 'No distributions yet' : 'No matching distributions'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {distributions.length === 0
              ? 'Record your first distribution payment to start tracking.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    TX Link
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDistributions.map(dist => (
                  <tr key={dist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(dist.paidAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a
                        href="/deals"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      >
                        {dist.deal.communityName}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(dist.type)}`}>
                        {DISTRIBUTION_TYPE_LABELS[dist.type] || dist.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                      {dist.amount ? `$${Number(dist.amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {dist.txLink ? (
                        <a
                          href={dist.txLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400"
                        >
                          <Link2 className="w-4 h-4" />
                          View TX
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {dist.notes || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(dist.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Distribution Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Record Distribution
              </h2>
              <button
                onClick={() => { setIsAddModalOpen(false); resetForm() }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deal <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.dealId}
                  onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a deal...</option>
                  {deals.filter(d => d.status === 'ACTIVE').map(deal => (
                    <option key={deal.id} value={deal.id}>{deal.communityName}</option>
                  ))}
                  {deals.filter(d => d.status !== 'ACTIVE').length > 0 && (
                    <optgroup label="Inactive Deals">
                      {deals.filter(d => d.status !== 'ACTIVE').map(deal => (
                        <option key={deal.id} value={deal.id}>{deal.communityName} ({deal.status})</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Distribution Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  {DISTRIBUTION_TYPES.map(type => (
                    <option key={type} value={type}>{DISTRIBUTION_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.paidAt}
                  onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Link
                </label>
                <input
                  type="url"
                  value={formData.txLink}
                  onChange={(e) => setFormData({ ...formData, txLink: e.target.value })}
                  placeholder="https://etherscan.io/tx/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about this distribution"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetForm() }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isPending ? 'Recording...' : 'Record Distribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
