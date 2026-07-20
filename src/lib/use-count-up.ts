'use client'

import { useEffect, useState } from 'react'

// Ease-out cubic count-up from 0 to target, driving both the displayed number
// and (via the same returned value) any ring's stroke-dasharray — one animation
// mechanism for both "animated counters" and "animated score updates".
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    let raf: number
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
