import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/mobile-nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pipeline CRM',
  description: 'Track leads through their journey from stranger to partner',
}

const NAV_LINKS = [
  { href: '/', label: 'Board' },
  { href: '/deals', label: 'Deals' },
  { href: '/activity', label: 'Activity' },
  { href: '/team', label: 'Team' },
  { href: '/tags', label: 'Tags' },
  { href: '/reminders', label: 'Reminders' },
  { href: '/archived', label: 'Archived' },
  { href: '/settings', label: 'Settings' },
]

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
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center">
                  <a href="/" className="text-xl font-bold text-gray-900 dark:text-white">Pipeline</a>
                </div>
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                  {NAV_LINKS.map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-2 lg:px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {link.label}
                    </a>
                  ))}
                  <ThemeToggle />
                </nav>
                {/* Mobile Nav */}
                <div className="md:hidden flex items-center gap-2">
                  <ThemeToggle />
                  <MobileNav links={NAV_LINKS} />
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}