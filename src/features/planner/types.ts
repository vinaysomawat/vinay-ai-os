export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  user_id: string
  text: string
  done: boolean
  priority: Priority
  area: string
  due_date: string | null
  created_at: string
}
