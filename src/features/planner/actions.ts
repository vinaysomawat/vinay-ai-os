'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Priority } from './types'

export async function getTasks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function addTask(text: string, priority: Priority = 'medium', area: string = 'General') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('tasks').insert({
    text,
    priority,
    area,
    user_id: user.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/planner')
}

export async function toggleTask(id: string, done: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ done })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/planner')
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/planner')
}

export async function updatePriority(id: string, priority: Priority) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tasks')
    .update({ priority })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/planner')
}
