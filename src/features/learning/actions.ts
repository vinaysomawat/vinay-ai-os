'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ResourceStatus } from './types'

export async function getResources() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function addResource(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('resources').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    type: formData.get('type') as string,
    url: formData.get('url') as string || null,
    category: formData.get('category') as string || 'General',
    status: 'not-started',
    progress: 0,
    notes: formData.get('notes') as string || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/learning')
}

export async function updateResource(id: string, updates: { status?: ResourceStatus; progress?: number }) {
  const supabase = await createClient()
  const { error } = await supabase.from('resources').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/learning')
}

export async function deleteResource(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/learning')
}
