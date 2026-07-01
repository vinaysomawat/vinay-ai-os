export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  text: string
  done: boolean
  priority: Priority
  area: string
}
