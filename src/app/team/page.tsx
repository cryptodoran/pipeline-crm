import { getTeamMembers } from '@/lib/actions'
import { AddTeamMemberButton } from '@/components/add-team-member-button'
import { TeamMemberCard } from '@/components/team-member-card'
import { Users } from 'lucide-react'

export default async function TeamPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Team</h2>
          <p className="text-gray-400">{teamMembers.length} team members</p>
        </div>
        <AddTeamMemberButton />
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No team members yet</h3>
          <p className="text-gray-400 mb-4">Add your first team member to start assigning leads.</p>
          <AddTeamMemberButton />
        </div>
      ) : (
        <div className="grid gap-4">
          {teamMembers.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  )
}
