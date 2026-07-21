import LearningView from '@/features/learning/components/LearningView'
import { getLearningData } from '@/features/learning/actions'
import { getGoals } from '@/features/goals/actions'

export default async function LearningPage() {
  const [{ resources, studyLogs }, goals] = await Promise.all([getLearningData(), getGoals('learning')])
  return <LearningView initialResources={resources} initialStudyLogs={studyLogs} goals={goals} />
}
