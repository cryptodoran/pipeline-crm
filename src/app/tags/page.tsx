import { getTags } from '@/lib/actions'
import { requireAuth } from '@/lib/current-user'
import { TagsManager } from './tags-manager'

export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  await requireAuth()
  const tags = await getTags()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Tags</h2>
        <p className="text-gray-400">Manage tags to categorize your leads</p>
      </div>

      <TagsManager initialTags={tags} />
    </div>
  )
}
