'use client'

import { useEffect, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Briefcase,
  DollarSign,
  HeartPulse,
  BookOpen,
  Code2,
  FileText,
  LayoutDashboard,
  Settings,
  Cpu,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import UserInfo from './UserInfo'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'
import pkg from '../../package.json'

const topLevel = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
]

// Growth Engine pillars, per PRD-v2: every feature maps to Learn/Build/Perform/Recover.
// Finance and Documents don't map to a pillar in the PRD — kept ungrouped below.
const pillars = [
  { name: 'Learn',    items: [{ label: 'Learning', to: '/learning', icon: BookOpen }] },
  { name: 'Build',    items: [{ label: 'Coding', to: '/coding', icon: Code2 }] },
  { name: 'Perform',  items: [{ label: 'Planner', to: '/planner', icon: CalendarDays }, { label: 'Career', to: '/career', icon: Briefcase }] },
  { name: 'Recover',  items: [{ label: 'Health', to: '/health', icon: HeartPulse }] },
]

const ungrouped = [
  { label: 'Finance', to: '/finance', icon: DollarSign },
  { label: 'Documents', to: '/documents', icon: FileText },
]

const COLLAPSE_KEY = 'sidebar-collapsed'

function NavLink({ label, to, icon: Icon, isActive, collapsed }: { label: string; to: string; icon: LucideIcon; isActive: boolean; collapsed: boolean }) {
  const link: ReactElement = (
    <Link
      href={to}
      className={`group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
        collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
      } ${
        isActive ? 'bg-accent/20 text-accent' : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200 hover:translate-x-0.5'
      }`}
    >
      {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />}
      <Icon size={16} className="shrink-0" />
      {!collapsed && label}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(COLLAPSE_KEY) === '1') setCollapsed(true)
  }, [])

  function toggle() {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <aside className={`hidden md:flex ${collapsed ? 'w-14' : 'w-48'} shrink-0 flex-col bg-surface-1 border-r border-surface-3 transition-[width] duration-200`}>
      <div className={`flex items-center gap-2.5 py-5 border-b border-surface-3 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent shrink-0">
          <Cpu size={15} className="text-white" />
        </div>
        {!collapsed && <span className="text-sm font-semibold tracking-wide text-white truncate">Personal OS</span>}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {topLevel.map(({ label, to, icon }) => (
          <NavLink key={to} label={label} to={to} icon={icon} isActive={pathname === to} collapsed={collapsed} />
        ))}

        {pillars.map(pillar => (
          <div key={pillar.name} className="pt-3">
            {!collapsed && <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-600 uppercase">{pillar.name}</p>}
            {pillar.items.map(({ label, to, icon }) => (
              <NavLink key={to} label={label} to={to} icon={icon} isActive={pathname === to} collapsed={collapsed} />
            ))}
          </div>
        ))}

        <div className="pt-3">
          {ungrouped.map(({ label, to, icon }) => (
            <NavLink key={to} label={label} to={to} icon={icon} isActive={pathname === to} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-surface-3 space-y-2">
        <NavLink label="Settings" to="/settings" icon={Settings} isActive={pathname === '/settings'} collapsed={collapsed} />

        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center gap-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-surface-2 hover:text-slate-300 transition-colors w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
            collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'
          }`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && 'Collapse'}
        </button>

        {!collapsed && <UserInfo />}
        {!collapsed && <p className="text-xs text-slate-700 font-mono px-1">v{pkg.version}</p>}
      </div>
    </aside>
  )
}
