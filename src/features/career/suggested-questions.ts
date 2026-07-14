import type { Difficulty } from './types'

// Curated interview-prep questions, not AI-generated — sourced from a
// personal 7-day Staff Frontend Engineer prep roadmap. Same reasoning as
// Learning's suggested-resources.ts: a static list with an opt-in "+ Add"
// button, not something silently seeded into the user's data. Deduped
// against the existing QA bank by question text in CareerView.
export interface SuggestedQuestion {
  question: string
  topic: string
  difficulty: Difficulty
}

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  // JavaScript
  {
    question: 'Why does a Promise resolve before a setTimeout(fn, 0) callback runs, even though both are asynchronous?',
    topic: 'JavaScript', difficulty: 'medium',
  },
  {
    question: 'Explain how `this` is determined in JavaScript across regular functions, arrow functions, and class methods.',
    topic: 'JavaScript', difficulty: 'medium',
  },
  {
    question: 'What is prototypal inheritance, and how does it differ from classical inheritance?',
    topic: 'JavaScript', difficulty: 'medium',
  },
  {
    question: 'What is a WeakMap or WeakSet, and when would you reach for one over a Map or Set?',
    topic: 'JavaScript', difficulty: 'medium',
  },
  {
    question: 'What commonly causes memory leaks in a long-running JavaScript app, and how do you find them?',
    topic: 'JavaScript', difficulty: 'hard',
  },
  // React
  {
    question: "How does React's reconciliation algorithm decide what to re-render, and what role does the Fiber architecture play?",
    topic: 'React', difficulty: 'hard',
  },
  {
    question: 'When should you reach for `useMemo` or `useCallback`, and when are they unnecessary?',
    topic: 'React', difficulty: 'medium',
  },
  {
    question: "What problem do Error Boundaries solve, and what can't they catch?",
    topic: 'React', difficulty: 'medium',
  },
  {
    question: 'How do React Server Components differ from traditional server-side rendering?',
    topic: 'React', difficulty: 'hard',
  },
  // System Design
  {
    question: 'How would you architect a dashboard that needs to render 100,000+ rows without freezing the UI?',
    topic: 'System Design', difficulty: 'hard',
  },
  {
    question: "A dashboard becomes sluggish after loading 20,000 rows — walk through how you'd debug and fix it.",
    topic: 'System Design', difficulty: 'hard',
  },
  {
    question: 'How would you structure a large frontend codebase using feature-based architecture instead of type-based folders?',
    topic: 'System Design', difficulty: 'medium',
  },
  {
    question: 'How would you design a micro-frontend architecture that lets teams deploy independently?',
    topic: 'System Design', difficulty: 'hard',
  },
  {
    question: 'How would you implement feature flags in a large production frontend application?',
    topic: 'System Design', difficulty: 'medium',
  },
  // Behavioral (Staff-level)
  {
    question: 'Describe an architecture decision you made, the tradeoffs you weighed, and how you rolled it out.',
    topic: 'Behavioral', difficulty: 'hard',
  },
  {
    question: 'Tell me about a technically unpopular decision you made — how did you drive it forward?',
    topic: 'Behavioral', difficulty: 'hard',
  },
  {
    question: "How do you influence technical direction across teams you don't formally manage?",
    topic: 'Behavioral', difficulty: 'hard',
  },
]
