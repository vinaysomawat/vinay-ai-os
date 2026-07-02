export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  created_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  date: string
  created_at: string
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
}
