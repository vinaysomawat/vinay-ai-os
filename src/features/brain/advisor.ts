'use server'

import { createClient } from '@/lib/supabase/server'
import { askAI } from '@/lib/ai-gateway'
import { getWeeklyReflectionContext } from './context-builder'
import {
  buildContextSummary, buildBrainPrompt, buildDecisionPrompt, BRAIN_SYSTEM_PROMPT, BRAIN_DECISION_SYSTEM_PROMPT,
  buildWeeklyReflectionContextSummary, buildWeeklyReflectionPrompt, WEEKLY_REFLECTION_SYSTEM_PROMPT,
  type BrainMessage,
} from './prompts'
import type { BrainContext, Decision, WeeklyReflectionContext } from './types'

export async function askBrain(question: string, context: BrainContext, history: BrainMessage[] = []): Promise<string> {
  if (!question.trim()) return "Ask me something about your day, your goals, or a decision you're weighing."

  const contextSummary = buildContextSummary(context)
  const prompt = buildBrainPrompt(contextSummary, history, question)

  return askAI('brain_qa', prompt, BRAIN_SYSTEM_PROMPT)
}

const EMPTY_DECISION: Decision = { decision: '', reasoning: "Couldn't reach a decision — try rephrasing the question.", tradeoffs: [], confidence: 'low', actionItems: [] }

export async function askBrainDecision(question: string, context: BrainContext): Promise<Decision> {
  if (!question.trim()) return EMPTY_DECISION

  const contextSummary = buildContextSummary(context)
  const prompt = buildDecisionPrompt(contextSummary, question)
  const raw = await askAI('brain_decision', prompt, BRAIN_DECISION_SYSTEM_PROMPT)

  try {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return EMPTY_DECISION
    const parsed = JSON.parse(match[0]) as Partial<Decision>
    if (!parsed.decision) return EMPTY_DECISION
    return {
      decision: parsed.decision,
      reasoning: parsed.reasoning ?? '',
      tradeoffs: Array.isArray(parsed.tradeoffs) ? parsed.tradeoffs : [],
      confidence: parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low' ? parsed.confidence : 'medium',
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
    }
  } catch {
    return EMPTY_DECISION
  }
}

export interface WeeklyReflection {
  paragraph: string
  stats: WeeklyReflectionContext | null
}

// Self-contained (unlike askBrain/askBrainDecision above) — the dashboard's
// per-render BrainContext only carries today's snapshot, not 7-day history,
// so this fetches its own context on demand when the Reflect tab is opened
// rather than adding a query to every dashboard load for an occasional feature.
export async function getWeeklyReflection(): Promise<WeeklyReflection> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { paragraph: 'Sign in to see your weekly reflection.', stats: null }

  const stats = await getWeeklyReflectionContext(supabase, user.id)
  if (!stats) {
    return { paragraph: "Not enough data logged this week yet — keep tracking and check back in a few days.", stats: null }
  }

  const contextSummary = buildWeeklyReflectionContextSummary(stats)
  const prompt = buildWeeklyReflectionPrompt(contextSummary)
  const paragraph = await askAI('brain_weekly_reflection', prompt, WEEKLY_REFLECTION_SYSTEM_PROMPT, { userId: user.id })

  return { paragraph, stats }
}
