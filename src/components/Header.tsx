'use client'

import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useAIAdvisorTrigger } from './AIAdvisorProvider'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/planner': 'Planner',
  '/career': 'Career',
  '/finance': 'Finance',
  '/health': 'Health',
  '/learning': 'Learning',
  '/coding': 'Coding',
  '/documents': 'Documents',
  '/settings': 'Settings',
}

export default function Header() {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'Personal OS'
  const trigger = useAIAdvisorTrigger()

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-surface-1 border-b border-surface-3 shrink-0">
      <h1 className="text-base font-semibold text-white">{title}</h1>
      {trigger && (
        <button
          onClick={trigger.toggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-3 hover:border-accent/40 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <trigger.icon size={14} className="text-accent" />
          {trigger.label}
          <ChevronDown size={12} className={`text-slate-500 transition-transform ${trigger.isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}
    </header>
  )
}
