import type { ResolvedGoal } from './types'

// Formats active (not-yet-achieved) goals into an AI-prompt-ready snippet.
// Shared by every recommender that should weight its picks toward what the
// user is actually trying to achieve, not just local module stats.
export function formatGoalsContext(goals: ResolvedGoal[]): string {
  const active = goals.filter(g => !g.achieved_at)
  if (active.length === 0) return ''

  const lines = active.map(g => {
    const progress = g.target_value != null && g.resolvedCurrentValue != null
      ? ` (${g.resolvedCurrentValue}/${g.target_value})`
      : ''
    const due = g.target_date ? ` by ${g.target_date}` : ''
    return `- ${g.name}${progress}${due}`
  })

  return `\n\nActive goals:\n${lines.join('\n')}`
}
