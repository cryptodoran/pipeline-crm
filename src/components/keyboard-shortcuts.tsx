'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Keyboard } from 'lucide-react'

interface KeyboardShortcutsProviderProps {
  onNewLead?: () => void
  onFocusSearch?: () => void
  children: React.ReactNode
}

const SHORTCUTS = [
  { key: 'N', description: 'Open new lead form', modifier: null },
  { key: '/', description: 'Focus search box', modifier: null },
  { key: '?', description: 'Show keyboard shortcuts', modifier: null },
  { key: 'Esc', description: 'Close modals', modifier: null },
]

export function KeyboardShortcutsProvider({
  onNewLead,
  onFocusSearch,
  children,
}: KeyboardShortcutsProviderProps) {
  const [showHelp, setShowHelp] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only handle Escape in inputs
        if (e.key === 'Escape') {
          ;(target as HTMLInputElement).blur()
        }
        return
      }

      // Check for shortcuts
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          onNewLead?.()
          break
        case '/':
          e.preventDefault()
          onFocusSearch?.()
          break
        case '?':
          e.preventDefault()
          setShowHelp(true)
          break
        case 'escape':
          setShowHelp(false)
          break
      }
    },
    [onNewLead, onFocusSearch]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {children}

      {/* Keyboard Shortcuts Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                {SHORTCUTS.map(shortcut => (
                  <div
                    key={shortcut.key}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600 dark:text-gray-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono border border-gray-300 dark:border-gray-600">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">?</kbd> anytime to show this help
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Hook for components that need to trigger the help modal
export function useKeyboardShortcuts() {
  const [helpVisible, setHelpVisible] = useState(false)

  const showHelp = useCallback(() => setHelpVisible(true), [])
  const hideHelp = useCallback(() => setHelpVisible(false), [])

  return { helpVisible, showHelp, hideHelp }
}
