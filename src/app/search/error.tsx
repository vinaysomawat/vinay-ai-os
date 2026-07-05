'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-slate-400 text-sm">Search failed</p>
      <button onClick={reset} className="text-xs text-accent hover:underline">Try again</button>
    </div>
  )
}
