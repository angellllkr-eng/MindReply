import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/components/app-shell'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Mind-Reply — Human-supervised agents for agencies',
  description:
    'Mind-Reply powers AgencyComm (client communication & follow-ups) and ContentFlow (AI content briefs). Every AI output is reviewed by a human before it ships.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-gray-50`}>
      <body className="font-sans antialiased text-gray-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
