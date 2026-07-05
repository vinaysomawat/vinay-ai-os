'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ChevronDown, ChevronRight, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { getAIRecommendations } from '@/features/ai/recommendations'
import { getDashboardData } from '@/features/dashboard/actions'
import type { Recommendation } from '@/features/ai/recommendations'

const HISTORY_KEY = 'vos_rec_history'
const MAX_HISTORY = 10

interface HistoryEntry {
  timestamp: string
  recommendations: Recommendation[]
}

const MODULE_META: Record<string, { label: string; emoji: string; color: string; bg: string; to: string }> = {
  planner:  { label: 'Planner',  emoji: '📋', color: 'text-blue-400',   bg: 'bg-blue-500/10',   to: '/planner' },
  career:   { label: 'Career',   emoji: '💼', color: 'text-amber-400',  bg: 'bg-amber-500/10',  to: '/career' },
  finance:  { label: 'Finance',  emoji: '💸', color: 'text-green-400',  bg: 'bg-green-500/10',  to: '/finance' },
  health:   { label: 'Health',   emoji: '💪', color: 'text-red-400',    bg: 'bg-red-500/10',    to: '/health' },
  learning: { label: 'Learning', emoji: '📚', color: 'text-purple-400', bg: 'bg-purple-500/10', to: '/learning' },
  projects: { label: 'Projects', emoji: '💻', color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   to: '/coding' },
}

function RecList({ recs }: { recs: Recommendation[] }) {
  return (
    <ul className="space-y-2">
      {recs.map((rec, i) => {
        const meta = MODULE_META[rec.module] ?? MODULE_META['planner']
        return (
          <li key={i} className="flex items-center gap-3 p-3 bg-surface-2 border border-surface-3 rounded-xl group hover:border-accent/20 transition-colors">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-3 shrink-0">
              <span className="text-xs font-bold text-slate-500">{i + 1}</span>
            </div>
            <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 text-lg`}>
              {rec.emoji || meta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200">{rec.action}</p>
              <p className={`text-xs mt-0.5 font-medium ${meta.color}`}>{meta.label}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                {rec.impact}
              </span>
              <Link href={meta.to} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-accent transition-all">
                <ArrowRight size={14} />
              </Link>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function HistoryAccordion({ entry, index }: { entry: HistoryEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const date = new Date(entry.timestamp)
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
          <span className="text-xs text-slate-600">{entry.recommendations.length} recommendations</span>
        </div>
        <span className="text-xs text-slate-600">#{index + 1}</span>
      </button>
      {open && (
        <div className="p-3 bg-surface-2/50 border-t border-surface-3">
          <RecList recs={entry.recommendations} />
        </div>
      )}
    </div>
  )
}

export default function RecommendationsView() {
  const [current, setCurrent] = useState<Recommendation[] | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY)
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  const generate = async () => {
    setLoading(true)
    try {
      const data = await getDashboardData()
      const recs  = await getAIRecommendations(data)
      setCurrent(recs)

      const entry: HistoryEntry = { timestamp: new Date().toISOString(), recommendations: recs }
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
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">{today}</p>
        <h2 className="text-2xl font-bold text-white">Recommendations</h2>
        <p className="text-sm text-slate-500 mt-1">AI-generated actions to improve your Life Score</p>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2.5 px-5 py-3 bg-accent rounded-xl text-white text-sm font-medium hover:bg-accent/80 disabled:opacity-60 transition-all shadow-lg shadow-accent/20">
        {loading
          ? <><RefreshCw size={16} className="animate-spin" /> Generating recommendations...</>
          : <><Sparkles size={16} /> Get Today&apos;s Recommendations</>
        }
      </button>

      {/* Loading skeleton */}
      {loading && (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-16 bg-surface-1 border border-surface-3 rounded-xl animate-pulse" />
          ))}
        </ul>
      )}

      {/* Latest result */}
      {current && !loading && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Latest</p>
          <RecList recs={current} />
        </div>
      )}

      {/* History accordion */}
      {history.length > 1 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-widest">History</p>
          <div className="space-y-2">
            {history.slice(1).map((entry, i) => (
              <HistoryAccordion key={entry.timestamp} entry={entry} index={i + 1} />
            ))}
          </div>
        </div>
      )}

      {!current && history.length === 0 && !loading && (
        <div className="text-center py-16 text-slate-600">
          <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click the button to generate your first recommendations</p>
        </div>
      )}
    </div>
  )
}
