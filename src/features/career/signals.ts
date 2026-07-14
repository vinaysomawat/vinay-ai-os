import type { Signal } from '@/lib/signals'

interface ApplicationLike {
  status: string
}

export function checkInterviewStage(applications: ApplicationLike[]): Signal | null {
  const interviewApps = applications.filter(a => a.status === 'interview')
  if (interviewApps.length === 0) return null
  return {
    id: 'career.interview_stage', module: 'career', weight: 90, emoji: '🎯', href: '/career',
    message: `${interviewApps.length} application${interviewApps.length > 1 ? 's' : ''} at interview stage — prep now`,
  }
}
