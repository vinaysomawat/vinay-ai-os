export type ProjectStatus = 'idea' | 'in-progress' | 'paused' | 'completed'
export type WorkType = 'personal' | 'office' | 'oss'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  work_type: WorkType
  stack: string[]
  github_url: string | null
  live_url: string | null
  created_at: string
}
