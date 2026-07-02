import type { SupabaseClient } from '@supabase/supabase-js'

export const SYSTEM_PROMPT = `You are the Coding bot for Vinay AI OS. Parse the user message and return ONLY a JSON action.

Actions:
{"action":"add_project","name":"project name","description":"what it does","status":"idea"|"in-progress"|"paused"|"completed","stack":["Next.js","Supabase"],"github_url":"https://github.com/... or null","live_url":"https://... or null"}
{"action":"update_status","search":"project name","status":"idea"|"in-progress"|"paused"|"completed"}
{"action":"list_projects","filter":"all"|"idea"|"in-progress"|"paused"|"completed"}
{"action":"add_note","search":"project name","note":"note text"}
{"action":"help"}

Rules:
- stack is an array of tech names extracted from the message
- Default status: "idea"
- If user says "started working on X" → status "in-progress"`

const SE = { idea: '💡', 'in-progress': '⚡', paused: '⏸️', completed: '✅' } as Record<string, string>

export async function execute(action: Record<string, unknown>, db: SupabaseClient, userId: string): Promise<string> {
  switch (action.action) {
    case 'add_project': {
      const stack = Array.isArray(action.stack) ? action.stack : []
      const { error } = await db.from('projects').insert({ user_id: userId, name: action.name, description: action.description ?? null, status: action.status ?? 'idea', stack, github_url: action.github_url ?? null, live_url: action.live_url ?? null })
      if (error) return `❌ ${error.message}`
      return `${SE[String(action.status ?? 'idea')]} Added *${action.name}*\n${action.description ? action.description + '\n' : ''}Stack: ${stack.join(', ') || 'TBD'}`
    }
    case 'update_status': {
      const { data } = await db.from('projects').select('id, name').eq('user_id', userId).ilike('name', `%${action.search}%`).limit(1)
      const p = data?.[0]
      if (!p) return `❌ No project matching "${action.search}"`
      await db.from('projects').update({ status: action.status }).eq('id', p.id)
      return `${SE[String(action.status)]} *${p.name}* → ${action.status}`
    }
    case 'list_projects': {
      const filter = (action.filter as string) ?? 'all'
      let q = db.from('projects').select('name, status, stack, description').eq('user_id', userId)
      if (filter !== 'all') q = q.eq('status', filter)
      const { data } = await q.order('created_at', { ascending: false }).limit(10)
      if (!data?.length) return `No ${filter === 'all' ? '' : filter + ' '}projects.`
      return `💻 *Projects:*\n` + data.map(p => `${SE[p.status] ?? '💡'} *${p.name}* _(${p.stack?.slice(0, 2).join(', ') || 'TBD'})_`).join('\n')
    }
    case 'add_note': {
      const { data } = await db.from('projects').select('id, name, description').eq('user_id', userId).ilike('name', `%${action.search}%`).limit(1)
      const p = data?.[0]
      if (!p) return `❌ No project matching "${action.search}"`
      const newDesc = p.description ? `${p.description}\n${action.note}` : String(action.note)
      await db.from('projects').update({ description: newDesc }).eq('id', p.id)
      return `📝 Note added to *${p.name}*`
    }
    default:
      return `*Coding Bot — What I can do:*\n• "add project Portfolio with Next.js and Tailwind"\n• "started working on Portfolio"\n• "show in-progress projects"\n• "Portfolio is done"\n• "add note to Portfolio: deploy to Vercel next"`
  }
}
