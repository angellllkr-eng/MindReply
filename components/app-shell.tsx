'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Inbox,
  CalendarClock,
  BarChart3,
  FileText,
  PlusCircle,
  ClipboardCheck,
  CreditCard,
  Tag,
  Menu,
  X,
  Brain,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'AgencyComm',
    items: [
      { href: '/dashboard', label: 'Inbox', icon: Inbox },
      { href: '/dashboard/followups', label: 'Follow-ups', icon: CalendarClock },
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'ContentFlow',
    items: [
      { href: '/contentflow/dashboard', label: 'Briefs', icon: FileText },
      { href: '/contentflow/create', label: 'New Brief', icon: PlusCircle },
      { href: '/contentflow/review', label: 'Review Queue', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Account',
    items: [
      { href: '/dashboard/billing', label: 'Billing & Usage', icon: CreditCard },
      { href: '/pricing', label: 'Pricing', icon: Tag },
    ],
  },
]

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
        <Brain size={18} />
      </span>
      <span className="text-lg font-bold tracking-tight">Mind-Reply</span>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Marketing landing page renders without the app sidebar.
  if (pathname === '/') {
    return <>{children}</>
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Brand />
          <button
            className="md:hidden text-gray-500"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-6 p-4">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          active
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-gray-600">
            <Menu size={22} />
          </button>
          <Brand />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
