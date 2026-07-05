'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronRight, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getFullRecommendations } from '@/features/ai/recommendations'
import { getDashboardData } from '@/features/dashboard/actions'
import type { FullRecommendations, Recommendation } from '@/features/ai/recommendations'

const HISTORY_KEY = 'vos_rec_history'
const MAX_HISTORY = 10

interface HistoryEntry {
  timestamp: string
  data: FullRecommendations
}

type ModuleKey = 'all' | 'health' | 'finance' | 'career' | 'learning' | 'projects'

const MODULES: { key: ModuleKey; label: string; emoji: string; color: string; bg: string; to: string }[] = [
  { key: 'all',      label: 'All',      emoji: '⚡', color: 'text-accent',      bg: 'bg-accent/10',      to: '/dashboard' },
  { key: 'health',   label: 'Health',   emoji: '💪', color: 'text-red-400',     bg: 'bg-red-500/10',     to: '/health' },
  { key: 'finance',  label: 'Finance',  emoji: '💸', color: 'text-green-400',   bg: 'bg-green-500/10',   to: '/finance' },
  { key: 'career',   label: 'Career',   emoji: '💼', color: 'text-amber-400',   bg: 'bg-amber-500/10',   to: '/career' },
  { key: 'learning', label: 'Learning', emoji: '📚', color: 'text-purple-400',  bg: 'bg-purple-500/10',  to: '/learning' },
  { key: 'projects', label: 'Projects', emoji: '💻', color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    to: '/coding' },
]

const MODULE_META: Record<string, { color: string; bg: string; to: string }> = {
  health:   { color: 'text-red-400',    bg: 'bg-red-500/10',    to: '/health' },
  finance:  { color: 'text-green-400',  bg: 'bg-green-500/10',  to: '/finance' },
  career:   { color: 'text-amber-400',  bg: 'bg-amber-500/10',  to: '/career' },
  learning: { color: 'text-purple-400', bg: 'bg-purple-500/10', to: '/learning' },
  projects: { color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   to: '/coding' },
  planner:  { color: 'text-blue-400',   bg: 'bg-blue-500/10',   to: '/planner' },
}

function RecItem({ rec, module }: { rec: Recommendation & { module?: string }; module?: string }) {
  const key = module ?? rec.module ?? 'planner'
  const meta = MODULE_META[key] ?? MODULE_META['planner']
  const to = meta.to
  return (
    <li className="flex items-center gap-3 p-3 bg-surface-2 border border-surface-3 rounded-xl group hover:border-accent/20 transition-colors">
      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 text-lg`}>
        {rec.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200">{rec.action}</p>
        {rec.module && <p className={`text-xs mt-0.5 font-medium capitalize ${meta.color}`}>{rec.module}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full whitespace-nowrap">
          {rec.impact}
        </span>
        <Link href={to} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-accent transition-all">
          <ArrowRight size={14} />
        </Link>
      </div>
    </li>
  )
}

function RecPanel({ data, activeTab }: { data: FullRecommendations; activeTab: ModuleKey }) {
  const recs: (Recommendation & { module?: string })[] =
    activeTab === 'all'
      ? data.overall
      : data.byModule[activeTab] ?? []

  if (recs.length === 0) return <p className="text-sm text-slate-600 text-center py-8">No recommendations for this module</p>

  return (
    <ul className="space-y-2">
      {recs.map((rec, i) => (
        <RecItem key={i} rec={rec} module={activeTab === 'all' ? rec.module : activeTab} />
      ))}
    </ul>
  )
}

function HistoryAccordion({ entry }: { entry: HistoryEntry }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<ModuleKey>('all')
  const date  = new Date(entry.timestamp)
  const label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time  = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="border border-surface-3 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-1 hover:bg-surface-2 transition-colors">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
          <span className="text-sm font-medium text-slate-300">{label} · {time}</span>
        </div>
        <span className="text-xs text-slate-600">{entry.data.overall.length} recommendations</span>
      </button>

      {open && (
        <div className="border-t border-surface-3 bg-surface-2/30">
          {/* Summary */}
          {entry.data.summary && (
            <p className="text-xs text-slate-500 leading-relaxed px-4 pt-3 pb-2 border-b border-surface-3/50">{entry.data.summary}</p>
          )}
          {/* Mini tabs */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto">
            {MODULES.map(m => (
              <button key={m.key} onClick={() => setTab(m.key)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${tab === m.key ? `${m.bg} ${m.color}` : 'text-slate-600 hover:text-slate-400'}`}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
          <div className="p-3">
            <RecPanel data={entry.data} activeTab={tab} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function RecommendationsView() {
  const [current, setCurrent] = useState<FullRecommendations | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<ModuleKey>('all')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) {
        const parsed: HistoryEntry[] = JSON.parse(stored)
        setHistory(parsed)
        if (parsed.length > 0) setCurrent(parsed[0].data)
      }
    } catch {}
  }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const data = await getDashboardData()
      const full = await getFullRecommendations(data)
      setCurrent(full)
      setActiveTab('all')

      const entry: HistoryEntry = { timestamp: new Date().toISOString(), data: full }
      setHistory(prev => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)) } catch {}
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">{today}</p>
          <h2 className="text-2xl font-bold text-white">Recommendations</h2>
          <p className="text-sm text-slate-500 mt-1">AI actions to improve your Life Score</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-accent rounded-xl text-white text-sm font-medium hover:bg-accent/80 disabled:opacity-60 transition-all shadow-lg shadow-accent/20">
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Generating...</>
            : <><Sparkles size={14} /> Generate</>}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          <div className="h-16 bg-surface-2 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 w-20 bg-surface-2 rounded-lg animate-pulse" />)}
          </div>
          <ul className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="h-14 bg-surface-1 border border-surface-3 rounded-xl animate-pulse" />
            ))}
          </ul>
        </div>
      )}

      {/* Current result */}
      {current && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          {current.summary && (
            <div className="flex gap-3 p-4 bg-gradient-to-br from-accent/10 to-purple-500/5 border border-accent/20 rounded-xl">
              <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">{current.summary}</p>
            </div>
          )}

          {/* Module tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {MODULES.map(m => (
              <button key={m.key} onClick={() => setActiveTab(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${activeTab === m.key ? `${m.bg} ${m.color} border-transparent` : 'text-slate-500 border-surface-3 hover:text-slate-300'}`}>
                <span>{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>

          {/* Recommendations for active tab */}
          <RecPanel data={current} activeTab={activeTab} />
        </div>
      )}

      {/* Empty state */}
      {!current && !loading && (
        <div className="text-center py-16 text-slate-600">
          <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click Generate to get your personalised recommendations</p>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600 uppercase tracking-widest">Previous Sessions</p>
          {history.slice(1).map(entry => (
            <HistoryAccordion key={entry.timestamp} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
