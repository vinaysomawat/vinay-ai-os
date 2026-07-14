import type { Signal } from '@/lib/signals'

export function checkRevisionNeeded(resourcesNeedingRevision: number): Signal | null {
  if (resourcesNeedingRevision === 0) return null
  return {
    id: 'learning.revision_needed', module: 'learning', weight: 45, emoji: '📚', href: '/learning',
    message: `${resourcesNeedingRevision} resource${resourcesNeedingRevision > 1 ? 's' : ''} completed but not revised in 14+ days`,
  }
}
