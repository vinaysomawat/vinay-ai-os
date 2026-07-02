import type { SupabaseClient } from '@supabase/supabase-js'

export const SYSTEM_PROMPT = `You are the Learning bot for Vinay AI OS. Parse the user message and return ONLY a JSON action.

Actions:
{"action":"add_resource","title":"name","type":"course"|"book"|"video"|"article"|"podcast","url":"https://... or null","category":"topic e.g. JavaScript","status":"not-started"|"in-progress"|"completed"}
{"action":"update_progress","search":"title","progress":75}
{"action":"complete","search":"title"}
{"action":"list_resources","filter":"all"|"in-progress"|"not-started"|"completed"}
{"action":"help"}

Rules:
- Default type: "course", default status: "not-started", default category: "General"
- If user says "started X", set status to "in-progress"
- If user says "finished X", use complete action`

const TE = { course: '🎓', book: '📚', video: '🎬', article: '📄', podcast: '🎙️' } as Record<string, string>

export async function execute(action: Record<string, unknown>, db: SupabaseClient, userId: string): Promise<string> {
  switch (action.action) {
    case 'add_resource': {
      const { error } = await db.from('resources').insert({ user_id: userId, title: action.title, type: action.type ?? 'course', url: action.url ?? null, category: action.category ?? 'General', status: action.status ?? 'not-started', progress: 0, notes: null })
      if (error) return `❌ ${error.message}`
      const e = TE[String(action.type ?? 'course')] ?? '📖'
      return `${e} Added *${action.title}*\nType: ${action.type ?? 'course'} · ${action.category ?? 'General'} · ${action.status ?? 'not-started'}`
    }
    case 'update_progress': {
      const { data } = await db.from('resources').select('id, title').eq('user_id', userId).ilike('title', `%${action.search}%`).limit(1)
      const r = data?.[0]
      if (!r) return `❌ No resource matching "${action.search}"`
      const progress = Math.min(100, Math.max(0, Number(action.progress)))
      const status = progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started'
      await db.from('resources').update({ progress, status }).eq('id', r.id)
      return `📈 *${r.title}*: ${progress}% ${progress >= 100 ? '✅ Complete!' : ''}`
    }
    case 'complete': {
      const { data } = await db.from('resources').select('id, title').eq('user_id', userId).ilike('title', `%${action.search}%`).limit(1)
      const r = data?.[0]
      if (!r) return `❌ No resource matching "${action.search}"`
      await db.from('resources').update({ progress: 100, status: 'completed' }).eq('id', r.id)
      return `🎉 Completed: *${r.title}*!`
    }
    case 'list_resources': {
      const filter = (action.filter as string) ?? 'in-progress'
      let q = db.from('resources').select('title, type, status, progress, category').eq('user_id', userId)
      if (filter !== 'all') q = q.eq('status', filter)
      const { data } = await q.order('created_at', { ascending: false }).limit(10)
      if (!data?.length) return `No ${filter} resources.`
      return `📚 *${filter.charAt(0).toUpperCase() + filter.slice(1)}:*\n` +
        data.map(r => `${TE[r.type] ?? '📖'} *${r.title}* _(${r.category})_${r.status === 'in-progress' ? ` — ${r.progress}%` : ''}`).join('\n')
    }
    default:
      return `*Learning Bot — What I can do:*\n• "add Next.js course from Udemy"\n• "started JavaScript: The Good Parts book"\n• "update Next.js to 60%"\n• "finished React docs"\n• "show in-progress resources"`
  }
}
