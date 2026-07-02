'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signout } from '@/app/login/actions'
import { LogOut } from 'lucide-react'

export default function UserInfo() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  if (!email) return null

  const initial = email[0].toUpperCase()

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-2 border border-surface-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-300 truncate font-medium">{email}</p>
      </div>
      <form action={signout}>
        <button type="submit" className="text-slate-600 hover:text-red-400 transition-colors" title="Sign out">
          <LogOut size={13} />
        </button>
      </form>
    </div>
  )
}
