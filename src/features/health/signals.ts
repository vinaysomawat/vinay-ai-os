import type { Signal } from '@/lib/signals'

export function checkWorkoutPending(pending: boolean): Signal | null {
  if (!pending) return null
  return {
    id: 'health.workout_pending', module: 'health', weight: 60, emoji: '🏋️', href: '/health',
    message: "Today's workout is still open",
  }
}

export function checkNoMetricsToday(todayMetric: Record<string, unknown> | null): Signal | null {
  const metricsLoggedToday = !!todayMetric && ['weight_kg', 'calories', 'steps'].some(k => todayMetric[k] != null)
  if (metricsLoggedToday) return null
  return {
    id: 'health.no_metrics_today', module: 'health', weight: 50, emoji: '📊', href: '/health',
    message: 'No health metrics logged today',
  }
}
