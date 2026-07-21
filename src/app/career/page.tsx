import CareerView from '@/features/career/components/CareerView'
import { getCareerData } from '@/features/career/actions'
import { getGoals } from '@/features/goals/actions'

export default async function CareerPage() {
  const [data, goals] = await Promise.all([getCareerData(), getGoals('career')])
  return <CareerView {...data} goals={goals} />
}
