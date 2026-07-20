import type { Decision } from '../types'

const CONFIDENCE_COLOR: Record<Decision['confidence'], string> = {
  high: 'text-green-400 bg-green-500/15',
  medium: 'text-amber-400 bg-amber-500/15',
  low: 'text-red-400 bg-red-500/15',
}

export default function DecisionCard({ decision }: { decision: Decision }) {
  if (!decision.decision) {
    return <p className="text-sm text-slate-500">{decision.reasoning}</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-200">{decision.decision}</p>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CONFIDENCE_COLOR[decision.confidence]}`}>
          {decision.confidence} confidence
        </span>
      </div>

      {decision.reasoning && <p className="text-sm text-slate-400 leading-relaxed">{decision.reasoning}</p>}

      {decision.tradeoffs.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trade-offs</p>
          <ul className="space-y-0.5">
            {decision.tradeoffs.map((t, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-slate-600 shrink-0">–</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {decision.actionItems.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Action items</p>
          <ul className="space-y-0.5">
            {decision.actionItems.map((a, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-accent shrink-0">✓</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
