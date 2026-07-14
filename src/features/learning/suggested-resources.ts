import type { ResourceType } from './types'

// Curated, hand-verified (each URL checked live before being added here) —
// not AI-generated, to avoid the real risk of an LLM inventing plausible but
// fake resource links. Static array, not a DB table: this is small, rarely
// changing reference content, not something that needs SQL-driven
// rotation/filtering the way workout_library or coding_questions do.
export interface SuggestedResource {
  title: string
  type: ResourceType
  url: string
  category: string
  notes: string
}

export const SUGGESTED_RESOURCES: SuggestedResource[] = [
  // JS Deep Dive
  {
    title: 'Closures — MDN JavaScript Guide',
    type: 'article',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures',
    category: 'JS Deep Dive',
    notes: 'Lexical scope, closure definition, function factories, module pattern, closures-in-loops gotcha.',
  },
  {
    title: 'The event loop — MDN',
    type: 'article',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
    category: 'JS Deep Dive',
    notes: 'Job queue, run-to-completion, task vs microtask priority.',
  },
  // React Fundamentals
  {
    title: 'Render and Commit — react.dev',
    type: 'article',
    url: 'https://react.dev/learn/render-and-commit',
    category: 'React Fundamentals',
    notes: 'The three-step render process, pure rendering, how React decides what to touch in the DOM.',
  },
  {
    title: 'Making Sense of React Server Components — Josh Comeau',
    type: 'article',
    url: 'https://www.joshwcomeau.com/react/server-components/',
    category: 'React Fundamentals',
    notes: 'CSR → SSR → RSC evolution, use client boundaries, bundle-size implications.',
  },
  // Advanced React
  {
    title: 'Application State Management with React — Kent C. Dodds',
    type: 'article',
    url: 'https://kentcdodds.com/blog/application-state-management-with-react',
    category: 'Advanced React',
    notes: 'Local state vs lifting state vs Context, state colocation, server cache vs UI state.',
  },
  {
    title: 'Patterns.dev',
    type: 'article',
    url: 'https://www.patterns.dev/',
    category: 'Advanced React',
    notes: 'Design/rendering/performance patterns reference — HOCs, render props, code-splitting, lazy loading.',
  },
  // Frontend System Design
  {
    title: 'Micro Frontends — Martin Fowler (Cam Jackson)',
    type: 'article',
    url: 'https://martinfowler.com/articles/micro-frontends.html',
    category: 'System Design',
    notes: 'Independently deployable frontend apps composed into one whole — the canonical reference.',
  },
  {
    title: 'Atomic Design — Brad Frost',
    type: 'article',
    url: 'https://bradfrost.com/blog/post/atomic-web-design/',
    category: 'System Design',
    notes: 'Atoms/molecules/organisms/templates/pages — a mental model for design-system component hierarchy.',
  },
  {
    title: 'monorepo.tools',
    type: 'article',
    url: 'https://monorepo.tools/',
    category: 'System Design',
    notes: 'What a monorepo actually is, atomic cross-project commits, affected-detection and caching tooling.',
  },
  // Performance + Browser
  {
    title: 'Critical Rendering Path — web.dev',
    type: 'article',
    url: 'https://web.dev/articles/critical-rendering-path',
    category: 'Performance',
    notes: 'HTML/CSS/JS → pixels pipeline; the foundation for diagnosing "why is this slow."',
  },
  {
    title: 'Rendering on the Web — web.dev',
    type: 'article',
    url: 'https://web.dev/articles/rendering-on-the-web',
    category: 'Performance',
    notes: 'SSR vs static vs CSR vs prerendering vs streaming/progressive hydration, with tradeoffs per metric.',
  },
  {
    title: 'Prevent unnecessary network requests with the HTTP Cache — web.dev',
    type: 'article',
    url: 'https://web.dev/articles/http-cache',
    category: 'Performance',
    notes: 'Cache-Control, ETag revalidation, versioned-URL strategy vs revalidation strategy.',
  },
]
