'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Plus, Trash2, X, Flame } from 'lucide-react'
import Card from '@/components/Card'
import { addHabit, logHabit, unlogHabit, deleteHabit } from '../actions'
import type { HabitWithLogs } from '../types'

const ICONS = ['🏋️', '💧', '😴', '🧘', '📚', '🏃', '🥗', '💊', '🚴', '✍️']

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function getStreak(logs: { date: string }[]): number {
  const dates = new Set(logs.map(l => l.date))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dates.has(d.toISOString().split('T')[0])) streak++
    else break
  }
  return streak
}

interface Props {
  initialHabits: HabitWithLogs[]
}

export default function HealthView({ initialHabits }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('🏋️')
  const [isPending, startTransition] = useTransition()
  const days = getLast7Days()
  const today = days[6]

  const [habits, updateHabits] = useOptimistic(
    initialHabits,
    (state: HabitWithLogs[], action: { type: string; payload: Record<string, string> }) => {
      if (action.type === 'add') {
        return [...state, { id: `temp-${Date.now()}`, user_id: '', name: action.payload.name, icon: action.payload.icon, created_at: new Date().toISOString(), logs: [] }]
      }
      if (action.type === 'log') {
        return state.map(h => h.id === action.payload.habitId
          ? { ...h, logs: [...h.logs, { id: `temp-log-${Date.now()}`, user_id: '', habit_id: action.payload.habitId, date: action.payload.date, created_at: new Date().toISOString() }] }
          : h)
      }
      if (action.type === 'unlog') {
        return state.map(h => h.id === action.payload.habitId
          ? { ...h, logs: h.logs.filter(l => l.date !== action.payload.date) }
          : h)
      }
      if (action.type === 'delete') {
        return state.filter(h => h.id !== action.payload.id)
      }
      return state
    }
  )

  const handleAdd = () => {
    if (!newName.trim()) return
    const name = newName.trim()
    const icon = newIcon
    setNewName('')
    setShowForm(false)
    startTransition(async () => {
      updateHabits({ type: 'add', payload: { name, icon } })
      await addHabit(name, icon)
    })
  }

  const handleToggle = (habitId: string, date: string, logged: boolean) => {
    startTransition(async () => {
      if (logged) {
        updateHabits({ type: 'unlog', payload: { habitId, date } })
        await unlogHabit(habitId, date)
      } else {
        updateHabits({ type: 'log', payload: { habitId, date } })
        await logHabit(habitId, date)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      updateHabits({ type: 'delete', payload: { id } })
      await deleteHabit(id)
    })
  }

  const completedToday = habits.filter(h => h.logs.some(l => l.date === today)).length

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-accent">{completedToday}</span>
          <span className="text-xs text-slate-500 mt-1">Done today</span>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-slate-200">{habits.length}</span>
          <span className="text-xs text-slate-500 mt-1">Total habits</span>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-amber-400">
            {habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.logs))) : 0}
          </span>
          <span className="text-xs text-slate-500 mt-1">Best streak</span>
        </div>
      </div>

      {/* Habit tracker grid */}
      <Card
        title="Weekly Habits"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/80 transition-colors"
          >
            <Plus size={12} /> Add habit
          </button>
        }
      >
        {/* Day headers */}
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '1fr repeat(7, 2rem)' }}>
          <span className="text-xs text-slate-600">Habit</span>
          {days.map(d => {
            const isToday = d === today
            const label = new Date(d + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1)
            return (
              <span key={d} className={`text-xs text-center font-medium ${isToday ? 'text-accent' : 'text-slate-600'}`}>
                {label}
              </span>
            )
          })}
          <span />
        </div>

        {habits.length === 0 && (
          <p className="text-sm text-slate-600 text-center py-8">No habits yet — add one above</p>
        )}

        <ul className="space-y-2">
          {habits.map(habit => {
            const streak = getStreak(habit.logs)
            return (
              <li key={habit.id} className="grid items-center gap-2 group" style={{ gridTemplateColumns: '1fr repeat(7, 2rem) 1.5rem' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{habit.icon}</span>
                  <span className="text-sm text-slate-300 truncate">{habit.name}</span>
                  {streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-400 shrink-0">
                      <Flame size={10} />{streak}
                    </span>
                  )}
                </div>
                {days.map(date => {
                  const logged = habit.logs.some(l => l.date === date)
                  const isToday = date === today
                  return (
                    <button
                      key={date}
                      onClick={() => handleToggle(habit.id, date, logged)}
                      disabled={isPending}
                      className={`w-8 h-8 rounded-lg border transition-colors ${
                        logged
                          ? 'bg-accent border-accent text-white'
                          : isToday
                          ? 'bg-surface-2 border-accent/30 hover:border-accent/60'
                          : 'bg-surface-2 border-surface-3 hover:border-slate-500'
                      }`}
                    >
                      {logged && <span className="text-xs">✓</span>}
                    </button>
                  )
                })}
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Add habit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-1 border border-surface-3 rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-200">New Habit</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="Morning workout"
                  autoFocus
                  className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewIcon(icon)}
                      className={`w-9 h-9 rounded-lg text-lg border transition-colors ${
                        newIcon === icon ? 'bg-accent/20 border-accent' : 'bg-surface-2 border-surface-3 hover:border-slate-500'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-surface-2 border border-surface-3 text-slate-300 text-sm hover:bg-surface-3 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={!newName.trim()} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 disabled:opacity-50 transition-colors">
                  Add Habit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
