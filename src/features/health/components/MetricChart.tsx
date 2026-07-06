'use client'

import type { HealthMetric, MetricField } from '../types'

interface Props {
  metrics: HealthMetric[]
  field: MetricField
  label: string
  unit: string
  decimals?: number
  lowerIsBetter?: boolean
}

export default function MetricChart({ metrics, field, label, unit, decimals = 0, lowerIsBetter = false }: Props) {
  const withValue = [...metrics]
    .filter(m => m[field] !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)

  if (withValue.length < 2) return (
    <p className="text-xs text-slate-600 py-2">Log {label.toLowerCase()} on 2+ days to see trend</p>
  )

  const values = withValue.map(m => m[field] as number)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 0.1
  const trend = values[values.length - 1] - values[0]
  const trendIsGood = lowerIsBetter ? trend < 0 : trend > 0

  return (
    <div>
      <div className="flex items-end gap-1 h-14">
        {withValue.map((m, i) => {
          const v = m[field] as number
          const h = Math.round(((v - min) / range) * 44 + 4)
          const isLatest = i === withValue.length - 1
          return (
            <div key={m.date} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div className={`w-full rounded-sm transition-all ${isLatest ? 'bg-accent' : 'bg-surface-3'}`} style={{ height: `${h}px` }} />
              <span className="text-xs text-slate-700 hidden sm:block">{new Date(m.date + 'T12:00:00').getDate()}</span>
            </div>
          )
        })}
      </div>
      <p className={`text-xs mt-2 font-medium ${trend === 0 ? 'text-slate-500' : trendIsGood ? 'text-green-400' : 'text-red-400'}`}>
        {trend < 0 ? `↓ ${Math.abs(trend).toFixed(decimals)} ${unit}` : trend > 0 ? `↑ ${trend.toFixed(decimals)} ${unit}` : '→ Stable'} over {withValue.length} days
        <span className="text-slate-600 font-normal ml-2">· Latest: {values[values.length - 1].toFixed(decimals)} {unit}</span>
      </p>
    </div>
  )
}
