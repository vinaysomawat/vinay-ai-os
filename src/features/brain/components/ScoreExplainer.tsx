'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useEscapeKey } from '@/lib/use-escape-key'
import ScoreHero from '@/features/dashboard/components/ScoreHero'
import type { ScoreExplanationResult } from '../types'

export default function ScoreExplainer({ score, result }: { score: number; result: ScoreExplanationResult }) {
  const [open, setOpen] = useState(false)
  useEscapeKey(() => setOpen(false))

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Explain my Life Score" className="cursor-pointer">
        <ScoreHero score={score} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="bg-surface-1 border border-surface-3 rounded-xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-200">Explain My Score</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-white tabular-nums">{result.life.score}</span>
              <span className="text-xs text-slate-500">/100</span>
              {result.life.delta !== null && (
                <span className={`ml-auto text-sm font-medium ${result.life.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.life.delta > 0 ? '+' : ''}{result.life.delta} vs yesterday
                </span>
              )}
            </div>

            <ul className="space-y-3">
              {result.modules.map(m => (
                <li key={m.module} className="flex items-start justify-between gap-3 pb-3 border-b border-surface-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200">{m.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.tip}</p>
                  </div>
                  <span className={`shrink-0 text-sm font-bold tabular-nums ${
                    m.delta === null || m.delta === 0 ? 'text-slate-500' : m.delta > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {m.delta === null ? m.score : `${m.delta > 0 ? '+' : ''}${m.delta}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
