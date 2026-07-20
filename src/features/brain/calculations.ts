import { daysAgoIST } from '@/lib/date'
import type { ScoreExplanation, ScoreExplanationResult, ScoreHistoryEntry, ScoreModule } from './types'

const MODULE_LABEL: Record<ScoreModule, string> = {
  health: 'Health', finance: 'Finance', career: 'Career', learning: 'Learning', projects: 'Coding',
}

// "Explain My Score" — deterministic, no AI call (Product Principle 2): every
// number here is just today's already-computed score minus yesterday's, read
// from the 30-day history the dashboard already fetches. The "why" for each
// module reuses the same scoreTips already shown elsewhere, not a new prompt.
export function explainScore(
  scoreHistory: ScoreHistoryEntry[],
  scores: Record<ScoreModule, number> & { life: number },
  scoreTips: Record<ScoreModule, string>,
): ScoreExplanationResult {
  const yesterday = daysAgoIST(1)
  const yesterdayEntry = scoreHistory.find(e => e.date === yesterday)

  const delta = (module: ScoreModule | 'life'): number | null => {
    if (!yesterdayEntry) return null
    const current = module === 'life' ? scores.life : scores[module]
    return current - yesterdayEntry[module]
  }

  const modules: ScoreExplanation[] = (['health', 'finance', 'career', 'learning', 'projects'] as ScoreModule[])
    .map(module => ({
      module,
      label: MODULE_LABEL[module],
      score: scores[module],
      delta: delta(module),
      tip: scoreTips[module],
    }))
    // Biggest movers first — improvements and regressions both surface above "no change"
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))

  return {
    life: { score: scores.life, delta: delta('life') },
    modules,
  }
}
