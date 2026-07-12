'use client'

import Card from '@/components/Card'
import ModuleRecommendations from '@/components/ModuleRecommendations'
import DailyCodingCard from './DailyCodingCard'
import CodingCalendar from './CodingCalendar'
import CodingSettingsPopover from './CodingSettingsPopover'
import QuestionHistory from './QuestionHistory'
import TrendingReadingCard from '@/features/trending/components/TrendingReadingCard'
import type { DailyQuestion, CodingStats, CalendarDay, CodingSettings } from '../daily-core'
import type { TrendingReading } from '@/features/trending/types'

interface Props {
  dailyAssignment: DailyQuestion[]
  codingStats: CodingStats
  calendar: CalendarDay[]
  codingSettings: CodingSettings
  history: DailyQuestion[]
  trendingReading: TrendingReading | null
}

export default function CodingView({ dailyAssignment, codingStats, calendar, codingSettings, history, trendingReading }: Props) {
  return (
    <div className="space-y-5">
      <ModuleRecommendations moduleLabel="Coding" context={`Current streak: ${codingStats.currentStreak}d (longest: ${codingStats.longestStreak}d). Total solved: ${codingStats.totalSolved} (${codingStats.easySolved} easy, ${codingStats.mediumSolved} medium, ${codingStats.hardSolved} hard). Completion rate: ${codingStats.completionRate}%.`} />

      <DailyCodingCard initialAssignment={dailyAssignment} stats={codingStats} />

      <TrendingReadingCard initialReading={trendingReading} />

      <Card title="Contribution Calendar" action={<CodingSettingsPopover initialSettings={codingSettings} />}>
        <CodingCalendar days={calendar} />
      </Card>

      <QuestionHistory initialHistory={history} />
    </div>
  )
}
