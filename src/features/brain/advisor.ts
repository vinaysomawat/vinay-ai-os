'use server'

import { askAI } from '@/lib/ai-gateway'
import { buildContextSummary, buildBrainPrompt, buildDecisionPrompt, BRAIN_SYSTEM_PROMPT, BRAIN_DECISION_SYSTEM_PROMPT, type BrainMessage } from './prompts'
import type { BrainContext, Decision } from './types'

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
