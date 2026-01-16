import { NextResponse } from 'next/server'
import { processPendingNotifications, getPendingNotifications, getNotificationSettings } from '@/lib/notifications'

// This endpoint processes pending reminder notifications
// It can be called by:
// 1. Vercel Cron (add to vercel.json: "crons": [{"path": "/api/cron/notifications", "schedule": "* * * * *"}])
// 2. External cron service (e.g., cron-job.org, Uptime Robot)
// 3. Manual trigger for testing

export async function GET(request: Request) {
  // Optional: Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // If CRON_SECRET is set, require it in the Authorization header
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for debug mode
  const url = new URL(request.url)
  const debug = url.searchParams.get('debug') === 'true'

  try {
    if (debug) {
      // Return debug info without processing
      const settings = await getNotificationSettings()
      const pending = await getPendingNotifications()
      return NextResponse.json({
        debug: true,
        settings: {
          slackEnabled: settings.slackEnabled,
          slackWebhookConfigured: !!process.env.SLACK_WEBHOOK_URL || !!settings.slackWebhookUrl,
          emailEnabled: settings.emailEnabled,
          telegramEnabled: settings.telegramEnabled,
          reminderMinutesBefore: settings.reminderMinutesBefore,
        },
        pendingReminders: pending.map(r => ({
          id: r.id,
          leadName: r.lead.name,
          assignee: r.lead.assignee?.name || 'Unassigned',
          assigneeSlackId: r.lead.assignee?.slackUserId || null,
          dueAt: r.dueAt,
          notified: r.notified,
          completed: r.completed,
        })),
        timestamp: new Date().toISOString(),
      })
    }

    const results = await processPendingNotifications()

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to process notifications:', error)
    return NextResponse.json(
      { error: 'Failed to process notifications', details: String(error) },
      { status: 500 }
    )
  }
}

// Also support POST for webhooks
export async function POST(request: Request) {
  return GET(request)
}
