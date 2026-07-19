'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateTrendingReadingForUser, markTrendingReadingComplete } from './core'
import type { TrendingReading } from './types'

export async function getTodayReading() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return generateTrendingReadingForUser(supabase, user.id)
}

// Unlike getTodayReading (today's row only, lazily created for the "Daily
// Tech Read" card), this pulls the full recent history — including past
// days left unread — so an unfinished reading doesn't silently disappear
// from the Practice Log once its day passes. Mirrors Coding's
// getAssignmentHistory().
export async function getReadingHistory(limit = 30): Promise<TrendingReading[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('trending_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('assigned_date', { ascending: false })
    .limit(limit)
  return (data ?? []) as TrendingReading[]
}

export async function completeReading(id: string) {
  const supabase = await createClient()
  await markTrendingReadingComplete(supabase, id)
  revalidatePath('/coding')
  revalidatePath('/planner')
  revalidatePath('/dashboard')
}
