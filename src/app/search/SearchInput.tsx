'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useRef } from 'react'
import { Search } from 'lucide-react'

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLInputElement>(null)

  const handleChange = (v: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (v) params.set('q', v)
      router.replace(`/search?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        ref={ref}
        defaultValue={defaultValue}
        onChange={e => handleChange(e.target.value)}
        placeholder="Search everything..."
        autoFocus
        className="w-full bg-surface-2 border border-surface-3 focus:border-accent rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
      />
      {isPending && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      )}
    </div>
  )
}
