'use client'

import { useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { sweepDuplicates } from '@/lib/actions'

export function SweepDuplicatesButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSweep = () => {
    startTransition(async () => {
      try {
        const result = await sweepDuplicates()
        if (result.duplicateCount === 0) {
          toast.success('No duplicates found!')
        } else {
          toast.success(
            `Found ${result.duplicateCount} leads in ${result.groupCount} duplicate groups. Tagged as "Possible Duplicate".`
          )
        }
        setIsOpen(false)
      } catch {
        toast.error('Failed to sweep for duplicates')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        <Search className="w-4 h-4" />
        Find Duplicates
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Find Duplicates</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-300 mb-4">
                This will scan all active leads for duplicates based on matching emails, phone numbers, social handles, and names. Duplicates will be tagged with <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">&quot;Possible Duplicate&quot;</span> for review.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Leads that are no longer duplicates will have the tag removed automatically.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSweep}
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Scanning...' : 'Run Scan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
