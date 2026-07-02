import type { SupabaseClient } from '@supabase/supabase-js'

export const SYSTEM_PROMPT = `You are the Finance bot for Vinay AI OS. Parse the user message and return ONLY a JSON action.

Actions:
{"action":"add_expense","amount":500,"category":"Food"|"Transport"|"Shopping"|"Health"|"Entertainment"|"Utilities"|"Rent"|"Other","description":"what it was for","date":"YYYY-MM-DD"}
{"action":"list_expenses","period":"today"|"week"|"month"}
{"action":"summary","month":"YYYY-MM"}
{"action":"set_budget","category":"Food","amount":5000}
{"action":"help"}

Rules:
- amount is a number (no currency symbol)
- Default date: today
- Default category: "Other"
- ₹ and Rs both mean Indian Rupees, strip the symbol`

const CE = { Food: '🍔', Transport: '🚗', Shopping: '🛍️', Health: '💊', Entertainment: '🎬', Utilities: '💡', Rent: '🏠', Other: '📦' } as Record<string, string>

export async function execute(action: Record<string, unknown>, db: SupabaseClient, userId: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]
  switch (action.action) {
    case 'add_expense': {
      const { error } = await db.from('expenses').insert({ user_id: userId, amount: Number(action.amount), category: action.category ?? 'Other', description: action.description ?? null, date: action.date ?? today })
      if (error) return `❌ ${error.message}`
      return `${CE[String(action.category ?? 'Other')] ?? '📦'} Added ₹${Number(action.amount).toLocaleString('en-IN')} for *${action.description ?? action.category}*\nCategory: ${action.category ?? 'Other'}`
    }
    case 'list_expenses': {
      const period = (action.period as string) ?? 'today'
      const from = period === 'today' ? today : period === 'week' ? new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] : today.slice(0, 7) + '-01'
      const { data } = await db.from('expenses').select('amount, category, description, date').eq('user_id', userId).gte('date', from).order('date', { ascending: false }).limit(15)
      if (!data?.length) return `No expenses in the last ${period}.`
      const total = data.reduce((s, e) => s + e.amount, 0)
      return `💸 *${period.charAt(0).toUpperCase() + period.slice(1)}'s expenses:*\n` +
        data.map(e => `${CE[e.category] ?? '📦'} ₹${e.amount.toLocaleString('en-IN')} — ${e.description ?? e.category}`).join('\n') +
        `\n\n*Total: ₹${total.toLocaleString('en-IN')}*`
    }
    case 'summary': {
      const month = (action.month as string) ?? today.slice(0, 7)
      const { data } = await db.from('expenses').select('amount, category').eq('user_id', userId).gte('date', `${month}-01`).lte('date', `${month}-31`)
      if (!data?.length) return `No expenses in ${month}.`
      const byCategory: Record<string, number> = {}
      data.forEach(e => { byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount })
      const total = data.reduce((s, e) => s + e.amount, 0)
      const lines = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([c, a]) => `${CE[c] ?? '📦'} ${c}: ₹${a.toLocaleString('en-IN')}`)
      return `📊 *${month} Summary:*\n${lines.join('\n')}\n\n*Total: ₹${total.toLocaleString('en-IN')}*`
    }
    case 'set_budget': {
      const month = today.slice(0, 7)
      const { error } = await db.from('budgets').upsert({ user_id: userId, category: action.category, amount: Number(action.amount), month }, { onConflict: 'user_id,category,month' })
      if (error) return `❌ ${error.message}`
      return `✅ Budget set: ${action.category} → ₹${Number(action.amount).toLocaleString('en-IN')}/month`
    }
    default:
      return `*Finance Bot — What I can do:*\n• "spent 500 on Swiggy food"\n• "paid 200 for Uber transport"\n• "show today's expenses"\n• "monthly summary"\n• "set food budget 8000"`
  }
}
