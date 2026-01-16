'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'

// Get or create notification settings (singleton pattern)
export async function getNotificationSettings() {
  let settings = await prisma.notificationSettings.findFirst()
  
  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: {
        emailEnabled: false,
        telegramEnabled: false,
        slackEnabled: false,
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
  reminderMinutesBefore?: number
}) {
  const settings = await getNotificationSettings()
  
  const updated = await prisma.notificationSettings.update({
    where: { id: settings.id },
    data,
  })
  
  revalidatePath('/settings')
  return updated
}

// Send notification for a reminder
export async function sendReminderNotification(reminderId: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      lead: {
        include: { assignee: true },
      },
    },
  })
  
  if (!reminder || reminder.completed || reminder.notified) {
    return { success: false, message: 'Reminder not found or already processed' }
  }
  
  const settings = await getNotificationSettings()
  const results: { channel: string; success: boolean; error?: string }[] = []
  
  const message = formatReminderMessage(reminder)
  
  // Send via Email
  if (settings.emailEnabled && settings.emailAddress) {
    try {
      await sendEmailNotification(settings.emailAddress, reminder.lead.name, message)
      results.push({ channel: 'email', success: true })
    } catch (error) {
      results.push({ channel: 'email', success: false, error: String(error) })
    }
  }
  
  // Send via Telegram
  if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
    try {
      await sendTelegramNotification(
        settings.telegramBotToken,
        settings.telegramChatId,
        message
      )
      results.push({ channel: 'telegram', success: true })
    } catch (error) {
      results.push({ channel: 'telegram', success: false, error: String(error) })
    }
  }
  
  // Send via Slack
  if (settings.slackEnabled && settings.slackWebhookUrl) {
    try {
      await sendSlackNotification(
        settings.slackWebhookUrl,
        message,
        settings.slackChannel || undefined
      )
      results.push({ channel: 'slack', success: true })
    } catch (error) {
      results.push({ channel: 'slack', success: false, error: String(error) })
    }
  }
  
  // Mark reminder as notified
  if (results.some(r => r.success)) {
    await prisma.reminder.update({
      where: { id: reminderId },
      data: { notified: true },
    })
  }
  
  return { success: results.some(r => r.success), results }
}

// Get reminders that need notifications
export async function getPendingNotifications() {
  const settings = await getNotificationSettings()
  const minutesBefore = settings.reminderMinutesBefore
  
  const now = new Date()
  const notifyBefore = new Date(now.getTime() + minutesBefore * 60 * 1000)
  
  return prisma.reminder.findMany({
    where: {
      completed: false,
      notified: false,
      dueAt: {
        lte: notifyBefore,
      },
    },
    include: {
      lead: {
        include: { assignee: true },
      },
    },
  })
}

// Process all pending notifications
export async function processPendingNotifications() {
  const pending = await getPendingNotifications()
  const results = []
  
  for (const reminder of pending) {
    const result = await sendReminderNotification(reminder.id)
    results.push({ reminderId: reminder.id, ...result })
  }
  
  return results
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
        if (!settings.slackWebhookUrl) throw new Error('Slack webhook not configured')
        await sendSlackNotification(settings.slackWebhookUrl, testMessage, settings.slackChannel || undefined)
        break
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Helper: Format reminder message
function formatReminderMessage(reminder: {
  dueAt: Date
  note: string | null
  lead: { name: string; assignee: { name: string } | null }
}) {
  const dueTime = reminder.dueAt.toLocaleString()
  let message = `🔔 Reminder: Follow up with ${reminder.lead.name}\n`
  message += `📅 Due: ${dueTime}\n`
  if (reminder.note) {
    message += `📝 Note: ${reminder.note}\n`
  }
  if (reminder.lead.assignee) {
    message += `👤 Assigned to: ${reminder.lead.assignee.name}`
  }
  return message
}

// Helper: Send email notification (using a simple fetch to a mail service)
async function sendEmailNotification(to: string, subject: string, body: string) {
  // For production, integrate with SendGrid, Resend, or similar
  // This is a placeholder that logs the email
  console.log(`📧 Email to ${to}: ${subject}\n${body}`)
  
  // If you want to use Resend (recommended):
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({ from: 'crm@yourdomain.com', to, subject, text: body })
  
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
