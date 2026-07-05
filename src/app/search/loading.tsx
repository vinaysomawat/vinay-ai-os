export default function Loading() {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="h-7 w-24 bg-surface-2 rounded animate-pulse" />
        <div className="h-4 w-64 bg-surface-2 rounded animate-pulse" />
      </div>
      <div className="h-12 bg-surface-2 rounded-xl animate-pulse" />
      <ul className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="h-16 bg-surface-1 border border-surface-3 rounded-xl animate-pulse" />
        ))}
      </ul>
    </div>
  )
}
