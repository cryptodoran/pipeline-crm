import { getStages } from '@/lib/stage-actions'
import { requireAuth } from '@/lib/current-user'
import { StagesManager } from './stages-manager'
import { Layers } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StagesPage() {
  await requireAuth()
  const stages = await getStages()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Layers className="w-8 h-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline Stages</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Customize your pipeline stages - add, rename, reorder, or delete
            </p>
          </div>
        </div>
      </div>

      <StagesManager initialStages={stages} />
    </div>
  )
}
