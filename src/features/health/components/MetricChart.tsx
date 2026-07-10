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

const VIEW_W = 100
const VIEW_H = 40
const PAD_Y = 4

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

  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * VIEW_W,
    y: PAD_Y + (1 - (v - min) / range) * (VIEW_H - PAD_Y * 2),
    date: withValue[i].date,
    v,
  }))
  const linePath = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = `0,${VIEW_H} ${linePath} ${VIEW_W},${VIEW_H}`
  const last = points[points.length - 1]

  return (
    <div>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="w-full h-14" role="img" aria-label={`${label} trend over ${withValue.length} days`}>
        <polygon points={areaPath} className="fill-accent/10" />
        <polyline
          points={linePath}
          fill="none"
          className="stroke-accent"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map(p => (
          <circle key={p.date} cx={p.x} cy={p.y} r={p === last ? 2.5 : 1.5} className={p === last ? 'fill-accent' : 'fill-surface-3'} vectorEffect="non-scaling-stroke">
            <title>{`${new Date(p.date + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}: ${p.v.toFixed(decimals)} ${unit}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {withValue.map(m => (
          <span key={m.date} className="text-xs text-slate-700 hidden sm:block">{new Date(m.date + 'T12:00:00').getDate()}</span>
        ))}
      </div>
      <p className={`text-xs mt-2 font-medium ${trend === 0 ? 'text-slate-500' : trendIsGood ? 'text-green-400' : 'text-red-400'}`}>
        {trend < 0 ? `↓ ${Math.abs(trend).toFixed(decimals)} ${unit}` : trend > 0 ? `↑ ${trend.toFixed(decimals)} ${unit}` : '→ Stable'} over {withValue.length} days
        <span className="text-slate-600 font-normal ml-2">· Latest: {values[values.length - 1].toFixed(decimals)} {unit}</span>
      </p>
    </div>
  )
}
