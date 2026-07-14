import type { Signal } from '@/lib/signals'

export function checkQuestionPending(pending: boolean): Signal | null {
  if (!pending) return null
  return {
    id: 'coding.question_pending', module: 'coding', weight: 65, emoji: '💻', href: '/coding',
    message: "Today's coding question is still open",
  }
}
