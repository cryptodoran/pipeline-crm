import { getTeamMembers } from '@/lib/actions'
import { AddTeamMemberButton } from '@/components/add-team-member-button'
import { Users } from 'lucide-react'

export default async function TeamPage() {
  const teamMembers = await getTeamMembers()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team</h2>
          <p className="text-gray-500">{teamMembers.length} team members</p>
        </div>
        <AddTeamMemberButton />
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-4">Add your first team member to start assigning leads.</p>
          <AddTeamMemberButton />
        </div>
      ) : (
        <div className="grid gap-4">
          {teamMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center hover:shadow-sm transition-shadow"
            >
              <div>
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{member._count.leads}</div>
                <div className="text-sm text-gray-500">leads assigned</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
