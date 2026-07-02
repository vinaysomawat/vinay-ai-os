import type { SupabaseClient } from '@supabase/supabase-js'

export const SYSTEM_PROMPT = `You are the Planner bot for Vinay AI OS. Parse the user message and return ONLY a JSON action, nothing else.

Actions:
{"action":"add_task","text":"task text","priority":"high"|"medium"|"low","area":"General","due_date":"YYYY-MM-DD or null"}
{"action":"list_tasks","filter":"pending"|"done"|"all"}
{"action":"complete_task","search":"partial task text"}
{"action":"delete_task","search":"partial task text"}
{"action":"help"}

Rules:
- Default priority: "medium", default area: "General", default due_date: null
- If user says "today" for due_date, use today's date
- If message is unclear, return {"action":"help"}`

const P = { high: '🔴', medium: '🟡', low: '⚪' } as Record<string, string>

export async function execute(action: Record<string, unknown>, db: SupabaseClient, userId: string): Promise<string> {
  switch (action.action) {
    case 'add_task': {
      const { error } = await db.from('tasks').insert({ user_id: userId, text: action.text, priority: action.priority ?? 'medium', area: action.area ?? 'General', due_date: action.due_date ?? null, done: false })
      if (error) return `❌ ${error.message}`
      return `✅ Added *${action.priority ?? 'medium'}* task:\n"${action.text}"${action.due_date ? `\n📅 ${action.due_date}` : ''}`
    }
    case 'list_tasks': {
      const filter = (action.filter as string) ?? 'pending'
      let q = db.from('tasks').select('text, priority, done, due_date, area').eq('user_id', userId)
      if (filter === 'pending') q = q.eq('done', false)
      if (filter === 'done') q = q.eq('done', true)
      const { data } = await q.order('created_at', { ascending: false }).limit(10)
      if (!data?.length) return `No ${filter} tasks.`
      return `📋 *${filter.charAt(0).toUpperCase() + filter.slice(1)} tasks:*\n` +
        data.map(t => `${t.done ? '✅' : (P[t.priority] ?? '⚪')} ${t.text}${t.due_date ? ` _(${t.due_date})_` : ''}`).join('\n')
    }
    case 'complete_task': {
      const { data } = await db.from('tasks').select('id, text').eq('user_id', userId).eq('done', false).ilike('text', `%${action.search}%`).limit(1)
      const task = data?.[0]
      if (!task) return `❌ No pending task matching "${action.search}"`
      await db.from('tasks').update({ done: true }).eq('id', task.id)
      return `✅ Completed: "${task.text}"`
    }
    case 'delete_task': {
      const { data } = await db.from('tasks').select('id, text').eq('user_id', userId).ilike('text', `%${action.search}%`).limit(1)
      const task = data?.[0]
      if (!task) return `❌ No task matching "${action.search}"`
      await db.from('tasks').delete().eq('id', task.id)
      return `🗑️ Deleted: "${task.text}"`
    }
    default:
      return `*Planner Bot — What I can do:*\n• "add buy groceries high priority"\n• "show pending tasks"\n• "done with buy groceries"\n• "delete buy groceries"\n• "add call dentist due 2026-07-10"`
  }
}
