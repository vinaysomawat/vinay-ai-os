import type { BrainContext } from './types'

export const BRAIN_SYSTEM_PROMPT = `You are Vinay's personal Brain — a single assistant that understands his whole life across Planner, Career, Finance, Health, Learning, and Coding, and helps him make decisions.

Rules:
- Answer directly and specifically using only the context provided below. Never invent numbers, events, or facts that aren't in the context.
- If the context doesn't have what you need to answer well, say so plainly instead of guessing.
- Be concrete, not generic — reference actual numbers/items from the context rather than general advice.
- Keep the response under 200 words.
- Plain conversational sentences only — no markdown (no #/##  headings, no **bold**, no bullet lists). Write it like you're talking to him, not writing a report.`

// Turns the Context Builder's output into a compact, readable block for the
// prompt — one line per module, not the raw object (Core Principle 2: the
// Brain consumes summarized context, never raw rows).
export function buildContextSummary(ctx: BrainContext): string {
  const lines = [
    `Today: ${ctx.today}`,
    `Life Score: ${ctx.lifeScore}/100`,
    `Planner: ${ctx.planner.pendingTaskCount} pending tasks`,
    `Career: ${ctx.career.activeApplications} active applications${ctx.career.currentRole ? `, currently ${ctx.career.currentRole}${ctx.career.currentCompany ? ` at ${ctx.career.currentCompany}` : ''}` : ''}${ctx.career.targetRole ? `, targeting ${ctx.career.targetRole}` : ''}${ctx.career.currentSalary ? `, current salary ₹${Math.round(ctx.career.currentSalary).toLocaleString('en-IN')}` : ''}`,
    `Finance: ₹${Math.round(ctx.finance.monthSpend)} spent of ₹${Math.round(ctx.finance.monthBudget)} budget this month`,
    `Health: ${ctx.health.workoutsToday} workout(s) today${ctx.health.todayMetric ? '' : ', no metrics logged today'}`,
    `Learning: ${ctx.learning.inProgress} resources in progress`,
    `Coding: ${ctx.coding.solved30d} questions solved in the last 30 days`,
    `Documents: ${ctx.documents.count} saved`,
  ]

  if (ctx.signals.length > 0) {
    lines.push('Top open items: ' + ctx.signals.map(s => `${s.emoji} ${s.text}`).join('; '))
  }
  if (ctx.weeklyPatterns.length > 0) {
    lines.push('Patterns this week: ' + ctx.weeklyPatterns.join('; '))
  }
  if (ctx.monthlyPatterns.length > 0) {
    lines.push('Patterns this month: ' + ctx.monthlyPatterns.join('; '))
  }

  return lines.join('\n')
}

export interface BrainMessage {
  role: 'user' | 'assistant'
  content: string
}

export function buildBrainPrompt(contextSummary: string, history: BrainMessage[], question: string): string {
  const historyBlock = history.length > 0
    ? '\n\nPrevious conversation (most recent last):\n' + history.map(m => `${m.role === 'user' ? 'Vinay' : 'Brain'}: ${m.content}`).join('\n')
    : ''

  return `Context:\n${contextSummary}${historyBlock}\n\nVinay's question: ${question}`
}

export const BRAIN_DECISION_SYSTEM_PROMPT = `You are Vinay's personal Brain, helping him make a decision using only the context provided. Never invent numbers or facts not in the context — if something needed is missing, say so in the reasoning instead of guessing.

Respond with ONLY a JSON object, no markdown, no code fences, matching exactly this shape:
{"decision": "one direct sentence — your recommendation", "reasoning": "2-3 sentences explaining why, grounded in the actual context", "tradeoffs": ["short trade-off 1", "short trade-off 2"], "confidence": "high" | "medium" | "low", "actionItems": ["concrete next step 1", "concrete next step 2"]}

confidence should be "low" whenever the context is missing information that would materially change the answer.`

export function buildDecisionPrompt(contextSummary: string, question: string): string {
  return `Context:\n${contextSummary}\n\nDecision Vinay is weighing: ${question}`
}
