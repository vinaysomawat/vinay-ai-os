'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Circle, ExternalLink, Flame, Trophy } from 'lucide-react'
import { markQuestionComplete } from '../daily'
import type { DailyQuestion, CodingStats } from '../daily-core'

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-green-400 bg-green-500/15',
  medium: 'text-amber-400 bg-amber-500/15',
  hard: 'text-red-400 bg-red-500/15',
}

interface Props {
  initialAssignment: DailyQuestion[]
  stats: CodingStats
}

export default function DailyCodingCard({ initialAssignment, stats }: Props) {
  const [assignment, setAssignment] = useState(initialAssignment)
  const [isPending, startTransition] = useTransition()

  const handleComplete = (id: string) => {
    setAssignment(prev => prev.map(a => a.id === id ? { ...a, completed: true } : a))
    startTransition(async () => { await markQuestionComplete(id) })
  }

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Today&apos;s Coding Challenge</h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-amber-400"><Flame size={12} /> {stats.currentStreak}d streak</span>
          <span className="flex items-center gap-1 text-slate-500"><Trophy size={12} /> {stats.totalSolved} solved</span>
        </div>
      </div>

      {assignment.length === 0 ? (
        <p className="text-sm text-slate-600 text-center py-6">🧘 No new questions today — revision day. Browse your history below.</p>
      ) : (
        <ul className="space-y-2">
          {assignment.map(a => (
            <li key={a.id} className={`flex items-center gap-3 p-3 rounded-lg border ${a.completed ? 'bg-surface-2/50 border-surface-3' : 'bg-surface-2 border-surface-3'}`}>
              <button onClick={() => !a.completed && handleComplete(a.id)} disabled={a.completed || isPending} className="shrink-0">
                {a.completed ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} className="text-slate-600 hover:text-accent transition-colors" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${a.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{a.question.title}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${DIFFICULTY_COLOR[a.question.difficulty]}`}>{a.question.difficulty}</span>
              <a href={a.question.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-slate-500 hover:text-accent transition-colors">
                <ExternalLink size={14} />
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-surface-3">
        <div className="text-center">
          <p className="text-lg font-bold text-green-400">{stats.easySolved}</p>
          <p className="text-xs text-slate-600">Easy</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-amber-400">{stats.mediumSolved}</p>
          <p className="text-xs text-slate-600">Medium</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-400">{stats.hardSolved}</p>
          <p className="text-xs text-slate-600">Hard</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white">{stats.completionRate}%</p>
          <p className="text-xs text-slate-600">Completion</p>
        </div>
      </div>
    </div>
  )
}
