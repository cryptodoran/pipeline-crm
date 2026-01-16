import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pipeline CRM',
  description: 'Track leads through their journey from stranger to partner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster position="bottom-right" richColors />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pipeline</h1>
                </div>
                <nav className="flex items-center space-x-4">
                  <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                    Board
                  </a>
                  <a href="/deals" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                    Deals
                  </a>
                  <a href="/team" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                    Team
                  </a>
                  <a href="/tags" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                    Tags
                  </a>
                  <a href="/reminders" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                    Reminders
                  </a>
                  <a href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium">
                    Settings
                  </a>
                  <ThemeToggle />
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
