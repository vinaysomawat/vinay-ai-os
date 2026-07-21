'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { todayIST, daysAgoIST } from '@/lib/date'

export interface ChangeItem {
  emoji: string
  text: string
  href: string
}

// Daily Operating System's "What's Changed" (Phase 5 PRD) — pure deterministic
// day-over-day deltas, no AI. Self-contained (creates its own supabase client)
// since none of this is part of getDashboardData()'s existing aggregate.
export async function getWhatsChanged(supabase: SupabaseClient, userId: string): Promise<ChangeItem[]> {
  const today = todayIST()
  const yesterday = daysAgoIST(1)

  const [{ data: metrics }, { data: todayExpenses }, { data: todayWorkouts }, { data: todayApps }, { data: scores }] = await Promise.all([
    supabase.from('health_metrics').select('date, weight_kg').eq('user_id', userId).in('date', [today, yesterday]),
    supabase.from('expenses').select('amount').eq('user_id', userId).eq('date', today),
    supabase.from('workouts').select('id').eq('user_id', userId).eq('date', today),
    supabase.from('applications').select('id').eq('user_id', userId).eq('applied_at', today),
    supabase.from('life_score_logs').select('life_score').eq('user_id', userId).order('date', { ascending: false }).limit(2),
  ])

  const items: ChangeItem[] = []

  const weightRows = (metrics ?? []) as { date: string; weight_kg: number | null }[]
  const todayWeight = weightRows.find(r => r.date === today)?.weight_kg
  const yesterdayWeight = weightRows.find(r => r.date === yesterday)?.weight_kg
  if (todayWeight != null && yesterdayWeight != null) {
    const delta = todayWeight - yesterdayWeight
    if (delta !== 0) {
      items.push({ emoji: delta < 0 ? '↓' : '↑', text: `Weight ${delta > 0 ? '+' : ''}${delta.toFixed(1)}kg`, href: '/health' })
    }
  }

  const todayExpenseTotal = (todayExpenses ?? []).reduce((s, e) => s + Number(e.amount ?? 0), 0)
  if (todayExpenseTotal > 0) {
    items.push({ emoji: '💸', text: `Expense logged: ₹${Math.round(todayExpenseTotal).toLocaleString('en-IN')}`, href: '/finance' })
  }

  if ((todayWorkouts ?? []).length > 0) {
    items.push({ emoji: '🏋️', text: 'Workout completed', href: '/health' })
  }

  if ((todayApps ?? []).length > 0) {
    items.push({ emoji: '💼', text: `${(todayApps ?? []).length} new application${(todayApps ?? []).length > 1 ? 's' : ''} added`, href: '/career' })
  }

  const scoreRows = scores ?? []
  if (scoreRows.length === 2) {
    const delta = scoreRows[0].life_score - scoreRows[1].life_score
    if (delta !== 0) {
      items.push({ emoji: delta > 0 ? '↑' : '↓', text: `Life Score ${delta > 0 ? '+' : ''}${delta}`, href: '/dashboard' })
    }
  }

  return items
}
