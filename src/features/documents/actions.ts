'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getDocuments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function addDocument(title: string, content: string, tags: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('documents').insert({ user_id: user.id, title, content, tags })
  if (error) throw new Error(error.message)
  revalidatePath('/documents')
}

export async function updateDocument(id: string, title: string, content: string, tags: string[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('documents')
    .update({ title, content, tags, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/documents')
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/documents')
}
