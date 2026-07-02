export type ProjectStatus = 'idea' | 'in-progress' | 'paused' | 'completed'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  stack: string[]
  github_url: string | null
  live_url: string | null
  created_at: string
}
