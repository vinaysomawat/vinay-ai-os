import CodingView from '@/features/coding/components/CodingView'
import { getProjects } from '@/features/coding/actions'
import { getTodayAssignment, getCodingStats, getCodingCalendarData, getCodingSettings, getAssignmentHistory } from '@/features/coding/daily'

export default async function CodingPage() {
  const [projects, dailyAssignment, codingStats, calendar, codingSettings, history] = await Promise.all([
    getProjects(),
    getTodayAssignment(),
    getCodingStats(),
    getCodingCalendarData(),
    getCodingSettings(),
    getAssignmentHistory(),
  ])
  return (
    <CodingView
      initialProjects={projects}
      dailyAssignment={dailyAssignment}
      codingStats={codingStats}
      calendar={calendar}
      codingSettings={codingSettings}
      history={history}
    />
  )
}
