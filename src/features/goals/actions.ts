'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { computeCodingStats } from '@/features/coding/daily-core'
import type { Goal, GoalModule, AutoMetric, ResolvedGoal } from './types'

const MODULE_PATH: Record<GoalModule, string> = { career: '/career', learning: '/learning', coding: '/coding' }

// Resolves live progress for auto-computed goals (Product Principle 2: no
// AI, pure reuse of each module's existing data) rather than trusting the
// stored current_value column, which would go stale between visits.
export async function resolveAutoMetric(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, metric: AutoMetric): Promise<number> {
  if (metric === 'coding_streak') {
    const stats = await computeCodingStats(supabase, userId)
    return stats.currentStreak
  }
  const { count } = await supabase
    .from('resources').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('type', 'book').eq('status', 'completed')
  return count ?? 0
}

export async function getGoals(module: GoalModule): Promise<ResolvedGoal[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).eq('module', module).order('created_at', { ascending: true })
  const goals = (data ?? []) as Goal[]

  return Promise.all(goals.map(async g => ({
    ...g,
    resolvedCurrentValue: g.auto_metric ? await resolveAutoMetric(supabase, user.id, g.auto_metric) : g.current_value,
  })))
}

export async function addGoal(module: GoalModule, name: string, targetValue: number | null, autoMetric: AutoMetric | null, targetDate: string | null): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('goals').insert({
    user_id: user.id, module, name, target_value: targetValue, auto_metric: autoMetric, target_date: targetDate,
    current_value: autoMetric ? null : 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath(MODULE_PATH[module])
}

export async function updateGoalProgress(id: string, module: GoalModule, currentValue: number): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').update({ current_value: currentValue }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(MODULE_PATH[module])
}

// Qualitative goals (no target/current value) toggle achieved_at instead —
// there's no metric to show a percentage of, so this is the only "progress"
// they have.
export async function toggleGoalAchieved(id: string, module: GoalModule, achieved: boolean): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').update({ achieved_at: achieved ? new Date().toISOString() : null }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(MODULE_PATH[module])
}

export async function deleteGoal(id: string, module: GoalModule): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(MODULE_PATH[module])
}
