import PlannerView from '@/features/planner/components/PlannerView'
import type { Task } from '@/features/planner/types'

const now = new Date().toISOString()

const dummyTasks: Task[] = [
  { id: '1', user_id: 'demo', text: 'Finish system design notes', done: false, priority: 'high', area: 'Learning', due_date: now.split('T')[0], recurrence: null, created_at: now, external_url: null },
  { id: '2', user_id: 'demo', text: 'Ship onboarding flow PR', done: false, priority: 'medium', area: 'Coding', due_date: null, recurrence: null, created_at: now, external_url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
  { id: '3', user_id: 'demo', text: "Today's workout: Push Day", done: false, priority: 'medium', area: 'Health', due_date: now.split('T')[0], recurrence: null, created_at: now, external_url: null },
  { id: '4', user_id: 'demo', text: 'Book dentist appointment', done: false, priority: 'low', area: 'General', due_date: null, recurrence: null, created_at: now, external_url: null },
  { id: '5', user_id: 'demo', text: 'Review pull requests', done: true, priority: 'medium', area: 'Coding', due_date: null, recurrence: 'daily', created_at: now, external_url: null },
  { id: '6', user_id: 'demo', text: 'Weekly finance review', done: true, priority: 'low', area: 'Finance', due_date: null, recurrence: 'weekly', created_at: now, external_url: null },
]

export default function PlannerPreview() {
  return <PlannerView initialTasks={dummyTasks} />
}
