import CodingView from '@/features/coding/components/CodingView'
import { getTodayAssignment, getCodingStats, getCodingCalendarData, getCodingSettings, getAssignmentHistory, getInsightsHistory } from '@/features/coding/daily'
import { computeDifficultyProgression } from '@/features/coding/daily-core'
import { getTodayReading, getReadingHistory } from '@/features/trending/actions'
import { getGoals } from '@/features/goals/actions'

export default async function CodingPage() {
  const [dailyAssignment, codingStats, calendar, codingSettings, history, trendingReading, readingHistory, goals, insightsHistory] = await Promise.all([
    getTodayAssignment(),
    getCodingStats(),
    getCodingCalendarData(),
    getCodingSettings(),
    getAssignmentHistory(),
    getTodayReading(),
    getReadingHistory(),
    getGoals('coding'),
    getInsightsHistory(),
  ])
  return (
    <CodingView
      dailyAssignment={dailyAssignment}
      codingStats={codingStats}
      calendar={calendar}
      codingSettings={codingSettings}
      history={history}
      trendingReading={trendingReading}
      readingHistory={readingHistory}
      goals={goals}
      difficultyProgression={computeDifficultyProgression(insightsHistory)}
    />
  )
}
