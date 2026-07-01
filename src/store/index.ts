import { create } from 'zustand'

// Root store — each module will add its own slice here as features are built.
// Example: import { createPlannerSlice } from './slices/planner'

interface AppStore {
  // Global UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>(set => ({
  sidebarOpen: true,
  setSidebarOpen: open => set({ sidebarOpen: open }),
}))
