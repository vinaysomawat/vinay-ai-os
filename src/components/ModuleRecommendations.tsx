'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, RefreshCw } from 'lucide-react'
import { getModuleRecommendations } from '@/features/ai/recommendations'
import type { Recommendation } from '@/features/ai/recommendations'

interface Props {
  moduleLabel: string
  context: string
}

export default function ModuleRecommendations({ moduleLabel, context }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Recommendation[] | null>(null)

  const generate = async (bypassCache: boolean) => {
    if (loading) return
    setOpen(true)
    setLoading(true)
    try {
      const result = await getModuleRecommendations(moduleLabel, context, bypassCache)
      setItems(result)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    if (!items) { generate(false); return }
    setOpen(v => !v)
  }

  return (
    <div className="border border-surface-3 rounded-xl overflow-hidden">
      <button onClick={handleToggle} className="w-full flex items-center justify-between px-4 py-3 bg-surface-1 hover:bg-surface-2 transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-sm font-medium text-slate-300">AI {moduleLabel} Advisor</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <span className="text-xs text-slate-500">Thinking...</span>}
          {items && !loading && (
            <button
              onClick={e => { e.stopPropagation(); generate(true) }}
              className="text-slate-500 hover:text-accent transition-colors"
              title="Regenerate"
            >
              <RefreshCw size={12} />
            </button>
          )}
          <ChevronDown size={14} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 py-4 bg-surface-1 border-t border-surface-3">
          {loading ? (
            <div className="space-y-2">
              {[90, 75, 85].map((w, i) => (
                <div key={i} className="h-3 rounded bg-surface-2 animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : items && items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{r.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-300">{r.action}</p>
                    <p className="text-xs text-accent mt-0.5">{r.impact}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No recommendations right now — try again in a moment.</p>
          )}
        </div>
      )}
    </div>
  )
}
