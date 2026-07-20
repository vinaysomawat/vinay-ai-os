'use client'

import { useCountUp } from '@/lib/use-count-up'

export default function MiniRing({ score, color }: { score: number; color: string }) {
  const animated = useCountUp(score)
  const r = 16, circ = 2 * Math.PI * r
  const dash = (animated / 100) * circ
  return (
    <div className="relative">
      <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="20" cy="20" r={r} fill="none" stroke="#26263a" strokeWidth="4" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums" style={{ color }}>
        {animated}
      </span>
    </div>
  )
}
