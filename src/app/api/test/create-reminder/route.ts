import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Temporary test endpoint - DELETE AFTER TESTING
export async function GET() {
  try {
    // Find Doran's team member
    const doran = await prisma.teamMember.findFirst({
      where: { name: { contains: 'Doran', mode: 'insensitive' } },
    })

    if (!doran) {
      return NextResponse.json({ error: 'Doran not found in team members' }, { status: 404 })
    }

    // Find a lead assigned to Doran
    const lead = await prisma.lead.findFirst({
      where: { assigneeId: doran.id, archived: false },
    })

    if (!lead) {
      return NextResponse.json({ error: 'No lead assigned to Doran' }, { status: 404 })
    }

    // Create a reminder for 1 minute ago (so it's overdue and pending)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)

    const reminder = await prisma.reminder.create({
      data: {
        leadId: lead.id,
        dueAt: oneMinuteAgo,
        note: 'Test notification - Slack @mention for Doran',
        completed: false,
        notified: false,
      },
      include: {
        lead: {
          include: { assignee: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Test reminder created',
      reminder: {
        id: reminder.id,
        leadName: reminder.lead.name,
        assignee: reminder.lead.assignee?.name,
        assigneeSlackId: reminder.lead.assignee?.slackUserId,
        dueAt: reminder.dueAt,
        notified: reminder.notified,
      },
      doran: {
        id: doran.id,
        name: doran.name,
        slackUserId: doran.slackUserId,
      },
    })
  } catch (error) {
    console.error('Error creating test reminder:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
