'use client'

import { useEffect, useState } from 'react'
import { getWeeklyReflection, type WeeklyReflection } from '../advisor'

const MODULES = ['Health', 'Finance', 'Career', 'Learning', 'Projects'] as const

export default function WeeklyReview() {
  const [data, setData] = useState<WeeklyReflection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getWeeklyReflection().then(result => { if (!cancelled) { setData(result); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        {[95, 100, 80, 90, 60].map((w, i) => <div key={i} className="h-3 rounded bg-surface-2 animate-pulse" style={{ width: `${w}%` }} />)}
      </div>
    )
  }

  if (!data) return null
  const { paragraph, stats } = data

  return (
    <div className="space-y-3">
      {stats && (
        <div className="space-y-1.5 bg-surface-2 rounded-lg p-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-slate-500">Avg Life Score ({stats.daysTracked}/7 days)</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{stats.avgLife}/100</span>
          </div>
          {MODULES.map(m => (
            <div key={m} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-16 shrink-0">{m}</span>
              <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${stats.moduleAvgs[m]}%` }} />
              </div>
              <span className="text-xs text-slate-400 tabular-nums w-7 text-right">{stats.moduleAvgs[m]}</span>
            </div>
          ))}
          <div className="text-xs text-slate-500 pt-1">
            Best {stats.best.score} ({stats.best.date}) · Worst {stats.worst.score} ({stats.worst.date})
          </div>
        </div>
      )}

      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{paragraph}</p>
    </div>
  )
}
