'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type TeamMember = {
  id: string
  name: string
  email: string
  color?: string
}

export default function SelectIdentityPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Fetch team members
    fetch('/api/team-members')
      .then(res => res.json())
      .then(data => {
        setTeamMembers(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleSelect = async (memberId: string) => {
    // Set identity cookie via API
    await fetch('/api/auth/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    router.push('/')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://raw.githubusercontent.com/defi-app/brand/main/Logos/Light/defi-app-logo-mark-only-light.svg"
                alt="Defi App"
                className="h-12 w-12"
              />
            </div>
            <h1 className="text-xl font-bold text-white">Who are you?</h1>
            <p className="text-gray-400 mt-2 text-sm">Select your name to continue</p>
          </div>

          <div className="space-y-2">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelect(member.id)}
                className="w-full flex items-center gap-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: member.color || '#6366f1' }}
                />
                <div>
                  <div className="text-white font-medium">{member.name}</div>
                  <div className="text-gray-400 text-sm">{member.email}</div>
                </div>
              </button>
            ))}
          </div>

          {teamMembers.length === 0 && (
            <p className="text-gray-400 text-center">No team members found. Add team members first.</p>
          )}
        </div>
      </div>
    </div>
  )
}
