'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'

// Preset notification time windows in minutes
const NOTIFICATION_PRESETS = {
  '1Day': 1440,   // 24 hours
  '1Hour': 60,    // 1 hour
  '30Min': 30,    // 30 minutes
  '15Min': 15,    // 15 minutes
} as const

type NotificationLevel = keyof typeof NOTIFICATION_PRESETS

// Check if Slack webhook is configured via environment variable
export async function isSlackWebhookLocked(): Promise<boolean> {
  return !!process.env.SLACK_WEBHOOK_URL
}

// Get or create notification settings (singleton pattern)
export async function getNotificationSettings() {
  let settings = await prisma.notificationSettings.findFirst()

  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: {
        emailEnabled: false,
        telegramEnabled: false,
        slackEnabled: false,
        notify30MinBefore: true, // Default on
      },
    })
  }

  return settings
}

export async function updateNotificationSettings(data: {
  emailEnabled?: boolean
  emailAddress?: string | null
  telegramEnabled?: boolean
  telegramChatId?: string | null
  telegramBotToken?: string | null
  slackEnabled?: boolean
  slackWebhookUrl?: string | null
  slackChannel?: string | null
  notify1DayBefore?: boolean
  notify1HourBefore?: boolean
  notify30MinBefore?: boolean
  notify15MinBefore?: boolean
}) {
  const settings = await getNotificationSettings()

  const updated = await prisma.notificationSettings.update({
    where: { id: settings.id },
    data,
  })

  revalidatePath('/settings')
  return updated
}

// Get enabled notification levels from settings
function getEnabledLevels(settings: {
  notify1DayBefore: boolean
  notify1HourBefore: boolean
  notify30MinBefore: boolean
  notify15MinBefore: boolean
}): NotificationLevel[] {
  const levels: NotificationLevel[] = []
  if (settings.notify1DayBefore) levels.push('1Day')
  if (settings.notify1HourBefore) levels.push('1Hour')
  if (settings.notify30MinBefore) levels.push('30Min')
  if (settings.notify15MinBefore) levels.push('15Min')
  return levels
}

// Check if a reminder is within a notification window
function isWithinWindow(dueAt: Date, level: NotificationLevel, now: Date): boolean {
  const minutesBefore = NOTIFICATION_PRESETS[level]
  const windowStart = new Date(dueAt.getTime() - minutesBefore * 60 * 1000)
  return now >= windowStart && now < dueAt
}

// Get the notified field name for a level
function getNotifiedField(level: NotificationLevel): string {
  return `notified${level}`
}

// Format time until due (or overdue)
function formatTimeUntil(dueAt: Date, now: Date): string {
  const diffMs = dueAt.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / (60 * 1000))

  // Handle overdue
  if (diffMins < 0) {
    const overdueMins = Math.abs(diffMins)
    if (overdueMins < 60) return `${overdueMins} minutes OVERDUE`
    if (overdueMins < 1440) return `${Math.round(overdueMins / 60)} hour${Math.round(overdueMins / 60) > 1 ? 's' : ''} OVERDUE`
    return `${Math.round(overdueMins / 1440)} day${Math.round(overdueMins / 1440) > 1 ? 's' : ''} OVERDUE`
  }

  if (diffMins < 60) return `${diffMins} minutes`
  if (diffMins < 1440) return `${Math.round(diffMins / 60)} hour${Math.round(diffMins / 60) > 1 ? 's' : ''}`
  return `${Math.round(diffMins / 1440)} day${Math.round(diffMins / 1440) > 1 ? 's' : ''}`
}

// Process all pending notifications (both lead and deal reminders)
export async function processPendingNotifications() {
  const settings = await getNotificationSettings()
  const enabledLevels = getEnabledLevels(settings)
  const now = new Date()
  const results = []

  if (enabledLevels.length === 0) {
    return { message: 'No notification times enabled', results: [] }
  }

  // Include reminders up to 24 hours overdue (so we don't miss any)
  const overdueWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Process lead reminders
  const leadReminders = await prisma.reminder.findMany({
    where: {
      completed: false,
      dueAt: { gte: overdueWindow }, // Include recently overdue reminders
    },
    include: {
      lead: { include: { assignee: true } },
    },
  })

  for (const reminder of leadReminders) {
    const isOverdue = reminder.dueAt <= now

    if (isOverdue) {
      // For overdue reminders, send if ANY level hasn't been notified yet
      const anyNotSent = !reminder.notified1Day && !reminder.notified1Hour &&
                         !reminder.notified30Min && !reminder.notified15Min
      if (anyNotSent) {
        const result = await sendReminderNotificationForLevel(reminder, '15Min', settings, now)
        results.push({
          type: 'lead',
          reminderId: reminder.id,
          level: 'overdue',
          ...result
        })
      }
    } else {
      // Future reminders - check each enabled level
      for (const level of enabledLevels) {
        const notifiedField = getNotifiedField(level) as keyof typeof reminder
        const alreadyNotified = reminder[notifiedField] as boolean

        if (!alreadyNotified && isWithinWindow(reminder.dueAt, level, now)) {
          const result = await sendReminderNotificationForLevel(reminder, level, settings, now)
          results.push({
            type: 'lead',
            reminderId: reminder.id,
            level,
            ...result
          })
        }
      }
    }
  }

  // Process deal reminders
  const dealReminders = await prisma.dealReminder.findMany({
    where: {
      completed: false,
      dueAt: { gte: overdueWindow }, // Include recently overdue reminders
    },
    include: {
      deal: { include: { assignee: true } },
    },
  })

  for (const reminder of dealReminders) {
    const isOverdue = reminder.dueAt <= now

    if (isOverdue) {
      // For overdue reminders, send if ANY level hasn't been notified yet
      const anyNotSent = !reminder.notified1Day && !reminder.notified1Hour &&
                         !reminder.notified30Min && !reminder.notified15Min
      if (anyNotSent) {
        const result = await sendDealReminderNotificationForLevel(reminder, '15Min', settings, now)
        results.push({
          type: 'deal',
          reminderId: reminder.id,
          level: 'overdue',
          ...result
        })
      }
    } else {
      // Future reminders - check each enabled level
      for (const level of enabledLevels) {
        const notifiedField = getNotifiedField(level) as keyof typeof reminder
        const alreadyNotified = reminder[notifiedField] as boolean

        if (!alreadyNotified && isWithinWindow(reminder.dueAt, level, now)) {
          const result = await sendDealReminderNotificationForLevel(reminder, level, settings, now)
          results.push({
            type: 'deal',
            reminderId: reminder.id,
            level,
            ...result
          })
        }
      }
    }
  }

  return results
}

// Send notification for a lead reminder at a specific level
async function sendReminderNotificationForLevel(
  reminder: {
    id: string
    dueAt: Date
    note: string | null
    lead: { name: string; assignee: { name: string; email: string; slackUserId: string | null; telegramChatId: string | null; notifyOnReminder: boolean; timezone: string } | null }
  },
  level: NotificationLevel,
  settings: Awaited<ReturnType<typeof getNotificationSettings>>,
  now: Date
) {
  const results: { channel: string; success: boolean; error?: string }[] = []
  const assignee = reminder.lead.assignee

  // Check if assignee wants notifications
  if (assignee && assignee.notifyOnReminder === false) {
    // Mark this level as notified but skip sending
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { [getNotifiedField(level)]: true },
    })
    return { success: true, message: 'Assignee has notifications disabled', results: [] }
  }

  const timezone = assignee?.timezone || 'America/New_York'
  const timeUntil = formatTimeUntil(reminder.dueAt, now)
  const message = formatReminderMessage(reminder, timeUntil, timezone)

  // Send via Email
  if (settings.emailEnabled) {
    const emailTo = assignee?.email || settings.emailAddress
    if (emailTo) {
      try {
        await sendEmailNotification(emailTo, `Reminder: ${reminder.lead.name} (${timeUntil})`, message)
        results.push({ channel: 'email', success: true })
      } catch (error) {
        results.push({ channel: 'email', success: false, error: String(error) })
      }
    }
  }

  // Send via Telegram
  if (settings.telegramEnabled && settings.telegramBotToken) {
    const chatId = assignee?.telegramChatId || settings.telegramChatId
    if (chatId) {
      try {
        await sendTelegramNotification(settings.telegramBotToken, chatId, message)
        results.push({ channel: 'telegram', success: true })
      } catch (error) {
        results.push({ channel: 'telegram', success: false, error: String(error) })
      }
    }
  }

  // Send via Slack
  const slackWebhook = process.env.SLACK_WEBHOOK_URL || settings.slackWebhookUrl
  if (settings.slackEnabled && slackWebhook) {
    try {
      const slackMessage = assignee?.slackUserId
        ? `<@${assignee.slackUserId}> ${message}`
        : message

      await sendSlackNotification(slackWebhook, slackMessage, settings.slackChannel || undefined)
      results.push({ channel: 'slack', success: true })
    } catch (error) {
      results.push({ channel: 'slack', success: false, error: String(error) })
    }
  }

  // Mark this level as notified
  if (results.some(r => r.success)) {
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { [getNotifiedField(level)]: true },
    })
  }

  return { success: results.some(r => r.success), results }
}

// Send notification for a deal reminder at a specific level
async function sendDealReminderNotificationForLevel(
  reminder: {
    id: string
    dueAt: Date
    note: string | null
    type: string
    deal: { communityName: string; assignee: { name: string; email: string; slackUserId: string | null; telegramChatId: string | null; notifyOnReminder: boolean; timezone: string } | null }
  },
  level: NotificationLevel,
  settings: Awaited<ReturnType<typeof getNotificationSettings>>,
  now: Date
) {
  const results: { channel: string; success: boolean; error?: string }[] = []
  const assignee = reminder.deal.assignee

  // Check if assignee wants notifications
  if (assignee && assignee.notifyOnReminder === false) {
    await prisma.dealReminder.update({
      where: { id: reminder.id },
      data: { [getNotifiedField(level)]: true },
    })
    return { success: true, message: 'Assignee has notifications disabled', results: [] }
  }

  const timezone = assignee?.timezone || 'America/New_York'
  const timeUntil = formatTimeUntil(reminder.dueAt, now)
  const message = formatDealReminderMessage(reminder, timeUntil, timezone)

  // Send via Email
  if (settings.emailEnabled) {
    const emailTo = assignee?.email || settings.emailAddress
    if (emailTo) {
      try {
        await sendEmailNotification(emailTo, `Deal Reminder: ${reminder.deal.communityName} (${timeUntil})`, message)
        results.push({ channel: 'email', success: true })
      } catch (error) {
        results.push({ channel: 'email', success: false, error: String(error) })
      }
    }
  }

  // Send via Telegram
  if (settings.telegramEnabled && settings.telegramBotToken) {
    const chatId = assignee?.telegramChatId || settings.telegramChatId
    if (chatId) {
      try {
        await sendTelegramNotification(settings.telegramBotToken, chatId, message)
        results.push({ channel: 'telegram', success: true })
      } catch (error) {
        results.push({ channel: 'telegram', success: false, error: String(error) })
      }
    }
  }

  // Send via Slack
  const slackWebhook = process.env.SLACK_WEBHOOK_URL || settings.slackWebhookUrl
  if (settings.slackEnabled && slackWebhook) {
    try {
      const slackMessage = assignee?.slackUserId
        ? `<@${assignee.slackUserId}> ${message}`
        : message

      await sendSlackNotification(slackWebhook, slackMessage, settings.slackChannel || undefined)
      results.push({ channel: 'slack', success: true })
    } catch (error) {
      results.push({ channel: 'slack', success: false, error: String(error) })
    }
  }

  // Mark this level as notified
  if (results.some(r => r.success)) {
    await prisma.dealReminder.update({
      where: { id: reminder.id },
      data: { [getNotifiedField(level)]: true },
    })
  }

  return { success: results.some(r => r.success), results }
}

// Legacy functions - kept for backwards compatibility with cron debug endpoint
export async function getPendingNotifications() {
  const settings = await getNotificationSettings()
  const enabledLevels = getEnabledLevels(settings)
  const now = new Date()

  // Get the furthest notification window
  const maxMinutes = enabledLevels.length > 0
    ? Math.max(...enabledLevels.map(l => NOTIFICATION_PRESETS[l]))
    : 30

  const notifyBefore = new Date(now.getTime() + maxMinutes * 60 * 1000)

  return prisma.reminder.findMany({
    where: {
      completed: false,
      dueAt: {
        gt: now,
        lte: notifyBefore,
      },
    },
    include: {
      lead: { include: { assignee: true } },
    },
  })
}

export async function getPendingDealNotifications() {
  const settings = await getNotificationSettings()
  const enabledLevels = getEnabledLevels(settings)
  const now = new Date()

  const maxMinutes = enabledLevels.length > 0
    ? Math.max(...enabledLevels.map(l => NOTIFICATION_PRESETS[l]))
    : 30

  const notifyBefore = new Date(now.getTime() + maxMinutes * 60 * 1000)

  return prisma.dealReminder.findMany({
    where: {
      completed: false,
      dueAt: {
        gt: now,
        lte: notifyBefore,
      },
    },
    include: {
      deal: { include: { assignee: true } },
    },
  })
}

// Legacy send functions - redirect to use level-based system
export async function sendReminderNotification(reminderId: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: { lead: { include: { assignee: true } } },
  })

  if (!reminder || reminder.completed) {
    return { success: false, message: 'Reminder not found or completed' }
  }

  const settings = await getNotificationSettings()
  const now = new Date()

  // Find the first applicable level that hasn't been notified
  const enabledLevels = getEnabledLevels(settings)
  for (const level of enabledLevels) {
    const notifiedField = getNotifiedField(level) as keyof typeof reminder
    if (!reminder[notifiedField] && isWithinWindow(reminder.dueAt, level, now)) {
      return sendReminderNotificationForLevel(reminder, level, settings, now)
    }
  }

  return { success: false, message: 'No applicable notification level' }
}

export async function sendDealReminderNotification(reminderId: string) {
  const reminder = await prisma.dealReminder.findUnique({
    where: { id: reminderId },
    include: { deal: { include: { assignee: true } } },
  })

  if (!reminder || reminder.completed) {
    return { success: false, message: 'Deal reminder not found or completed' }
  }

  const settings = await getNotificationSettings()
  const now = new Date()

  const enabledLevels = getEnabledLevels(settings)
  for (const level of enabledLevels) {
    const notifiedField = getNotifiedField(level) as keyof typeof reminder
    if (!reminder[notifiedField] && isWithinWindow(reminder.dueAt, level, now)) {
      return sendDealReminderNotificationForLevel(reminder, level, settings, now)
    }
  }

  return { success: false, message: 'No applicable notification level' }
}

// Test notification channels
export async function testNotificationChannel(channel: 'email' | 'telegram' | 'slack') {
  const settings = await getNotificationSettings()
  const testMessage = '🔔 Test notification from Pipeline CRM - Your notifications are working!'

  try {
    switch (channel) {
      case 'email':
        if (!settings.emailAddress) throw new Error('Email address not configured')
        await sendEmailNotification(settings.emailAddress, 'Test', testMessage)
        break
      case 'telegram':
        if (!settings.telegramBotToken || !settings.telegramChatId) {
          throw new Error('Telegram not fully configured')
        }
        await sendTelegramNotification(settings.telegramBotToken, settings.telegramChatId, testMessage)
        break
      case 'slack':
        const webhookUrl = process.env.SLACK_WEBHOOK_URL || settings.slackWebhookUrl
        if (!webhookUrl) throw new Error('Slack webhook not configured (set SLACK_WEBHOOK_URL env var)')
        await sendSlackNotification(webhookUrl, testMessage, settings.slackChannel || undefined)
        break
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Helper: Format date in a specific timezone
function formatDateInTimezone(date: Date, timezone: string): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    // Fallback if timezone is invalid
    return date.toLocaleString('en-US')
  }
}

// Helper: Get short timezone abbreviation
function getTimezoneAbbr(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(new Date())
    const tzPart = parts.find(p => p.type === 'timeZoneName')
    return tzPart?.value || timezone
  } catch {
    return timezone
  }
}

// Helper: Format lead reminder message
function formatReminderMessage(
  reminder: { dueAt: Date; note: string | null; lead: { name: string; assignee: { name: string } | null } },
  timeUntil: string,
  timezone: string
) {
  const dueTime = formatDateInTimezone(reminder.dueAt, timezone)
  const tzAbbr = getTimezoneAbbr(timezone)
  let message = `🔔 Reminder: Follow up with ${reminder.lead.name}\n`
  message += `⏰ Due in: ${timeUntil}\n`
  message += `📅 Due: ${dueTime} (${tzAbbr})\n`
  if (reminder.note) {
    message += `📝 Note: ${reminder.note}\n`
  }
  if (reminder.lead.assignee) {
    message += `👤 Assigned to: ${reminder.lead.assignee.name}`
  }
  return message
}

// Helper: Format deal reminder message
function formatDealReminderMessage(
  reminder: { dueAt: Date; note: string | null; type: string; deal: { communityName: string; assignee: { name: string } | null } },
  timeUntil: string,
  timezone: string
) {
  const dueTime = formatDateInTimezone(reminder.dueAt, timezone)
  const tzAbbr = getTimezoneAbbr(timezone)
  const typeEmoji = {
    PAYMENT: '💰',
    VESTING: '🔓',
    REVIEW: '📋',
    OTHER: '📌',
  }[reminder.type] || '📌'

  let message = `${typeEmoji} Deal Reminder: ${reminder.deal.communityName}\n`
  message += `⏰ Due in: ${timeUntil}\n`
  message += `📅 Due: ${dueTime} (${tzAbbr})\n`
  message += `🏷️ Type: ${reminder.type}\n`
  if (reminder.note) {
    message += `📝 Note: ${reminder.note}\n`
  }
  if (reminder.deal.assignee) {
    message += `👤 Assigned to: ${reminder.deal.assignee.name}`
  }
  return message
}

// Helper: Send email notification
async function sendEmailNotification(to: string, subject: string, body: string) {
  console.log(`📧 Email to ${to}: ${subject}\n${body}`)
  return { success: true }
}

// Helper: Send Telegram notification
async function sendTelegramNotification(botToken: string, chatId: string, message: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Telegram API error: ${error}`)
  }

  return { success: true }
}

// Helper: Send Slack notification
async function sendSlackNotification(webhookUrl: string, message: string, channel?: string) {
  const payload: { text: string; channel?: string } = { text: message }
  if (channel) {
    payload.channel = channel
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Slack webhook error: ${response.statusText}`)
  }

  return { success: true }
}
