import HealthView from '@/features/health/components/HealthView'
import { getHabitsWithLogs, getHealthMetrics, getHealthProfile } from '@/features/health/actions'

export default async function HealthPage() {
  const [habits, metrics, profile] = await Promise.all([
    getHabitsWithLogs(),
    getHealthMetrics(30),
    getHealthProfile(),
  ])
  return <HealthView initialHabits={habits} initialMetrics={metrics} initialProfile={profile} />
}
