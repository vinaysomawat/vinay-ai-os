'use client'

import { useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'

type Row = { date: string; life: number; health: number; finance: number; career: number; learning: number; projects: number }

const LINES = [
  { key: 'life',     label: 'Life',     color: '#7c6af7' },
  { key: 'health',   label: 'Health',   color: '#ef4444' },
  { key: 'finance',  label: 'Finance',  color: '#22c55e' },
  { key: 'career',   label: 'Career',   color: '#f59e0b' },
  { key: 'learning', label: 'Learning', color: '#a855f7' },
  { key: 'projects', label: 'Projects', color: '#06b6d4' },
]

function fmt(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function LifeScoreChart({ data }: { data: Row[] }) {
  const [active, setActive] = useState<string[]>(['life'])

  if (data.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-slate-600">
        Visit daily to build your score history
      </div>
    )
  }

  const toggle = (key: string) =>
    setActive(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  return (
    <div className="space-y-3">
      {/* Legend toggles */}
      <div className="flex flex-wrap gap-2">
        {LINES.map(l => (
          <button key={l.key} onClick={() => toggle(l.key)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${active.includes(l.key) ? 'border-transparent text-white' : 'border-surface-3 text-slate-600 bg-transparent'}`}
            style={active.includes(l.key) ? { backgroundColor: l.color + '25', color: l.color, borderColor: l.color + '40' } : {}}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active.includes(l.key) ? l.color : '#475569' }} />
            {l.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            {LINES.map(l => (
              <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={l.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={l.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#26263a" />
          <XAxis dataKey="date" tickFormatter={fmt} tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#16161d', border: '1px solid #26263a', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(label) => fmt(String(label))}
            formatter={(val, name) => [val, LINES.find(l => l.key === name)?.label ?? name]}
          />
          {LINES.filter(l => active.includes(l.key)).map(l => (
            <Area key={l.key} type="monotone" dataKey={l.key}
              stroke={l.color} strokeWidth={l.key === 'life' ? 2.5 : 1.5}
              fill={`url(#grad-${l.key})`} dot={false} activeDot={{ r: 4 }} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
