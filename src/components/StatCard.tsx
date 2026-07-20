import { type ReactNode } from 'react'

interface StatCardProps {
  value: ReactNode
  label: string
  valueClassName?: string
  icon?: ReactNode
}

export default function StatCard({ value, label, valueClassName = 'text-slate-200', icon }: StatCardProps) {
  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-3 flex flex-col items-center">
      <div className="flex items-center gap-1">
        {icon}
        <span className={`text-2xl font-bold ${valueClassName}`}>{value}</span>
      </div>
      <span className="text-xs text-slate-500 mt-0.5">{label}</span>
    </div>
  )
}
