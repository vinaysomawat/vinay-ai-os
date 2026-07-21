export type GoalModule = 'career' | 'learning' | 'coding'
export type AutoMetric = 'coding_streak' | 'books_completed'

export interface Goal {
  id: string
  user_id: string
  module: GoalModule
  name: string
  target_value: number | null
  current_value: number | null
  auto_metric: AutoMetric | null
  target_date: string | null
  achieved_at: string | null
  created_at: string
}

// A Goal with its progress resolved — for auto_metric goals, current_value
// is recomputed live from real module data rather than trusted from the
// stored (possibly stale) column.
export interface ResolvedGoal extends Goal {
  resolvedCurrentValue: number | null
}
