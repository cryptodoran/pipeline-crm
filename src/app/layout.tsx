import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { MobileNav } from '@/components/mobile-nav'
import { LogoutButton } from '@/components/logout-button'
import { UserIdentity } from '@/components/user-identity'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Defi App Pipeline',
  description: 'Track partnerships through their journey from stranger to partner',
}

const NAV_LINKS = [
  { href: '/', label: 'Board' },
  { href: '/deals', label: 'Deals' },
  { href: '/distributions', label: 'Distributions' },
  { href: '/team', label: 'Team' },
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
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Toaster position="bottom-right" richColors theme="dark" />
        <div className="min-h-screen bg-gray-900">
          <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-14 sm:h-16">
                <div className="flex items-center gap-3">
                  <a href="/" className="flex items-center gap-2">
                    <img 
                      src="https://raw.githubusercontent.com/defi-app/brand/main/Logos/Light/defi-app-logo-mark-only-light.svg" 
                      alt="Defi App" 
                      className="h-8 w-8"
                    />
                    <span className="text-lg font-semibold text-white hidden sm:inline">Pipeline</span>
                  </a>
                </div>
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                  {NAV_LINKS.map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-gray-300 hover:text-white px-2 lg:px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-700"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="border-l border-gray-600 pl-2 ml-1 flex items-center gap-1">
                    <UserIdentity />
                    <LogoutButton />
                  </div>
                </nav>
                {/* Mobile Nav */}
                <div className="md:hidden flex items-center gap-2">
                  <UserIdentity />
                  <LogoutButton />
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