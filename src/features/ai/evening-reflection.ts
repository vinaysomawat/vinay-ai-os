'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { askAI } from '@/lib/ai-gateway'
import { todayIST } from '@/lib/date'
import { gatherTodayActivityLines } from './daily-journal'

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 }

const SYSTEM_PROMPT = `You are writing Vinay's Evening Reflection — a same-evening "how did today go" summary from his actual logged activity, ending with tomorrow's top priority.

Rules:
- Write exactly ONE paragraph, under 200 words, plain prose — no markdown, no headings, no bullet lists.
- Cover what got done today and how it went, using only the facts given below. Never invent an event, number, or detail that isn't in the data.
- If very little was logged today, say so plainly rather than padding it out.
- End with one sentence naming tomorrow's top priority, using only the priority item given below — never invent one.`

// Daily Operating System's "Evening Reflection" (Phase 5 PRD) — a separate
// live section from Daily Auto Journal's 11pm cron (different purpose: this
// is a same-evening check visible from 6pm on, that one's an end-of-day
// recap that needs to run after even a late-night session). Reuses the same
// activity-gathering as the journal rather than duplicating those queries.
export async function generateEveningReflection(db: SupabaseClient, userId: string): Promise<string> {
  const today = todayIST()

  const [lines, { data: pendingTasks }] = await Promise.all([
    gatherTodayActivityLines(db, userId),
    db.from('tasks').select('text, priority, due_date').eq('user_id', userId).eq('done', false),
  ])

  const tasks = (pendingTasks ?? []) as { text: string; priority: string; due_date: string | null }[]
  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = !!a.due_date && a.due_date < today
    const bOverdue = !!b.due_date && b.due_date < today
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
    return (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3)
  })
  const topTask = sorted[0]
  const priorityLine = topTask
    ? `Tomorrow's top priority: "${topTask.text}"${topTask.due_date && topTask.due_date < today ? ' (overdue)' : ''}`
    : 'No pending tasks to prioritize for tomorrow.'

  if (lines.length === 1 && !topTask) {
    return "Not much was logged today, and there's nothing pending for tomorrow either — a genuinely quiet day."
  }

  const prompt = `Today's logged activity:\n${lines.join('\n')}\n\n${priorityLine}\n\nWrite Vinay's Evening Reflection.`
  return askAI('evening_reflection', prompt, SYSTEM_PROMPT, { userId })
}
