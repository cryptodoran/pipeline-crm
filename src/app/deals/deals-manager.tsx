'use client'

import { useState, useTransition } from 'react'
import {
  Plus, X, Edit2, Trash2, Bell, Check, Calendar,
  DollarSign, Percent, Clock, FileText, AlertCircle,
  MessageCircle, ExternalLink, User
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  createDeal, updateDeal, deleteDeal, 
  createDealReminder, completeDealReminder, deleteDealReminder,
  type CreateDealInput 
} from '@/lib/deal-actions'
import { Decimal } from '@prisma/client/runtime/library'

type DealReminder = {
  id: string
  dueAt: Date
  note: string | null
  type: string
  completed: boolean
}

type TeamMember = {
  id: string
  name: string
  color?: string
}

type Deal = {
  id: string
  communityName: string
  contactUsername: string | null
  contactPlatform: string | null
  assigneeId: string | null
  assignee: TeamMember | null
  fee: Decimal | null
  referralCode: string | null
  referralRevShare: Decimal | null
  advisorTokenTotal: Decimal | null
  advisorVestingSchedule: string | null
  homeTokenAllocation: Decimal | null
  homeTokenThreshold: string | null
  purportedVolume: string | null
  volumePeriod: string | null
  contractLink: string | null
  executedDate: Date | null
  status: string
  notes: string | null
  nextPaymentDue: Date | null
  paymentFrequency: string | null
  reminders: DealReminder[]
  createdAt: Date
}

interface DealsManagerProps {
  initialDeals: Deal[]
  teamMembers: TeamMember[]
}

const CONTACT_PLATFORMS = ['telegram', 'discord', 'twitter', 'email', 'other']
const PAYMENT_FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'annually', 'one-time']
const DEAL_STATUSES = ['ACTIVE', 'PAUSED', 'TERMINATED']
const REMINDER_TYPES = ['PAYMENT', 'VESTING', 'REVIEW', 'OTHER']

// Form state type with string values for numeric fields (for proper input handling)
type FormDataStrings = {
  communityName: string
  contactUsername: string
  contactPlatform: string
  assigneeId: string
  fee: string
  referralCode: string
  referralRevShare: string
  advisorTokenTotal: string
  advisorVestingSchedule: string
  homeTokenAllocation: string
  homeTokenThreshold: string
  purportedVolume: string
  volumePeriod: string
  contractLink: string
  executedDate: string
  status: string
  notes: string
  nextPaymentDue: string
  paymentFrequency: string
}

const emptyFormData: FormDataStrings = {
  communityName: '',
  contactUsername: '',
  contactPlatform: 'telegram',
  assigneeId: '',
  fee: '',
  referralCode: '',
  referralRevShare: '',
  advisorTokenTotal: '',
  advisorVestingSchedule: '',
  homeTokenAllocation: '',
  homeTokenThreshold: '',
  purportedVolume: '',
  volumePeriod: 'monthly',
  contractLink: '',
  executedDate: '',
  status: 'ACTIVE',
  notes: '',
  nextPaymentDue: '',
  paymentFrequency: 'monthly',
}

// Convert string form data to API input (parse numbers)
function formDataToInput(data: FormDataStrings): CreateDealInput {
  return {
    communityName: data.communityName,
    contactUsername: data.contactUsername || undefined,
    contactPlatform: data.contactPlatform || undefined,
    assigneeId: data.assigneeId || undefined,
    fee: data.fee ? parseFloat(data.fee) : undefined,
    referralCode: data.referralCode || undefined,
    referralRevShare: data.referralRevShare ? parseFloat(data.referralRevShare) : undefined,
    advisorTokenTotal: data.advisorTokenTotal ? parseFloat(data.advisorTokenTotal) : undefined,
    advisorVestingSchedule: data.advisorVestingSchedule || undefined,
    homeTokenAllocation: data.homeTokenAllocation ? parseFloat(data.homeTokenAllocation) : undefined,
    homeTokenThreshold: data.homeTokenThreshold || undefined,
    purportedVolume: data.purportedVolume || undefined,
    volumePeriod: data.volumePeriod || undefined,
    contractLink: data.contractLink || undefined,
    executedDate: data.executedDate ? new Date(data.executedDate) : undefined,
    status: data.status || undefined,
    notes: data.notes || undefined,
    nextPaymentDue: data.nextPaymentDue ? new Date(data.nextPaymentDue) : undefined,
    paymentFrequency: data.paymentFrequency || undefined,
  }
}

export function DealsManager({ initialDeals, teamMembers }: DealsManagerProps) {
  const [deals, setDeals] = useState(initialDeals)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [reminderDeal, setReminderDeal] = useState<Deal | null>(null)
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState<FormDataStrings>(emptyFormData)

  const [reminderForm, setReminderForm] = useState({
    dueAt: '',
    note: '',
    type: 'PAYMENT',
  })

  const resetForm = () => {
    setFormData(emptyFormData)
  }

  const handleOpenEdit = (deal: Deal) => {
    setFormData({
      communityName: deal.communityName,
      contactUsername: deal.contactUsername || '',
      contactPlatform: deal.contactPlatform || 'telegram',
      assigneeId: deal.assigneeId || '',
      fee: deal.fee ? String(deal.fee) : '',
      referralCode: deal.referralCode || '',
      referralRevShare: deal.referralRevShare ? String(deal.referralRevShare) : '',
      advisorTokenTotal: deal.advisorTokenTotal ? String(deal.advisorTokenTotal) : '',
      advisorVestingSchedule: deal.advisorVestingSchedule || '',
      homeTokenAllocation: deal.homeTokenAllocation ? String(deal.homeTokenAllocation) : '',
      homeTokenThreshold: deal.homeTokenThreshold || '',
      purportedVolume: deal.purportedVolume || '',
      volumePeriod: deal.volumePeriod || 'monthly',
      contractLink: deal.contractLink || '',
      executedDate: deal.executedDate ? new Date(deal.executedDate).toISOString().split('T')[0] : '',
      status: deal.status,
      notes: deal.notes || '',
      nextPaymentDue: deal.nextPaymentDue ? new Date(deal.nextPaymentDue).toISOString().split('T')[0] : '',
      paymentFrequency: deal.paymentFrequency || 'monthly',
    })
    setEditingDeal(deal)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.communityName.trim()) {
      toast.error('Community name is required')
      return
    }

    // Convert string form data to API input with parsed numbers
    const inputData = formDataToInput(formData)

    startTransition(async () => {
      try {
        if (editingDeal) {
          await updateDeal(editingDeal.id, inputData)
          toast.success('Deal updated')
          setEditingDeal(null)
        } else {
          await createDeal(inputData)
          toast.success('Deal created')
          setIsAddModalOpen(false)
        }
        resetForm()
        // Refresh the page to get updated data
        window.location.reload()
      } catch {
        toast.error('Failed to save deal')
      }
    })
  }

  const handleDelete = (deal: Deal) => {
    if (!confirm(`Delete deal with ${deal.communityName}? This cannot be undone.`)) return

    startTransition(async () => {
      try {
        await deleteDeal(deal.id)
        setDeals(deals.filter(d => d.id !== deal.id))
        toast.success('Deal deleted')
      } catch {
        toast.error('Failed to delete deal')
      }
    })
  }

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reminderDeal || !reminderForm.dueAt) return

    startTransition(async () => {
      try {
        await createDealReminder({
          dealId: reminderDeal.id,
          dueAt: new Date(reminderForm.dueAt),
          note: reminderForm.note || undefined,
          type: reminderForm.type,
        })
        toast.success('Reminder set')
        setReminderDeal(null)
        setReminderForm({ dueAt: '', note: '', type: 'PAYMENT' })
        window.location.reload()
      } catch {
        toast.error('Failed to set reminder')
      }
    })
  }

  const handleCompleteReminder = (reminderId: string) => {
    startTransition(async () => {
      try {
        await completeDealReminder(reminderId)
        toast.success('Marked as complete')
        window.location.reload()
      } catch {
        toast.error('Failed to complete reminder')
      }
    })
  }

  const handleDeleteReminder = (reminderId: string) => {
    startTransition(async () => {
      try {
        await deleteDealReminder(reminderId)
        toast.success('Reminder deleted')
        window.location.reload()
      } catch {
        toast.error('Failed to delete reminder')
      }
    })
  }

  const formatCurrency = (value: Decimal | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value))
  }

  const formatPercent = (value: Decimal | null) => {
    if (!value) return '-'
    return `${Number(value)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'TERMINATED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'PAYMENT': return 'bg-green-100 text-green-700'
      case 'VESTING': return 'bg-purple-100 text-purple-700'
      case 'REVIEW': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      {/* Add Deal Button */}
      <button
        onClick={() => { resetForm(); setIsAddModalOpen(true) }}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Deal
      </button>

      {/* Deals List */}
      {deals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deals yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first closed deal to start tracking contracts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map(deal => {
            const isExpanded = expandedDealId === deal.id
            const hasOverdue = deal.reminders.some(r => new Date(r.dueAt) < new Date() && !r.completed)
            const nextReminder = deal.reminders.find(r => !r.completed)

            return (
              <div
                key={deal.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border ${hasOverdue ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'} overflow-hidden`}
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedDealId(isExpanded ? null : deal.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {deal.communityName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                      {hasOverdue && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {nextReminder && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Next: {new Date(nextReminder.dueAt).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setReminderDeal(deal) }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Set Reminder"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(deal) }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(deal) }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Info Row */}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {deal.assignee && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {deal.assignee.name}
                      </span>
                    )}
                    {deal.contactUsername && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        @{deal.contactUsername} ({deal.contactPlatform})
                      </span>
                    )}
                    {deal.fee && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(deal.fee)} fee
                      </span>
                    )}
                    {deal.referralRevShare && (
                      <span className="flex items-center gap-1">
                        <Percent className="w-4 h-4" />
                        {formatPercent(deal.referralRevShare)} rev share
                      </span>
                    )}
                    {deal.executedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Signed {new Date(deal.executedDate).toLocaleDateString()}
                      </span>
                    )}
                    {deal.contractLink && (
                      <a
                        href={deal.contractLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Contract
                      </a>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Contact</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>Username: {deal.contactUsername || '-'}</p>
                          <p>Platform: {deal.contactPlatform || '-'}</p>
                        </div>
                      </div>

                      {/* Financial */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Financial Terms</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>Fee: {formatCurrency(deal.fee)}</p>
                          <p>Referral Code: {deal.referralCode || '-'}</p>
                          <p>Rev Share: {formatPercent(deal.referralRevShare)}</p>
                        </div>
                      </div>

                      {/* Tokens */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Token Allocation</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>Advisor Tokens: {formatCurrency(deal.advisorTokenTotal)}</p>
                          <p>Vesting: {deal.advisorVestingSchedule || '-'}</p>
                          <p>Home Token: {formatPercent(deal.homeTokenAllocation)}</p>
                          <p>Threshold: {deal.homeTokenThreshold || '-'}</p>
                        </div>
                      </div>

                      {/* Volume */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Volume</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>Purported: {deal.purportedVolume || '-'}</p>
                          <p>Period: {deal.volumePeriod || '-'}</p>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Payment Schedule</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>Frequency: {deal.paymentFrequency || '-'}</p>
                          <p>Next Due: {deal.nextPaymentDue ? new Date(deal.nextPaymentDue).toLocaleDateString() : '-'}</p>
                        </div>
                      </div>

                      {/* Contract */}
                      {deal.contractLink && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">Contract</h4>
                          <a
                            href={deal.contractLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Contract
                          </a>
                        </div>
                      )}

                      {/* Notes */}
                      {deal.notes && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">Notes</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{deal.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Reminders */}
                    {deal.reminders.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Reminders</h4>
                        <div className="space-y-2">
                          {deal.reminders.map(reminder => (
                            <div
                              key={reminder.id}
                              className={`flex items-center justify-between p-2 rounded-lg ${
                                reminder.completed
                                  ? 'bg-gray-100 dark:bg-gray-700/50'
                                  : new Date(reminder.dueAt) < new Date()
                                  ? 'bg-red-50 dark:bg-red-900/20'
                                  : 'bg-blue-50 dark:bg-blue-900/20'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getReminderTypeColor(reminder.type)}`}>
                                  {reminder.type}
                                </span>
                                <span className={`text-sm ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                  {reminder.note || 'No note'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(reminder.dueAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {!reminder.completed && (
                                  <button
                                    onClick={() => handleCompleteReminder(reminder.id)}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    title="Mark Complete"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Deal Modal */}
      {(isAddModalOpen || editingDeal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingDeal ? 'Edit Deal' : 'Add New Deal'}
              </h2>
              <button
                onClick={() => { setIsAddModalOpen(false); setEditingDeal(null); resetForm() }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trading Community Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.communityName}
                      onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {DEAL_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
                    <select
                      value={formData.assigneeId || ''}
                      onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Unassigned</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Username</label>
                    <input
                      type="text"
                      value={formData.contactUsername}
                      onChange={(e) => setFormData({ ...formData, contactUsername: e.target.value })}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Platform</label>
                    <select
                      value={formData.contactPlatform}
                      onChange={(e) => setFormData({ ...formData, contactPlatform: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {CONTACT_PLATFORMS.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Terms */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Financial Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referral Code</label>
                    <input
                      type="text"
                      value={formData.referralCode}
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revenue Share (%)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.referralRevShare}
                      onChange={(e) => setFormData({ ...formData, referralRevShare: e.target.value })}
                      placeholder="0.0005 = 5 bps"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Token Allocation */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Token Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advisor Token Total ($)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.advisorTokenTotal}
                      onChange={(e) => setFormData({ ...formData, advisorTokenTotal: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vesting Schedule</label>
                    <input
                      type="text"
                      value={formData.advisorVestingSchedule}
                      onChange={(e) => setFormData({ ...formData, advisorVestingSchedule: e.target.value })}
                      placeholder="e.g., 12 months linear, 6mo cliff + 24mo"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Token Allocation (%)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.homeTokenAllocation}
                      onChange={(e) => setFormData({ ...formData, homeTokenAllocation: e.target.value })}
                      placeholder="0.0005 = 5 bps"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold Unlock</label>
                    <input
                      type="text"
                      value={formData.homeTokenThreshold}
                      onChange={(e) => setFormData({ ...formData, homeTokenThreshold: e.target.value })}
                      placeholder="e.g., $10M volume milestone"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Volume & Schedule */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Volume & Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purported Volume</label>
                    <input
                      type="text"
                      value={formData.purportedVolume}
                      onChange={(e) => setFormData({ ...formData, purportedVolume: e.target.value })}
                      placeholder="e.g., $5M"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Volume Period</label>
                    <select
                      value={formData.volumePeriod}
                      onChange={(e) => setFormData({ ...formData, volumePeriod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Link</label>
                    <input
                      type="url"
                      value={formData.contractLink}
                      onChange={(e) => setFormData({ ...formData, contractLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Executed Date</label>
                    <input
                      type="date"
                      value={formData.executedDate}
                      onChange={(e) => setFormData({ ...formData, executedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Frequency</label>
                    <select
                      value={formData.paymentFrequency}
                      onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {PAYMENT_FREQUENCIES.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Payment Due</label>
                    <input
                      type="date"
                      value={formData.nextPaymentDue}
                      onChange={(e) => setFormData({ ...formData, nextPaymentDue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingDeal(null); resetForm() }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : editingDeal ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {reminderDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Set Reminder for {reminderDeal.communityName}
              </h2>
              <button
                onClick={() => { setReminderDeal(null); setReminderForm({ dueAt: '', note: '', type: 'PAYMENT' }) }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reminder Type
                </label>
                <select
                  value={reminderForm.type}
                  onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REMINDER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={reminderForm.dueAt}
                  onChange={(e) => setReminderForm({ ...reminderForm, dueAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note
                </label>
                <input
                  type="text"
                  value={reminderForm.note}
                  onChange={(e) => setReminderForm({ ...reminderForm, note: e.target.value })}
                  placeholder="e.g., Monthly revenue share payout"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setReminderDeal(null); setReminderForm({ dueAt: '', note: '', type: 'PAYMENT' }) }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? 'Setting...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
