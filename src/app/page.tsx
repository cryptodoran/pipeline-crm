import { getLeads, getTeamMembers, getTags } from '@/lib/actions'
import { getStagesConfig, getStages } from '@/lib/stage-actions'
import { getCurrentUserId } from '@/lib/current-user'
import { KanbanBoard } from '@/components/kanban-board'
import { AddLeadButton } from '@/components/add-lead-button'
import { ExportButton } from '@/components/export-button'
import { ImportButton } from '@/components/import-button'
import { StageSettings } from '@/components/stage-settings'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [leads, teamMembers, tags, stagesConfig, stagesData, currentUserId] = await Promise.all([
    getLeads(),
    getTeamMembers(),
    getTags(),
    getStagesConfig(),
    getStages(),
    getCurrentUserId(),
  ])

  const { stages, stageLabels, stageColors } = stagesConfig

  // Group leads by stage
  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead => lead.stage === stage)
    return acc
  }, {} as Record<string, typeof leads>)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Pipeline</h2>
          <p className="text-gray-400">{leads.length} leads across {stages.length} stages</p>
        </div>
        <div className="flex items-center gap-2">
          <StageSettings stages={stagesData} />
          <ImportButton />
          <ExportButton leads={leads} />
          <AddLeadButton teamMembers={teamMembers} currentUserId={currentUserId} />
        </div>
      </div>

      <KanbanBoard
        leadsByStage={leadsByStage}
        teamMembers={teamMembers}
        availableTags={tags}
        stages={stages}
        stageLabels={stageLabels}
        stageColors={stageColors}
        currentUserId={currentUserId}
      />
    </div>
  )
}
