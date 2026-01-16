'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface MobileNavProps {
  links: Array<{ href: string; label: string }>
}

export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 shadow-lg">
            <nav className="flex flex-col p-4 space-y-1">
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-3 rounded-lg text-base font-medium"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
