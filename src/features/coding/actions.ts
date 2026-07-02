'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ProjectStatus } from './types'

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function addProject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const stackRaw = formData.get('stack') as string
  const stack = stackRaw ? stackRaw.split(',').map(s => s.trim()).filter(Boolean) : []

  const { error } = await supabase.from('projects').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    status: formData.get('status') as ProjectStatus || 'idea',
    stack,
    github_url: formData.get('github_url') as string || null,
    live_url: formData.get('live_url') as string || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/coding')
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/coding')
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/coding')
}
