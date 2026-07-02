import LearningView from '@/features/learning/components/LearningView'
import { getResources } from '@/features/learning/actions'

export default async function LearningPage() {
  const resources = await getResources()
  return <LearningView initialResources={resources} />
}
