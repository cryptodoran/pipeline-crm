import { getRecentActivities, getActivityStats, getTeamActivityStats } from '@/lib/activity-actions'
import { requireAuth } from '@/lib/current-user'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { ActivityFeed } from './activity-feed'
import { Activity, BarChart3, Users, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  await requireAuth()
  const [activities, stats, teamStats] = await Promise.all([
    getRecentActivities(100),
    getActivityStats(7),
    getTeamActivityStats(7),
  ])

  const totalActivities = stats.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Feed</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Track all lead interactions and team performance
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 Days</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalActivities}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">total activities</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">By Type</h3>
          </div>
          <div className="space-y-2">
            {stats.slice(0, 4).map(stat => (
              <div key={stat.type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {ACTIVITY_TYPES[stat.type as keyof typeof ACTIVITY_TYPES]?.label || stat.type}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {teamStats.slice(0, 4).map((stat, i) => (
              <div key={stat.memberId || i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{stat.memberName}</span>
                <span className="font-medium text-gray-900 dark:text-white">{stat.count} actions</span>
              </div>
            ))}
            {teamStats.length === 0 && (
              <p className="text-sm text-gray-400">No team activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
