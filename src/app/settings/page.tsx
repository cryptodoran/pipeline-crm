import { getNotificationSettings, isSlackWebhookLocked } from '@/lib/notifications'
import { requireAuth } from '@/lib/current-user'
import { NotificationSettingsForm } from '@/components/notification-settings-form'
import { Settings, Bell, Mail, MessageCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  await requireAuth()
  const settings = await getNotificationSettings()
  const slackLocked = await isSlackWebhookLocked()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-gray-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-400">Configure notifications and integrations</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Reminder Notifications</h3>
          </div>
          
          <p className="text-gray-400 mb-6">
            Get notified when reminders are due. Configure one or more channels to receive alerts.
          </p>

          <NotificationSettingsForm initialSettings={settings} slackWebhookLocked={slackLocked} />
        </div>

        {/* Integration Info */}
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Setting Up Integrations</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">Email</h4>
                <p className="text-sm text-gray-400">
                  Simply enter your email address to receive reminder notifications via email.
                  For production use, configure a mail service like Resend or SendGrid.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 4.02-1.75 6.7-2.91 8.03-3.46 3.85-1.6 4.64-1.88 5.16-1.89.11 0 .37.03.54.18.14.12.18.28.2.45-.01.05.01.13 0 .21z"/>
              </svg>
              <div>
                <h4 className="font-medium text-white">Telegram</h4>
                <p className="text-sm text-gray-400">
                  1. Create a bot via @BotFather and get the bot token<br/>
                  2. Start a chat with your bot and send any message<br/>
                  3. Get your chat ID by visiting: <code className="bg-gray-700 px-1 py-0.5 rounded text-xs text-gray-300">https://api.telegram.org/bot[TOKEN]/getUpdates</code>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <MessageCircle className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">Slack</h4>
                <p className="text-sm text-gray-400">
                  The Slack webhook URL is set via the <code className="bg-gray-700 px-1 py-0.5 rounded text-xs text-gray-300">SLACK_WEBHOOK_URL</code> environment variable (admin only).<br/><br/>
                  To tag team members in notifications, set their <strong>Slack User ID</strong> on the Team page.<br/>
                  Find user IDs in Slack: click a profile → More → Copy member ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
