import type { SupabaseClient } from '@supabase/supabase-js'

export const SYSTEM_PROMPT = `You are the Health bot for Vinay AI OS. Parse the user message and return ONLY a JSON action.

Actions:
{"action":"log_habit","name":"habit name"}
{"action":"list_habits"}
{"action":"add_habit","name":"habit name","emoji":"single emoji"}
{"action":"today_summary"}
{"action":"help"}

Rules:
- If user says "I ran", "went for a run", "did my run" → log_habit with name "Run" (or closest match)
- If user says "meditated", "did meditation" → log_habit with name "Meditation"
- Match to existing habit names; don't create new habits unless action is add_habit
- For add_habit, pick a relevant emoji if not specified`

export async function execute(action: Record<string, unknown>, db: SupabaseClient, userId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  switch (action.action) {
    case 'log_habit': {
      const { data: habits } = await db.from('habits').select('id, name, emoji').eq('user_id', userId)
      const search = String(action.name).toLowerCase()
      const habit = habits?.find(h => h.name.toLowerCase().includes(search) || search.includes(h.name.toLowerCase()))
      if (!habit) return `❌ No habit matching "${action.name}". Existing habits:\n${habits?.map(h => `${h.emoji} ${h.name}`).join('\n') ?? 'None'}`
      const { error } = await db.from('habit_logs').insert({ user_id: userId, habit_id: habit.id, logged_date: today })
      if (error?.code === '23505') return `Already logged *${habit.emoji} ${habit.name}* today!`
      if (error) return `❌ ${error.message}`
      return `${habit.emoji} Logged *${habit.name}* for today! 🔥`
    }
    case 'list_habits': {
      const { data: habits } = await db.from('habits').select('id, name, emoji').eq('user_id', userId)
      if (!habits?.length) return 'No habits yet. Add one with "add habit [name]"'
      const { data: logs } = await db.from('habit_logs').select('habit_id, logged_date').eq('user_id', userId).gte('logged_date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
      const doneToday = new Set(logs?.filter(l => l.logged_date === today).map(l => l.habit_id))
      return `*Your habits:*\n` + habits.map(h => `${h.emoji} ${h.name} ${doneToday.has(h.id) ? '✅' : '○'}`).join('\n')
    }
    case 'add_habit': {
      const { error } = await db.from('habits').insert({ user_id: userId, name: action.name, emoji: action.emoji ?? '⭐' })
      if (error) return `❌ ${error.message}`
      return `${action.emoji ?? '⭐'} Added habit: *${action.name}*`
    }
    case 'today_summary': {
      const { data: habits } = await db.from('habits').select('id, name, emoji').eq('user_id', userId)
      if (!habits?.length) return 'No habits yet.'
      const { data: logs } = await db.from('habit_logs').select('habit_id').eq('user_id', userId).eq('logged_date', today)
      const done = new Set(logs?.map(l => l.habit_id))
      const doneList = habits.filter(h => done.has(h.id))
      const pendingList = habits.filter(h => !done.has(h.id))
      return `📊 *Today's Progress: ${done.size}/${habits.length}*\n\n` +
        (doneList.length ? `✅ Done:\n${doneList.map(h => `${h.emoji} ${h.name}`).join('\n')}\n\n` : '') +
        (pendingList.length ? `○ Pending:\n${pendingList.map(h => `${h.emoji} ${h.name}`).join('\n')}` : '')
    }
    default:
      return `*Health Bot — What I can do:*\n• "logged my run"\n• "did meditation"\n• "show habits"\n• "today's summary"\n• "add habit Journaling 📔"`
  }
}
