import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendMessage } from '@/lib/telegram/send'
import { generateAssignmentForUser } from '@/features/coding/daily-core'

const CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID!
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_CODING!

const DIFFICULTY_EMOJI: Record<string, string> = { easy: '🟢', medium: '🟡', hard: '🔴' }

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.[0]
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 })

  const assignment = await generateAssignmentForUser(supabase, user.id)

  if (assignment.length === 0) {
    return NextResponse.json({ ok: true, message: 'No new questions today (revision day or empty pool)' })
  }

  const { data: settings } = await supabase.from('coding_settings').select('telegram_notify').eq('user_id', user.id).single()
  if (settings?.telegram_notify === false) {
    return NextResponse.json({ ok: true, notified: false, count: assignment.length })
  }

  const lines = assignment.map((a, i) => {
    const q = a.question
    return `${assignment.length > 1 ? `*Question ${i + 1}/${assignment.length}*\n` : ''}${DIFFICULTY_EMOJI[q.difficulty] ?? ''} *${q.title}*\nDifficulty: ${q.difficulty}\n[Open](${q.url})`
  })

  await sendMessage(BOT_TOKEN, Number(CHAT_ID), `💻 *Today's Coding Challenge*\n\n${lines.join('\n\n')}\n\n_Mark it done in AI OS or Telegram once solved._`)

  return NextResponse.json({ ok: true, notified: true, count: assignment.length })
}
