import { NextResponse } from 'next/server'
import { processPendingNotifications } from '@/lib/notifications'

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
  
  try {
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
