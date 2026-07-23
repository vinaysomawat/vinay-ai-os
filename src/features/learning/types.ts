export type ResourceType = 'course' | 'book' | 'video' | 'article' | 'podcast'
export type ResourceStatus = 'not-started' | 'in-progress' | 'completed'

export interface Resource {
  id: string
  user_id: string
  title: string
  type: ResourceType
  url: string | null
  category: string
  status: ResourceStatus
  progress: number
  notes: string | null
  created_at: string
  // Linked Planner task ("Read: {title}") — null for resources added before
  // this sync existed; not backfilled.
  task_id: string | null
}

// AI-recommended resource — deliberately has no `url`. Suggested-resources.ts's
// curated list is hand-verified (each URL checked live); an AI-generated URL
// risks looking plausible while being fake. The UI opens the existing Add
// Resource form pre-filled with this data instead of inserting it directly,
// so a real URL always comes from the user, never the model.
export interface RecommendedResource {
  title: string
  type: ResourceType
  category: string
  reason: string
}

export interface StudyLog {
  id: string
  user_id: string
  date: string
  resource_id: string | null
  duration_minutes: number
  notes: string | null
  created_at: string
}
