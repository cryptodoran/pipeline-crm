'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'

type Lead = {
  id: string
  name: string
  stage: string
  telegram: string | null
  twitter: string | null
  farcaster: string | null
  tiktok: string | null
  youtube: string | null
  twitch: string | null
  instagram: string | null
  email: string | null
  assignee: { id: string; name: string; email: string } | null
  tags?: { id: string; name: string; color: string }[]
  notes: Array<{ id: string; content: string; createdAt: Date; author: { name: string } }>
  createdAt?: Date
  updatedAt?: Date
}

interface ExportButtonProps {
  leads: Lead[]
}

export function ExportButton({ leads }: ExportButtonProps) {
  const handleExport = () => {
    if (leads.length === 0) {
      toast.error('No leads to export')
      return
    }

    // CSV headers
    const headers = [
      'Name',
      'Stage',
      'Telegram',
      'Twitter',
      'Farcaster',
      'TikTok',
      'YouTube',
      'Twitch',
      'Instagram',
      'Email',
      'Assignee',
      'Tags',
      'Notes Count',
      'Created At',
    ]

    // Convert leads to CSV rows
    const rows = leads.map(lead => [
      escapeCsvField(lead.name),
      lead.stage,
      lead.telegram || '',
      lead.twitter || '',
      lead.farcaster || '',
      lead.tiktok || '',
      lead.youtube || '',
      lead.twitch || '',
      lead.instagram || '',
      lead.email || '',
      lead.assignee?.name || '',
      lead.tags?.map(t => t.name).join('; ') || '',
      lead.notes.length.toString(),
      lead.createdAt ? new Date(lead.createdAt).toISOString() : '',
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    // Generate filename with date
    const date = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `pipeline-leads-${date}.csv`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${leads.length} leads to CSV`)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Export
    </button>
  )
}

// Helper to escape CSV fields
function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}
