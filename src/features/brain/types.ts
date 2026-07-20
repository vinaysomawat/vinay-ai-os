export type ScoreModule = 'health' | 'finance' | 'career' | 'learning' | 'projects'

export interface ScoreHistoryEntry {
  date: string
  life: number
  health: number
  finance: number
  career: number
  learning: number
  projects: number
}

export interface ScoreExplanation {
  module: ScoreModule
  label: string
  score: number
  delta: number | null
  tip: string
}

export interface ScoreExplanationResult {
  life: { score: number; delta: number | null }
  modules: ScoreExplanation[]
}

// Reshapes getDashboardData()'s already-fetched, already-summarized output
// into the "Unified Context" shape from PRDs/phase2.md — no new queries here,
// per Core Principle 2 (the Brain never duplicates business logic or
// re-fetches raw rows, it consumes each module's already-computed outputs).
export interface BrainContext {
  today: string
  lifeScore: number
  planner: { pendingTaskCount: number }
  career: { activeApplications: number }
  finance: { monthSpend: number; monthBudget: number }
  health: { workoutsToday: number; todayMetric: Record<string, unknown> | null }
  learning: { inProgress: number }
  coding: { solved30d: number }
  documents: { count: number }
  signals: { emoji: string; text: string; href: string }[]
  // Not populated until Pattern Detection (M4) exists — kept here now so the
  // shape matches the PRD from day one instead of needing a breaking change later.
  weeklyPatterns: string[]
  monthlyPatterns: string[]
}
