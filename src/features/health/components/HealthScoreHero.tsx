'use client'

import { Settings2 } from 'lucide-react'
import type { HealthScoreBreakdown } from '../calculations'

function MiniRing({ score, color }: { score: number; color: string }) {
  const r = 20, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#26263a" strokeWidth="5" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round" />
    </svg>
  )
}

const SUB_SCORES: { key: keyof Omit<HealthScoreBreakdown, 'overall'>; label: string; color: string }[] = [
  { key: 'nutrition',   label: 'Nutrition',   color: '#22c55e' },
  { key: 'activity',    label: 'Activity',    color: '#06b6d4' },
]

export default function HealthScoreHero({ score, onEditProfile }: { score: HealthScoreBreakdown; onEditProfile?: () => void }) {
  const r = 48, circ = 2 * Math.PI * r
  const dash = (score.overall / 100) * circ

  const level =
    score.overall >= 85 ? 'Excellent' :
    score.overall >= 65 ? 'Good' :
    score.overall >= 40 ? 'Needs Work' : 'Getting Started'

  const levelColor =
    score.overall >= 65 ? 'text-green-400' :
    score.overall >= 40 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5 relative">
      {onEditProfile && (
        <button onClick={onEditProfile} className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          <Settings2 size={12} /> Edit health profile
        </button>
      )}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <svg viewBox="0 0 120 120" className="w-28 h-28" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r={r} fill="none" stroke="#26263a" strokeWidth="8" />
            <circle cx="60" cy="60" r={r} fill="none" stroke="url(#healthGrad)" strokeWidth="8"
              strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round" />
            <defs>
              <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white tabular-nums">{score.overall}</span>
            <span className="text-[10px] text-slate-500">/100</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <p className={`text-sm font-bold mb-3 ${levelColor}`}>{level}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUB_SCORES.map(({ key, label, color }) => {
              const s = score[key]
              return (
                <div key={key} className="flex items-center gap-2">
                  <MiniRing score={s.score} color={color} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300">{label}</p>
                    <p className="text-[11px] text-slate-600 truncate" title={s.reason}>{s.reason}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
