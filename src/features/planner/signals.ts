import type { Signal } from '@/lib/signals'

interface PendingTaskLike {
  text: string
  priority: string
  due_date: string | null
}

export function checkOverdueTasks(tasks: PendingTaskLike[], today: string): Signal | null {
  const overdue = tasks.filter(t => t.due_date && t.due_date < today)
  if (overdue.length === 0) return null
  return {
    id: 'planner.overdue_tasks', module: 'planner', weight: 100, emoji: '🔴', href: '/planner',
    message: `${overdue.length} task${overdue.length > 1 ? 's' : ''} overdue — clear ${overdue.length > 1 ? 'these' : 'this'} first`,
  }
}

export function checkHighPriorityPending(tasks: PendingTaskLike[], today: string): Signal | null {
  const highPriorityPending = tasks.filter(t => t.priority === 'high' && !(t.due_date && t.due_date < today))
  if (highPriorityPending.length === 0) return null
  return {
    id: 'planner.high_priority_pending', module: 'planner', weight: 70, emoji: '⚡', href: '/planner',
    message: `${highPriorityPending.length} high-priority task${highPriorityPending.length > 1 ? 's' : ''} pending`,
  }
}
