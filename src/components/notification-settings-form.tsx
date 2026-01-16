'use client'

import { useState, useTransition } from 'react'
import { Mail, Send, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateNotificationSettings, testNotificationChannel } from '@/lib/notifications'

interface NotificationSettings {
  id: string
  emailEnabled: boolean
  emailAddress: string | null
  telegramEnabled: boolean
  telegramChatId: string | null
  telegramBotToken: string | null
  slackEnabled: boolean
  slackWebhookUrl: string | null
  slackChannel: string | null
  reminderMinutesBefore: number
}

interface NotificationSettingsFormProps {
  initialSettings: NotificationSettings
  slackWebhookLocked?: boolean
}

export function NotificationSettingsForm({ initialSettings, slackWebhookLocked = false }: NotificationSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isPending, startTransition] = useTransition()
  const [testingChannel, setTestingChannel] = useState<string | null>(null)

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateNotificationSettings({
          emailEnabled: settings.emailEnabled,
          emailAddress: settings.emailAddress,
          telegramEnabled: settings.telegramEnabled,
          telegramChatId: settings.telegramChatId,
          telegramBotToken: settings.telegramBotToken,
          slackEnabled: settings.slackEnabled,
          slackWebhookUrl: settings.slackWebhookUrl,
          slackChannel: settings.slackChannel,
          reminderMinutesBefore: settings.reminderMinutesBefore,
        })
        toast.success('Settings saved!')
      } catch {
        toast.error('Failed to save settings')
      }
    })
  }

  const handleTest = async (channel: 'email' | 'telegram' | 'slack') => {
    setTestingChannel(channel)
    try {
      const result = await testNotificationChannel(channel)
      if (result.success) {
        toast.success(`${channel.charAt(0).toUpperCase() + channel.slice(1)} test sent!`)
      } else {
        toast.error(result.error || 'Test failed')
      }
    } catch {
      toast.error('Test failed')
    } finally {
      setTestingChannel(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Timing Setting */}
      <div className="p-4 bg-gray-750 rounded-lg">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notify me before reminder is due
        </label>
        <select
          value={settings.reminderMinutesBefore}
          onChange={(e) => setSettings({ ...settings, reminderMinutesBefore: Number(e.target.value) })}
          className="w-full md:w-48 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={0}>At due time</option>
          <option value={5}>5 minutes before</option>
          <option value={15}>15 minutes before</option>
          <option value={30}>30 minutes before</option>
          <option value={60}>1 hour before</option>
          <option value={1440}>1 day before</option>
        </select>
      </div>

      {/* Email Settings */}
      <div className="border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-white">Email Notifications</h4>
              <p className="text-sm text-gray-400">Receive reminders via email</p>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, emailEnabled: !settings.emailEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.emailEnabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.emailEnabled && (
          <div className="space-y-3 pl-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={settings.emailAddress || ''}
                  onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
                  placeholder="you@example.com"
                  className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleTest('email')}
                  disabled={!settings.emailAddress || testingChannel === 'email'}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-1"
                >
                  {testingChannel === 'email' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Telegram Settings */}
      <div className="border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 4.02-1.75 6.7-2.91 8.03-3.46 3.85-1.6 4.64-1.88 5.16-1.89.11 0 .37.03.54.18.14.12.18.28.2.45-.01.05.01.13 0 .21z"/>
            </svg>
            <div>
              <h4 className="font-medium text-white">Telegram Notifications</h4>
              <p className="text-sm text-gray-400">Receive reminders via Telegram bot</p>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, telegramEnabled: !settings.telegramEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.telegramEnabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.telegramEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.telegramEnabled && (
          <div className="space-y-3 pl-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bot Token</label>
              <input
                type="password"
                value={settings.telegramBotToken || ''}
                onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Chat ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.telegramChatId || ''}
                  onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                  placeholder="123456789"
                  className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleTest('telegram')}
                  disabled={!settings.telegramBotToken || !settings.telegramChatId || testingChannel === 'telegram'}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-1"
                >
                  {testingChannel === 'telegram' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slack Settings */}
      <div className="border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>
            <div>
              <h4 className="font-medium text-white">Slack Notifications</h4>
              <p className="text-sm text-gray-400">Receive reminders in a Slack channel</p>
            </div>
          </div>
          <button
            onClick={() => setSettings({ ...settings, slackEnabled: !settings.slackEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.slackEnabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.slackEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.slackEnabled && (
          <div className="space-y-3 pl-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Webhook URL</label>
              {slackWebhookLocked ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-700 rounded-lg">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Configured via environment variable (locked)</span>
                </div>
              ) : (
                <input
                  type="password"
                  value={settings.slackWebhookUrl || ''}
                  onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Channel (optional override)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.slackChannel || ''}
                  onChange={(e) => setSettings({ ...settings, slackChannel: e.target.value })}
                  placeholder="#crm-notifications"
                  className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleTest('slack')}
                  disabled={(!slackWebhookLocked && !settings.slackWebhookUrl) || testingChannel === 'slack'}
                  className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-1"
                >
                  {testingChannel === 'slack' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Test
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Team members will be @mentioned if their Slack User ID is set on the Team page.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  )
}
