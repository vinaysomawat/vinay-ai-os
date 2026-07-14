import type { Signal } from '@/lib/signals'

export function checkQuestionPending(pending: boolean): Signal | null {
  if (!pending) return null
  return {
    id: 'coding.question_pending', module: 'coding', weight: 65, emoji: '💻', href: '/coding',
    message: "Today's coding question is still open",
  }
}

export function checkStaleRevision(count: number): Signal | null {
  if (count === 0) return null
  return {
    id: 'coding.stale_revision', module: 'coding', weight: 40, emoji: '🔁', href: '/coding',
    message: `${count} solved question${count > 1 ? 's' : ''} not revisited in 14+ days`,
  }
}
