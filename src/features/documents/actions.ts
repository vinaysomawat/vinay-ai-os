'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { askAI } from '@/lib/ai-gateway'

async function generateSummary(title: string, content: string): Promise<string> {
  if (content.length < 300) return ''
  return askAI(
    'doc_summary',
    `Summarise this document in 2-3 sentences. Title: "${title}"\n\n${content.slice(0, 6000)}`,
    'You are a concise document summariser. Return only the summary, no preamble.'
  )
}

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

  const summary = await generateSummary(title, content)
  const { error } = await supabase.from('documents').insert({ user_id: user.id, title, content, tags, summary })
  if (error) throw new Error(error.message)
  revalidatePath('/documents')
}

export async function updateDocument(id: string, title: string, content: string, tags: string[]) {
  const supabase = await createClient()

  const { data: existing } = await supabase.from('documents').select('title, content, summary').eq('id', id).single()
  const contentChanged = !existing || existing.title !== title || existing.content !== content
  const summary = contentChanged ? await generateSummary(title, content) : existing.summary

  const { error } = await supabase
    .from('documents')
    .update({ title, content, tags, summary, updated_at: new Date().toISOString() })
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
