import { getTags } from '@/lib/actions'
import { TagsManager } from './tags-manager'

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
        <p className="text-gray-500">Manage tags to categorize your leads</p>
      </div>

      <TagsManager initialTags={tags} />
    </div>
  )
}
