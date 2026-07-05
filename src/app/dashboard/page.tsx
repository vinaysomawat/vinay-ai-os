import DashboardView from '@/features/dashboard/components/DashboardView'
import { getDashboardData } from '@/features/dashboard/actions'
import { getAIRecommendations } from '@/features/ai/recommendations'

export default async function DashboardPage() {
  const data = await getDashboardData()
  const recommendations = await getAIRecommendations(data).catch(() => [])
  return <DashboardView data={data} recommendations={recommendations} />
}
