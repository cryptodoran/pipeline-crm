import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
                </div>
                <nav className="flex space-x-4">
                  <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Board
                  </a>
                  <a href="/team" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Team
                  </a>
                  <a href="/tags" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Tags
                  </a>
                  <a href="/reminders" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Reminders
                  </a>
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
