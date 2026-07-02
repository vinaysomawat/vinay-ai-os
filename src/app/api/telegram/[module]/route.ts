import { NextRequest, NextResponse } from 'next/server'
import { handleUpdate, isValidModule } from '@/features/telegram/handler'
import type { TelegramUpdate } from '@/lib/telegram/types'

export async function POST(req: NextRequest, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params

  if (!isValidModule(module)) {
    return NextResponse.json({ error: 'Unknown module' }, { status: 404 })
  }

  let update: TelegramUpdate
  try {
    update = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Respond to Telegram immediately (they retry if we don't answer fast)
  handleUpdate(module, update).catch(console.error)

  return NextResponse.json({ ok: true })
}
