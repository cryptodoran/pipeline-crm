'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ChevronDown } from 'lucide-react'

type TeamMember = {
  id: string
  name: string
  email: string
  color?: string
}

export function UserIdentity() {
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const router = useRouter()

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/identity')
      .then(res => res.json())
      .then(data => setCurrentUser(data.user))
      .catch(() => {})

    // Fetch all team members for the dropdown
    fetch('/api/team-members')
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(() => {})
  }, [])

  const handleSwitch = async (memberId: string) => {
    await fetch('/api/auth/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    setIsOpen(false)
    router.refresh()
    // Re-fetch current user
    const res = await fetch('/api/auth/identity')
    const data = await res.json()
    setCurrentUser(data.user)
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: currentUser.color || '#6366f1' }}
        />
        <span className="text-sm text-gray-300 hidden lg:inline">{currentUser.name}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1">
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="text-sm text-white font-medium">{currentUser.name}</p>
            </div>
            <div className="py-1">
              <p className="px-3 py-1 text-xs text-gray-500">Switch to:</p>
              {teamMembers
                .filter(m => m.id !== currentUser.id)
                .map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleSwitch(member.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 transition-colors text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: member.color || '#6366f1' }}
                    />
                    <span className="text-sm text-gray-300">{member.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
