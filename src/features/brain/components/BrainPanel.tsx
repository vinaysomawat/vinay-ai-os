'use client'

import { useState } from 'react'
import BrainChat from './BrainChat'
import DecisionHelper from './DecisionHelper'
import WeeklyReview from './WeeklyReview'
import type { BrainContext } from '../types'

export default function BrainPanel({ context }: { context: BrainContext }) {
  const [tab, setTab] = useState<'chat' | 'decision' | 'reflect'>('chat')

  return (
    <div>
      <div className="flex gap-1 mb-3 bg-surface-2 rounded-lg p-0.5">
        <button onClick={() => setTab('chat')} className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'chat' ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-300'}`}>Ask</button>
        <button onClick={() => setTab('decision')} className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'decision' ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-300'}`}>Decide</button>
        <button onClick={() => setTab('reflect')} className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${tab === 'reflect' ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-300'}`}>Reflect</button>
      </div>
      {tab === 'chat' && <BrainChat context={context} />}
      {tab === 'decision' && <DecisionHelper context={context} />}
      {tab === 'reflect' && <WeeklyReview />}
    </div>
  )
}
