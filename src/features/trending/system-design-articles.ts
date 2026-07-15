// Curated, hand-verified frontend system-design articles — every URL fetched
// and confirmed live before being added, not AI-generated, same practice as
// learning/suggested-resources.ts (avoids the real risk of an LLM inventing
// plausible-but-fake links). Replaces the old Hacker-News-keyword-match
// mechanism: system design is niche enough that HN's front page frequently
// had nothing relevant on a given day.
export interface SystemDesignArticle {
  title: string
  url: string
  source: string
  category: string
}

export const SYSTEM_DESIGN_ARTICLES: SystemDesignArticle[] = [
  {
    title: 'Micro Frontends',
    url: 'https://martinfowler.com/articles/micro-frontends.html',
    source: 'martinfowler.com',
    category: 'Micro-Frontends',
  },
  {
    title: 'Front End System Design Playbook: All-in-one Deep Dive',
    url: 'https://www.greatfrontend.com/front-end-system-design-playbook',
    source: 'greatfrontend.com',
    category: 'System Design',
  },
  {
    title: 'How to choose the best rendering strategy for your app',
    url: 'https://vercel.com/blog/how-to-choose-the-best-rendering-strategy-for-your-app',
    source: 'vercel.com',
    category: 'Rendering',
  },
  {
    title: 'Micro-Frontends: a Sociotechnical Journey toward a Modern Frontend Architecture',
    url: 'https://www.infoq.com/articles/adopt-micro-frontends/',
    source: 'infoq.com',
    category: 'Micro-Frontends',
  },
  {
    title: 'Monorepos are changing how teams build software',
    url: 'https://vercel.com/blog/monorepos',
    source: 'vercel.com',
    category: 'Monorepo',
  },
  {
    title: 'API contracts and everything I wish I knew: a frontend survival guide',
    url: 'https://evilmartians.com/chronicles/api-contracts-and-everything-i-wish-i-knew-a-frontend-survival-guide',
    source: 'evilmartians.com',
    category: 'API Design',
  },
  {
    title: 'Scalable Frontend #3 — The State Layer',
    url: 'https://blog.codeminer42.com/scalable-frontend-3-the-state-layer-b23ed69ca57c/',
    source: 'blog.codeminer42.com',
    category: 'State Management',
  },
]
