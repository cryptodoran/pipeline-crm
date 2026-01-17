'use client'

import { useState, useTransition } from 'react'
import { RotateCcw, Trash2, Calendar, User, Search } from 'lucide-react'
import { toast } from 'sonner'
import { unarchiveLead, deleteLead } from '@/lib/actions'

type Lead = {
  id: string
  name: string
  stage: string
  telegram: string | null
  twitter: string | null
  email: string | null
  source: string | null
  archivedAt: Date | null
  assignee: { id: string; name: string } | null
}

interface ArchivedLeadsManagerProps {
  initialLeads: Lead[]
}

export function ArchivedLeadsManager({ initialLeads }: ArchivedLeadsManagerProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase()) ||
    lead.telegram?.toLowerCase().includes(search.toLowerCase())
  )

  const handleRestore = (lead: Lead) => {
    startTransition(async () => {
      try {
        await unarchiveLead(lead.id)
        setLeads(leads.filter(l => l.id !== lead.id))
        toast.success(`${lead.name} restored to pipeline`)
      } catch {
        toast.error('Failed to restore lead')
      }
    })
  }

  const handleDelete = (lead: Lead) => {
    if (!confirm(`Permanently delete ${lead.name}? This cannot be undone.`)) return

    startTransition(async () => {
      try {
        await deleteLead(lead.id)
        setLeads(leads.filter(l => l.id !== lead.id))
        toast.success('Lead permanently deleted')
      } catch {
        toast.error('Failed to delete lead')
      }
    })
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-700',
      CONTACTED: 'bg-purple-100 text-purple-700',
      ENGAGED: 'bg-amber-100 text-amber-700',
      PROPOSAL: 'bg-cyan-100 text-cyan-700',
      WON: 'bg-green-100 text-green-700',
      LOST: 'bg-red-100 text-red-700',
    }
    return colors[stage] || 'bg-gray-100 text-gray-700'
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No archived leads</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Archived leads will appear here. Archive leads from the Kanban board.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search archived leads..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{lead.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStageColor(lead.stage)}`}>
                  {lead.stage}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {lead.assignee && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {lead.assignee.name}
                  </span>
                )}
                {lead.archivedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Archived {new Date(lead.archivedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleRestore(lead)}
                disabled={isPending}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg disabled:opacity-50"
                title="Restore to pipeline"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(lead)}
                disabled={isPending}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                title="Delete permanently"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && search && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No archived leads match "{search}"
        </p>
      )}
    </div>
  )
}

function Archive({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="5" rx="2"/>
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/>
      <path d="M10 13h4"/>
    </svg>
  )
}
