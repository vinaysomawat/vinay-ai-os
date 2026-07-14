import type { Signal } from '@/lib/signals'

export function checkBudget(monthSpend: number, monthBudget: number): Signal | null {
  if (monthBudget <= 0) return null
  const ratio = monthSpend / monthBudget
  if (ratio >= 1) {
    return {
      id: 'finance.over_budget', module: 'finance', weight: 80, emoji: '💸', href: '/finance',
      message: `Over budget this month by ₹${Math.round(monthSpend - monthBudget).toLocaleString('en-IN')}`,
    }
  }
  if (ratio >= 0.9) {
    return {
      id: 'finance.near_budget', module: 'finance', weight: 55, emoji: '💸', href: '/finance',
      message: `${Math.round(ratio * 100)}% of monthly budget used`,
    }
  }
  return null
}
