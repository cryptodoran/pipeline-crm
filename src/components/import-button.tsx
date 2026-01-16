'use client'

import { useState, useRef, useTransition } from 'react'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { importLeads } from '@/lib/actions'

interface ImportButtonProps {
  onImportComplete?: () => void
}

type ParsedLead = {
  name: string
  stage?: string
  telegram?: string
  twitter?: string
  farcaster?: string
  tiktok?: string
  youtube?: string
  twitch?: string
  instagram?: string
  email?: string
}

type ImportPreview = {
  leads: ParsedLead[]
  duplicates: string[]
  errors: string[]
}

export function ImportButton({ onImportComplete }: ImportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const result = parseCSV(text)
    setPreview(result)
    setIsOpen(true)
  }

  const parseCSV = (text: string): ImportPreview => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return { leads: [], duplicates: [], errors: ['CSV file is empty or has no data rows'] }
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const leads: ParsedLead[] = []
    const errors: string[] = []
    const seenEmails = new Set<string>()
    const duplicates: string[] = []

    // Map common header variations
    const headerMap: Record<string, keyof ParsedLead> = {
      'name': 'name',
      'full name': 'name',
      'fullname': 'name',
      'stage': 'stage',
      'pipeline stage': 'stage',
      'status': 'stage',
      'telegram': 'telegram',
      'twitter': 'twitter',
      'x': 'twitter',
      'farcaster': 'farcaster',
      'tiktok': 'tiktok',
      'youtube': 'youtube',
      'twitch': 'twitch',
      'instagram': 'instagram',
      'email': 'email',
      'email address': 'email',
    }

    const columnMapping = headers.map(h => headerMap[h] || null)

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const lead: ParsedLead = { name: '' }

      columnMapping.forEach((field, idx) => {
        if (field && values[idx]) {
          const value = values[idx].trim()
          if (value) {
            (lead as Record<string, string>)[field] = value
          }
        }
      })

      if (!lead.name) {
        errors.push(`Row ${i + 1}: Missing required 'name' field`)
        continue
      }

      // Check for duplicate emails
      if (lead.email) {
        if (seenEmails.has(lead.email.toLowerCase())) {
          duplicates.push(lead.email)
        } else {
          seenEmails.add(lead.email.toLowerCase())
        }
      }

      leads.push(lead)
    }

    return { leads, duplicates, errors }
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  const handleImport = () => {
    if (!preview || preview.leads.length === 0) return

    startTransition(async () => {
      try {
        const result = await importLeads(preview.leads)
        toast.success(`Imported ${result.imported} leads${result.skipped > 0 ? `, ${result.skipped} skipped` : ''}`)
        setIsOpen(false)
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onImportComplete?.()
      } catch {
        toast.error('Failed to import leads')
      }
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer">
        <Upload className="w-4 h-4" />
        Import
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Import Preview Modal */}
      {isOpen && preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Import Preview</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">{preview.leads.length}</span>
                  </div>
                  <p className="text-sm text-green-600">Ready to import</p>
                </div>
                {preview.duplicates.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">{preview.duplicates.length}</span>
                    </div>
                    <p className="text-sm text-yellow-600">Duplicate emails</p>
                  </div>
                )}
                {preview.errors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">{preview.errors.length}</span>
                    </div>
                    <p className="text-sm text-red-600">Errors</p>
                  </div>
                )}
              </div>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                  <ul className="text-sm text-red-600 space-y-1">
                    {preview.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {preview.errors.length > 5 && (
                      <li>...and {preview.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {preview.leads.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Stage</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Socials</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {preview.leads.slice(0, 10).map((lead, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">{lead.name}</td>
                          <td className="px-3 py-2 text-gray-500">{lead.email || '-'}</td>
                          <td className="px-3 py-2 text-gray-500">{lead.stage || 'NEW'}</td>
                          <td className="px-3 py-2 text-gray-500">
                            {[lead.twitter, lead.telegram, lead.instagram].filter(Boolean).length || 0} connected
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.leads.length > 10 && (
                    <div className="px-3 py-2 bg-gray-50 text-sm text-gray-500">
                      ...and {preview.leads.length - 10} more leads
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isPending || preview.leads.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Importing...' : `Import ${preview.leads.length} Leads`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
