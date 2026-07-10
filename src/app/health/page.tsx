import HealthView from '@/features/health/components/HealthView'
import { getHealthMetrics, getHealthProfile, getTodaysWorkouts } from '@/features/health/actions'

export default async function HealthPage() {
  const [metrics, profile, workouts] = await Promise.all([
    getHealthMetrics(30),
    getHealthProfile(),
    getTodaysWorkouts(),
  ])
  return <HealthView initialMetrics={metrics} initialProfile={profile} initialWorkouts={workouts} />
}
