'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'
import { getNotificationSettings, testNotificationChannelInternal } from './notifications'

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

export async function testNotificationChannel(channel: 'email' | 'telegram' | 'slack') {
  return testNotificationChannelInternal(channel)
}
