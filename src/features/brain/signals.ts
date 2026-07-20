import type { SupabaseClient } from '@supabase/supabase-js'
import { daysAgoIST, todayIST } from '@/lib/date'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Deterministic pattern checks only (Product Principle 2) — each returns a
// plain-English sentence when a clear pattern exists in the underlying data,
// or null when there isn't enough signal yet. AI is never used to compute
// these, only (elsewhere) to narrate them in a weekly reflection.

async function detectWorkoutDayPattern(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const since = daysAgoIST(90)
  const { data } = await supabase.from('workouts').select('date').eq('user_id', userId).gte('date', since)
  const rows = (data ?? []) as { date: string }[]
  if (rows.length < 4) return null

  const counts = new Array(7).fill(0)
  for (const r of rows) counts[new Date(`${r.date}T00:00:00Z`).getUTCDay()]++

  const total = rows.length
  const maxCount = Math.max(...counts)
  const topDay = counts.indexOf(maxCount)
  if (maxCount >= 3 && maxCount / total >= 0.4) {
    return `You work out mostly on ${DAY_NAMES[topDay]}s (${maxCount} of your last ${total} workouts)`
  }
  return null
}

async function detectProteinWeekendDrop(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const since = daysAgoIST(30)
  const { data } = await supabase
    .from('health_metrics').select('date, protein_g')
    .eq('user_id', userId).gte('date', since).not('protein_g', 'is', null)
  const rows = (data ?? []) as { date: string; protein_g: number }[]
  if (rows.length < 8) return null

  const isWeekend = (d: string) => [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay())
  const weekday = rows.filter(r => !isWeekend(r.date))
  const weekend = rows.filter(r => isWeekend(r.date))
  if (weekday.length < 4 || weekend.length < 2) return null

  const avg = (arr: typeof rows) => arr.reduce((s, r) => s + r.protein_g, 0) / arr.length
  const weekdayAvg = avg(weekday)
  const weekendAvg = avg(weekend)
  if (weekdayAvg > 0 && weekendAvg < weekdayAvg * 0.75) {
    return `Your protein intake drops on weekends — ~${Math.round(weekendAvg)}g vs ~${Math.round(weekdayAvg)}g on weekdays`
  }
  return null
}

// Runs weekly (piggybacks on the existing weekly-digest cron rather than a
// new job). Patterns accumulate: re-detecting the same sentence bumps
// times_confirmed and last_seen on the existing row instead of duplicating —
// per the PRD's "patterns should accumulate over time," not reset each run.
export async function detectPatterns(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const results = await Promise.all([
    detectWorkoutDayPattern(supabase, userId),
    detectProteinWeekendDrop(supabase, userId),
  ])
  const patterns = results.filter((p): p is string => p !== null)

  for (const pattern of patterns) {
    const { data: existing } = await supabase
      .from('brain_patterns').select('times_confirmed')
      .eq('user_id', userId).eq('pattern', pattern).maybeSingle()

    await supabase.from('brain_patterns').upsert(
      { user_id: userId, pattern, last_seen: todayIST(), times_confirmed: (existing?.times_confirmed ?? 0) + 1 },
      { onConflict: 'user_id,pattern' }
    )
  }

  return patterns
}

// Feeds Ask Brain's context — recent, repeatedly-confirmed patterns only
// (times_confirmed > 1 means it's shown up on more than one weekly run, not
// a one-off), so a fluke doesn't get presented as an established pattern.
export async function getRecentPatterns(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const since = daysAgoIST(30)
  const { data } = await supabase
    .from('brain_patterns').select('pattern, times_confirmed')
    .eq('user_id', userId).gte('last_seen', since).gt('times_confirmed', 1)
    .order('times_confirmed', { ascending: false }).limit(5)
  return (data ?? []).map(r => r.pattern as string)
}
