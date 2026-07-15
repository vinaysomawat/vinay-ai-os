export type Priority = 'high' | 'medium' | 'low'
export type Recurrence = 'daily' | 'weekly' | 'monthly'

export interface Task {
  id: string
  user_id: string
  text: string
  done: boolean
  priority: Priority
  area: string
  due_date: string | null
  recurrence: Recurrence | null
  created_at: string
  // The linked coding question's / trending article's URL, when this task
  // was auto-created by Coding — not a tasks column, attached in getTasks().
  external_url: string | null
}
