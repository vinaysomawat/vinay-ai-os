import { Skeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <div className="w-64 shrink-0 space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <Skeleton className="flex-1" />
    </div>
  )
}
