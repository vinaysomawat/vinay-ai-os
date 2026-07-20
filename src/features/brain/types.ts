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

export interface Decision {
  decision: string
  reasoning: string
  tradeoffs: string[]
  confidence: 'high' | 'medium' | 'low'
  actionItems: string[]
}

// Reshapes getDashboardData()'s already-fetched, already-summarized output
// into the "Unified Context" shape from PRDs/phase2.md — no new queries here,
// per Core Principle 2 (the Brain never duplicates business logic or
// re-fetches raw rows, it consumes each module's already-computed outputs).
export interface BrainContext {
  today: string
  lifeScore: number
  planner: { pendingTaskCount: number }
  career: {
    activeApplications: number
    // "Memory" (Phase 2 PRD) — read straight from career_profile, the Brain
    // doesn't own or duplicate this data, per Core Principle 1.
    currentRole: string | null
    currentCompany: string | null
    targetRole: string | null
    currentSalary: number | null
  }
  finance: { monthSpend: number; monthBudget: number }
  health: { workoutsToday: number; todayMetric: Record<string, unknown> | null }
  learning: { inProgress: number }
  coding: { solved30d: number }
  documents: { count: number }
  signals: { emoji: string; text: string; href: string }[]
  weeklyPatterns: string[]
  // Not populated yet — no monthly-cadence pattern job exists (only the
  // weekly one), kept here so the shape matches the PRD without a breaking change later.
  monthlyPatterns: string[]
}
