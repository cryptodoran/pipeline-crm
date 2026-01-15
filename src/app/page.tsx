import { getLeads, getTeamMembers } from '@/lib/actions'
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS, PipelineStage } from '@/lib/types'
import { KanbanBoard } from '@/components/kanban-board'
import { AddLeadButton } from '@/components/add-lead-button'

export default async function Home() {
  const [leads, teamMembers] = await Promise.all([
    getLeads(),
    getTeamMembers(),
  ])

  // Group leads by stage
  const leadsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead => lead.stage === stage)
    return acc
  }, {} as Record<PipelineStage, typeof leads>)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipeline</h2>
          <p className="text-gray-500">{leads.length} leads across {PIPELINE_STAGES.length} stages</p>
        </div>
        <AddLeadButton teamMembers={teamMembers} />
      </div>

      <KanbanBoard
        leadsByStage={leadsByStage}
        teamMembers={teamMembers}
        stages={PIPELINE_STAGES}
        stageLabels={STAGE_LABELS}
        stageColors={STAGE_COLORS}
      />
    </div>
  )
}
