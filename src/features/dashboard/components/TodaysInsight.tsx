import { Lightbulb } from 'lucide-react'
import Card from '@/components/Card'

// Daily Operating System's "Today's Insight" (Phase 5 PRD) — reuses the
// existing Weekly Pattern Mining detector's most-recently-confirmed pattern
// (already computed weekly, see brain/signals.ts) instead of a fresh
// per-day AI call. "Only one insight, high quality over quantity" is
// satisfied by showing at most the single strongest pattern, not a list.
export default function TodaysInsight({ pattern }: { pattern: string | null }) {
  return (
    <Card title="Today's Insight" padding="p-3.5" action={<Lightbulb size={13} className="text-amber-400" />}>
      {pattern ? (
        <p className="text-sm text-slate-300 leading-relaxed">{pattern}</p>
      ) : (
        <p className="text-sm text-slate-400">No confirmed pattern yet — check back after a few more weeks of data</p>
      )}
    </Card>
  )
}
