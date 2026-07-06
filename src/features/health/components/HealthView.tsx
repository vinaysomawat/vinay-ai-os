'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { Plus, Trash2, X, Flame, Sparkles, ChevronDown, Settings2 } from 'lucide-react'
import Card from '@/components/Card'
import { addHabit, logHabit, unlogHabit, deleteHabit, upsertTodayMetric } from '../actions'
import { getHealthReport } from '@/features/ai/health-report'
import { calculateBMR, calculateTDEE, calculateWeightLossPlan, calculateHealthScore } from '../calculations'
import HealthProfileForm from './HealthProfileForm'
import HealthScoreHero from './HealthScoreHero'
import TodaysPlanCard from './TodaysPlanCard'
import MetricChart from './MetricChart'
import type { HabitWithLogs, HealthMetric, MetricField, HealthProfile } from '../types'

const ICONS = ['🏋️', '💧', '😴', '🧘', '📚', '🏃', '🥗', '💊', '🚴', '✍️']

const METRICS: { field: MetricField; label: string; emoji: string; unit: string; decimals?: number }[] = [
  { field: 'weight_kg',    label: 'Weight',   emoji: '⚖️',  unit: 'kg',   decimals: 1 },
  { field: 'calories',     label: 'Calories', emoji: '🔥',  unit: 'kcal' },
  { field: 'protein_g',    label: 'Protein',  emoji: '🥩',  unit: 'g' },
  { field: 'sleep_hours',  label: 'Sleep',    emoji: '😴',  unit: 'hrs',  decimals: 1 },
  { field: 'steps',        label: 'Steps',    emoji: '👟',  unit: 'steps' },
  { field: 'water_ml',     label: 'Water',    emoji: '💧',  unit: 'ml' },
]

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

function MetricCard({ field, label, emoji, unit, decimals = 0, todayValue, weekAvg, onSave, saving, leftText }: {
  field: MetricField; label: string; emoji: string; unit: string; decimals?: number
  todayValue: number | null; weekAvg: number | null; onSave: (v: number) => void; saving: boolean
  leftText?: string | null
}) {
  const [input, setInput] = useState(todayValue !== null ? String(todayValue) : '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const v = parseFloat(input)
    if (isNaN(v) || v <= 0) return
    if (v === todayValue) return
    onSave(v)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col gap-2 hover:border-surface-3/80 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-lg">{emoji}</span>
        {saved && <span className="text-xs text-green-400">✓</span>}
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            onBlur={handleSave}
            placeholder="—"
            disabled={saving}
            className="text-xl font-bold text-white bg-transparent outline-none w-full placeholder-slate-700"
          />
          <span className="text-xs text-slate-600 shrink-0">{unit}</span>
        </div>
      </div>
      <p className="text-xs text-slate-700">7d avg: {weekAvg !== null ? weekAvg.toFixed(decimals) : '—'}</p>
      {leftText && <p className="text-xs text-accent font-medium">{leftText}</p>}
    </div>
  )
}

interface Props {
  initialHabits: HabitWithLogs[]
  initialMetrics: HealthMetric[]
  initialProfile: HealthProfile | null
}

export default function HealthView({ initialHabits, initialMetrics, initialProfile }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('🏋️')
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState<MetricField | null>(null)
  const [metrics, setMetrics] = useState<HealthMetric[]>(initialMetrics)
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [profile, setProfile] = useState<HealthProfile | null>(initialProfile)
  const [showProfileForm, setShowProfileForm] = useState(false)

  const days = getLast7Days()
  const today = days[6]

  const todayMetric = metrics.find(m => m.date === today) ?? null
  const week = metrics.filter(m => days.includes(m.date))

  const weekAvg = (field: MetricField): number | null => {
    const vals = week.map(m => m[field]).filter((v): v is number => v !== null)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null
  }

  const latestWeight = todayMetric?.weight_kg
    ?? [...metrics].filter(m => m.weight_kg !== null).sort((a, b) => b.date.localeCompare(a.date))[0]?.weight_kg
    ?? null

  const canCalculate = !!profile && profile.age && profile.gender && profile.height_cm && profile.target_weight_kg && profile.activity_level && latestWeight
  const weightLossPlan = canCalculate
    ? calculateWeightLossPlan(
        latestWeight!,
        profile!.target_weight_kg!,
        calculateTDEE(calculateBMR(latestWeight!, profile!.height_cm!, profile!.age!, profile!.gender!), profile!.activity_level!),
        profile!.goal_deadline
      )
    : null

  const handleMetricSave = (field: MetricField, value: number) => {
    setSaving(field)
    setMetrics(prev => {
      const existing = prev.find(m => m.date === today)
      if (existing) return prev.map(m => m.date === today ? { ...m, [field]: value } : m)
      return [{ id: `temp`, user_id: '', date: today, weight_kg: null, calories: null, protein_g: null, sleep_hours: null, steps: null, water_ml: null, notes: null, created_at: new Date().toISOString(), [field]: value }, ...prev]
    })
    upsertTodayMetric(field, value).finally(() => setSaving(null))
  }

  const handleAIReport = async () => {
    if (aiLoading) return
    if (showAI && aiReport) { setShowAI(false); return }
    setShowAI(true)
    setAiLoading(true)
    try {
      const report = await getHealthReport(metrics)
      setAiReport(report)
    } finally {
      setAiLoading(false)
    }
  }

  const [habits, updateHabits] = useOptimistic(
    initialHabits,
    (state: HabitWithLogs[], action: { type: string; payload: Record<string, string> }) => {
      if (action.type === 'add') return [...state, { id: `temp-${Date.now()}`, user_id: '', name: action.payload.name, icon: action.payload.icon, created_at: new Date().toISOString(), logs: [] }]
      if (action.type === 'log') return state.map(h => h.id === action.payload.habitId ? { ...h, logs: [...h.logs, { id: `temp-log`, user_id: '', habit_id: action.payload.habitId, date: action.payload.date, created_at: new Date().toISOString() }] } : h)
      if (action.type === 'unlog') return state.map(h => h.id === action.payload.habitId ? { ...h, logs: h.logs.filter(l => l.date !== action.payload.date) } : h)
      if (action.type === 'delete') return state.filter(h => h.id !== action.payload.id)
      return state
    }
  )

  const handleAdd = () => {
    if (!newName.trim()) return
    const name = newName.trim(); const icon = newIcon
    setNewName(''); setShowForm(false)
    startTransition(async () => { updateHabits({ type: 'add', payload: { name, icon } }); await addHabit(name, icon) })
  }

  const handleToggle = (habitId: string, date: string, logged: boolean) => {
    startTransition(async () => {
      if (logged) { updateHabits({ type: 'unlog', payload: { habitId, date } }); await unlogHabit(habitId, date) }
      else { updateHabits({ type: 'log', payload: { habitId, date } }); await logHabit(habitId, date) }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => { updateHabits({ type: 'delete', payload: { id } }); await deleteHabit(id) })
  }

  const completedToday = habits.filter(h => h.logs.some(l => l.date === today)).length
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.logs))) : 0

  const healthScore = weightLossPlan
    ? calculateHealthScore(
        todayMetric,
        { calories: weightLossPlan.dailyCalorieTarget, protein: weightLossPlan.proteinTargetG, steps: 10000 },
        habits,
        today
      )
    : null

  const leftText = (field: MetricField): string | null => {
    if (!weightLossPlan) return null
    const value = todayMetric?.[field]
    if (field === 'calories') return `${Math.max(0, weightLossPlan.dailyCalorieTarget - (value ?? 0))} kcal left of ${weightLossPlan.dailyCalorieTarget}`
    if (field === 'protein_g') return `${Math.max(0, weightLossPlan.proteinTargetG - (value ?? 0))}g left of ${weightLossPlan.proteinTargetG}g`
    if (field === 'water_ml') return `${Math.max(0, 3000 - (value ?? 0))}ml left of 3000ml`
    if (field === 'steps') return `${Math.max(0, 10000 - (value ?? 0))} steps left of 10,000`
    return null
  }

  return (
    <div className="space-y-5">
      {/* Health profile setup / edit */}
      {!profile ? (
        <div className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/30 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-200">Set up your Health Profile</p>
            <p className="text-xs text-slate-500 mt-1">One-time setup unlocks your calorie targets, macros, and a real Health Score.</p>
          </div>
          <button onClick={() => setShowProfileForm(true)} className="shrink-0 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors">
            Set up
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <Settings2 size={12} /> Edit health profile
          </button>
        </div>
      )}

      {showProfileForm && (
        <HealthProfileForm
          profile={profile}
          onClose={() => setShowProfileForm(false)}
          onSaved={p => { setProfile(p); setShowProfileForm(false) }}
        />
      )}

      {/* Health Score + Today's Plan */}
      {profile && weightLossPlan && healthScore && (
        <>
          <HealthScoreHero score={healthScore} />
          <TodaysPlanCard profile={profile} plan={weightLossPlan} todayMetric={todayMetric} habits={habits} score={healthScore} today={today} />
          <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-white">{weightLossPlan.dailyCalorieTarget}</p>
              <p className="text-xs text-slate-500">kcal target</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{weightLossPlan.proteinTargetG}g</p>
              <p className="text-xs text-slate-500">protein target</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{weightLossPlan.weeklyLossKg}kg</p>
              <p className="text-xs text-slate-500">per week</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{weightLossPlan.daysRemaining}d</p>
              <p className="text-xs text-slate-500">to {profile.target_weight_kg}kg ({weightLossPlan.expectedGoalDate})</p>
            </div>
          </div>
        </>
      )}

      {profile && !weightLossPlan && (
        <p className="text-xs text-slate-600 -mt-2">Log today&apos;s weight below to unlock your calorie targets and Health Score.</p>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-accent">{completedToday}/{habits.length}</span>
          <span className="text-xs text-slate-500 mt-1">Habits today</span>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-slate-200">{todayMetric?.weight_kg ?? '—'}</span>
          <span className="text-xs text-slate-500 mt-1">Weight (kg)</span>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-amber-400">{bestStreak}</span>
          <span className="text-xs text-slate-500 mt-1">Best streak</span>
        </div>
      </div>

      {/* Today's metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">Today&apos;s Metrics</h3>
          <span className="text-xs text-slate-600">Press Enter to save</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {METRICS.map(m => (
            <MetricCard
              key={m.field}
              {...m}
              todayValue={todayMetric?.[m.field] ?? null}
              weekAvg={weekAvg(m.field)}
              onSave={v => handleMetricSave(m.field, v)}
              saving={saving === m.field}
              leftText={leftText(m.field)}
            />
          ))}
        </div>
      </div>

      {/* Weight trend */}
      <Card title="Weight Trend">
        <MetricChart metrics={metrics} field="weight_kg" label="Weight" unit="kg" decimals={1} lowerIsBetter />
      </Card>

      {/* Progress */}
      <Card title="Progress">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-slate-500 mb-2">Calories</p>
            <MetricChart metrics={metrics} field="calories" label="Calories" unit="kcal" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Protein</p>
            <MetricChart metrics={metrics} field="protein_g" label="Protein" unit="g" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Sleep</p>
            <MetricChart metrics={metrics} field="sleep_hours" label="Sleep" unit="hrs" decimals={1} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2">Steps</p>
            <MetricChart metrics={metrics} field="steps" label="Steps" unit="steps" />
          </div>
        </div>
      </Card>

      {/* AI Health Coach */}
      <div className="border border-surface-3 rounded-xl overflow-hidden">
        <button onClick={handleAIReport} className="w-full flex items-center justify-between px-4 py-3 bg-surface-1 hover:bg-surface-2 transition-colors">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span className="text-sm font-medium text-slate-300">AI Weekly Health Report</span>
          </div>
          <div className="flex items-center gap-2">
            {aiLoading && <span className="text-xs text-slate-500">Analysing...</span>}
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${showAI ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {showAI && (
          <div className="px-4 py-4 bg-surface-1 border-t border-surface-3">
            {aiLoading ? (
              <div className="space-y-2">
                {[90, 70, 80, 60, 85].map((w, i) => (
                  <div key={i} className="h-3 rounded bg-surface-2 animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : aiReport ? (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{aiReport}</p>
            ) : null}
          </div>
        )}
      </div>

      {/* Habit tracker */}
      <Card title="Weekly Habits" action={
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/80 transition-colors">
          <Plus size={12} /> Add habit
        </button>
      }>
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '1fr repeat(7, 2rem)' }}>
          <span className="text-xs text-slate-600">Habit</span>
          {days.map(d => (
            <span key={d} className={`text-xs text-center font-medium ${d === today ? 'text-accent' : 'text-slate-600'}`}>
              {new Date(d + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }).slice(0, 1)}
            </span>
          ))}
          <span />
        </div>

        {habits.length === 0 && <p className="text-sm text-slate-600 text-center py-8">No habits yet — add one above</p>}

        <ul className="space-y-2">
          {habits.map(habit => {
            const streak = getStreak(habit.logs)
            return (
              <li key={habit.id} className="grid items-center gap-2 group" style={{ gridTemplateColumns: '1fr repeat(7, 2rem) 1.5rem' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{habit.icon}</span>
                  <span className="text-sm text-slate-300 truncate">{habit.name}</span>
                  {streak > 0 && <span className="flex items-center gap-0.5 text-xs text-amber-400 shrink-0"><Flame size={10} />{streak}</span>}
                </div>
                {days.map(date => {
                  const logged = habit.logs.some(l => l.date === date)
                  return (
                    <button key={date} onClick={() => handleToggle(habit.id, date, logged)} disabled={isPending}
                      className={`w-8 h-8 rounded-lg border transition-colors ${logged ? 'bg-accent border-accent text-white' : date === today ? 'bg-surface-2 border-accent/30 hover:border-accent/60' : 'bg-surface-2 border-surface-3 hover:border-slate-500'}`}>
                      {logged && <span className="text-xs">✓</span>}
                    </button>
                  )
                })}
                <button onClick={() => handleDelete(habit.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
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
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Morning workout" autoFocus
                  className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-accent transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setNewIcon(icon)}
                      className={`w-9 h-9 rounded-lg text-lg border transition-colors ${newIcon === icon ? 'bg-accent/20 border-accent' : 'bg-surface-2 border-surface-3 hover:border-slate-500'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg bg-surface-2 border border-surface-3 text-slate-300 text-sm hover:bg-surface-3 transition-colors">Cancel</button>
                <button onClick={handleAdd} disabled={!newName.trim()} className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 disabled:opacity-50 transition-colors">Add Habit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
