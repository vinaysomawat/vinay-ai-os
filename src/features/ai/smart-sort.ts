import type { Task } from '@/features/planner/types'

export interface SmartSortResult {
  order: string[]
  focus: string
}

// Deterministic — reordering by priority/urgency doesn't need an AI call.
const PRIORITY_WEIGHT: Record<Task['priority'], number> = { high: 100, medium: 50, low: 10 }

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000)
}

function dueDateScore(dueDate: string | null, today: string): number {
  if (!dueDate) return 0
  if (dueDate < today) return 90 // overdue
  if (dueDate === today) return 60
  const daysAway = daysBetween(dueDate, today)
  if (daysAway <= 3) return 30
  if (daysAway <= 7) return 15
  return 5
}

function score(task: Task, today: string): number {
  return PRIORITY_WEIGHT[task.priority] + dueDateScore(task.due_date, today)
}

function focusReason(task: Task, today: string): string {
  if (task.due_date && task.due_date < today) {
    const daysOverdue = daysBetween(today, task.due_date)
    return `Focus on: ${task.text} — it's ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue.`
  }
  if (task.due_date === today) {
    return `Focus on: ${task.text} — it's due today.`
  }
  if (task.priority === 'high') {
    return `Focus on: ${task.text} — marked high priority.`
  }
  return `Focus on: ${task.text} — currently your top-priority task.`
}

export function smartSortAndFocus(tasks: Task[]): SmartSortResult {
  const pending = tasks.filter(t => !t.done)
  if (pending.length === 0) return { order: [], focus: '' }

  const today = new Date().toISOString().split('T')[0]
  const sorted = [...pending].sort((a, b) => score(b, today) - score(a, today))

  return {
    order: sorted.map(t => t.id),
    focus: focusReason(sorted[0], today),
  }
}
