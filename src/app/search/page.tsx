import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, CalendarDays, Briefcase, DollarSign, HeartPulse, BookOpen, Code2, FileText } from 'lucide-react'
import SearchInput from './SearchInput'

const TYPE_META = {
  task:        { label: 'Task',        icon: CalendarDays, color: 'text-blue-400',   bg: 'bg-blue-500/10',   to: '/planner' },
  application: { label: 'Application', icon: Briefcase,    color: 'text-amber-400',  bg: 'bg-amber-500/10',  to: '/career' },
  expense:     { label: 'Expense',     icon: DollarSign,   color: 'text-green-400',  bg: 'bg-green-500/10',  to: '/finance' },
  resource:    { label: 'Resource',    icon: BookOpen,     color: 'text-purple-400', bg: 'bg-purple-500/10', to: '/learning' },
  project:     { label: 'Project',     icon: Code2,        color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   to: '/coding' },
  document:    { label: 'Document',    icon: FileText,     color: 'text-orange-400', bg: 'bg-orange-500/10', to: '/documents' },
  habit:       { label: 'Habit',       icon: HeartPulse,   color: 'text-red-400',    bg: 'bg-red-500/10',    to: '/health' },
}

interface SearchResult {
  type: keyof typeof TYPE_META
  title: string
  subtitle?: string
  href: string
}

async function search(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const term = `%${q}%`

  const [tasks, apps, expenses, resources, projects, docs, habits] = await Promise.all([
    supabase.from('tasks').select('id, text, priority').eq('user_id', user.id).ilike('text', term).limit(5),
    supabase.from('applications').select('id, company, role, status').eq('user_id', user.id).or(`company.ilike.${term},role.ilike.${term}`).limit(5),
    supabase.from('expenses').select('id, description, amount, category').eq('user_id', user.id).ilike('description', term).limit(5),
    supabase.from('resources').select('id, title, type, category').eq('user_id', user.id).ilike('title', term).limit(5),
    supabase.from('projects').select('id, name, description').eq('user_id', user.id).ilike('name', term).limit(5),
    supabase.from('documents').select('id, title, tags').eq('user_id', user.id).ilike('title', term).limit(5),
    supabase.from('habits').select('id, name, emoji').eq('user_id', user.id).ilike('name', term).limit(5),
  ])

  const results: SearchResult[] = [
    ...(tasks.data ?? []).map(r => ({ type: 'task' as const, title: r.text, subtitle: r.priority, href: '/planner' })),
    ...(apps.data ?? []).map(r => ({ type: 'application' as const, title: r.company, subtitle: r.role, href: '/career' })),
    ...(expenses.data ?? []).map(r => ({ type: 'expense' as const, title: r.description ?? '', subtitle: `₹${r.amount} · ${r.category}`, href: '/finance' })),
    ...(resources.data ?? []).map(r => ({ type: 'resource' as const, title: r.title, subtitle: `${r.type} · ${r.category}`, href: '/learning' })),
    ...(projects.data ?? []).map(r => ({ type: 'project' as const, title: r.name, subtitle: r.description ?? '', href: '/coding' })),
    ...(docs.data ?? []).map(r => ({ type: 'document' as const, title: r.title, subtitle: (r.tags ?? []).join(', '), href: '/documents' })),
    ...(habits.data ?? []).map(r => ({ type: 'habit' as const, title: `${r.emoji ?? ''} ${r.name}`, href: '/health' })),
  ]

  return results
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const results = await search(q)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Search</h2>
        <p className="text-sm text-slate-500">Tasks, applications, resources, projects, documents</p>
      </div>

      <SearchInput defaultValue={q} />

      {q && (
        <p className="text-xs text-slate-600">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results.length === 0 && q && (
        <div className="text-center py-16 text-slate-600">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No results found</p>
        </div>
      )}

      {!q && (
        <div className="text-center py-16 text-slate-700">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Type to search across all modules</p>
        </div>
      )}

      <ul className="space-y-2">
        {results.map((r, i) => {
          const meta = TYPE_META[r.type]
          const Icon = meta.icon
          return (
            <li key={i}>
              <Link href={r.href} className="flex items-center gap-3 p-3 bg-surface-1 border border-surface-3 rounded-xl hover:border-accent/30 transition-colors group">
                <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{r.title}</p>
                  {r.subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{r.subtitle}</p>}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${meta.bg} ${meta.color} shrink-0`}>{meta.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
