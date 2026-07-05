'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, HeartPulse, DollarSign, BookOpen, Search } from 'lucide-react'

const nav = [
  { label: 'Home',    to: '/dashboard', icon: LayoutDashboard },
  { label: 'Planner', to: '/planner',   icon: CalendarDays },
  { label: 'Health',  to: '/health',    icon: HeartPulse },
  { label: 'Finance', to: '/finance',   icon: DollarSign },
  { label: 'Learn',   to: '/learning',  icon: BookOpen },
  { label: 'Search',  to: '/search',    icon: Search },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-1 border-t border-surface-3 flex">
      {nav.map(({ label, to, icon: Icon }) => {
        const active = pathname === to
        return (
          <Link key={to} href={to}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? 'text-accent' : 'text-slate-600 hover:text-slate-400'}`}>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
