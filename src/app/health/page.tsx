import HealthView from '@/features/health/components/HealthView'
import { getHabitsWithLogs } from '@/features/health/actions'

export default async function HealthPage() {
  const habits = await getHabitsWithLogs()
  return <HealthView initialHabits={habits} />
}
