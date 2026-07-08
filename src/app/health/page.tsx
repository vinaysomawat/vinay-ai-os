import HealthView from '@/features/health/components/HealthView'
import { getHabitsWithLogs, getHealthMetrics, getHealthProfile, getTodaysWorkouts } from '@/features/health/actions'

export default async function HealthPage() {
  const [habits, metrics, profile, workouts] = await Promise.all([
    getHabitsWithLogs(),
    getHealthMetrics(30),
    getHealthProfile(),
    getTodaysWorkouts(),
  ])
  return <HealthView initialHabits={habits} initialMetrics={metrics} initialProfile={profile} initialWorkouts={workouts} />
}
