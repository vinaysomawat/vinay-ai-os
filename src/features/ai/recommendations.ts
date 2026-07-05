'use server'

import { aiText } from '@/lib/anthropic'

export interface Recommendation {
  emoji: string
  action: string
  impact: string
}

export interface FullRecommendations {
  summary: string
  overall: (Recommendation & { module: string })[]
  byModule: {
    health:   Recommendation[]
    finance:  Recommendation[]
    career:   Recommendation[]
    learning: Recommendation[]
    projects: Recommendation[]
  }
}

interface RecContext {
  scores: { health: number; finance: number; career: number; learning: number; projects: number; life: number }
  stats: { habitsDoneToday: number; totalHabits: number; pendingTaskCount: number; monthSpend: number; monthBudget: number; activeApplications: number; learningInProgress: number; activeProjects: number }
  todayHealth: { weight_kg: number | null; calories: number | null; sleep_hours: number | null; steps: number | null; water_ml: number | null } | null
}

const EMPTY: FullRecommendations = {
  summary: '',
  overall: [],
  byModule: { health: [], finance: [], career: [], learning: [], projects: [] },
}

export async function getFullRecommendations(ctx: RecContext): Promise<FullRecommendations> {
  const scores = ctx.scores
  const stats  = ctx.stats
  const h      = ctx.todayHealth

  const prompt = `You are Vinay's AI life coach. Generate a full recommendations report based on his data.

SCORES TODAY:
- Life Score: ${scores.life}/100
- Health: ${scores.health}/100
- Finance: ${scores.finance}/100
- Career: ${scores.career}/100
- Learning: ${scores.learning}/100
- Projects: ${scores.projects}/100

LIVE DATA:
- Habits done: ${stats.habitsDoneToday}/${stats.totalHabits}
- Pending tasks: ${stats.pendingTaskCount}
- Month spend: ₹${Math.round(stats.monthSpend).toLocaleString('en-IN')} of ₹${Math.round(stats.monthBudget || 0).toLocaleString('en-IN')} budget
- Active job applications: ${stats.activeApplications}
- Learning resources in progress: ${stats.learningInProgress}
- Active projects: ${stats.activeProjects}
- Health today: weight=${h?.weight_kg ?? 'not logged'}kg, sleep=${h?.sleep_hours ?? 'not logged'}h, steps=${h?.steps ?? 'not logged'}, water=${h?.water_ml ?? 'not logged'}ml, calories=${h?.calories ?? 'not logged'}

Return ONLY this JSON object (no markdown, no extra text):
{
  "summary": "2-3 sentence overview: current Life Score, which module needs most attention and why, one encouraging note about what's going well.",
  "overall": [
    {"module": "health", "emoji": "💪", "action": "specific action for today", "impact": "+3 Health Score"},
    {"module": "finance", "emoji": "💸", "action": "specific action for today", "impact": "+2 Finance Score"},
    {"module": "career", "emoji": "💼", "action": "specific action for today", "impact": "+2 Career Score"},
    {"module": "learning", "emoji": "📚", "action": "specific action for today", "impact": "+1 Learning Score"},
    {"module": "projects", "emoji": "💻", "action": "specific action for today", "impact": "+2 Projects Score"}
  ],
  "byModule": {
    "health": [
      {"emoji": "💪", "action": "specific health action 1", "impact": "+2 Health Score"},
      {"emoji": "🥗", "action": "specific health action 2", "impact": "+1 Health Score"},
      {"emoji": "😴", "action": "specific health action 3", "impact": "+2 Health Score"}
    ],
    "finance": [
      {"emoji": "💰", "action": "specific finance action 1", "impact": "+3 Finance Score"},
      {"emoji": "📊", "action": "specific finance action 2", "impact": "+2 Finance Score"},
      {"emoji": "🏦", "action": "specific finance action 3", "impact": "+1 Finance Score"}
    ],
    "career": [
      {"emoji": "💼", "action": "specific career action 1", "impact": "+3 Career Score"},
      {"emoji": "🎯", "action": "specific career action 2", "impact": "+2 Career Score"},
      {"emoji": "📝", "action": "specific career action 3", "impact": "+1 Career Score"}
    ],
    "learning": [
      {"emoji": "📚", "action": "specific learning action 1", "impact": "+3 Learning Score"},
      {"emoji": "✏️", "action": "specific learning action 2", "impact": "+2 Learning Score"},
      {"emoji": "🧠", "action": "specific learning action 3", "impact": "+1 Learning Score"}
    ],
    "projects": [
      {"emoji": "💻", "action": "specific project action 1", "impact": "+3 Projects Score"},
      {"emoji": "🚀", "action": "specific project action 2", "impact": "+2 Projects Score"},
      {"emoji": "🔧", "action": "specific project action 3", "impact": "+1 Projects Score"}
    ]
  }
}

Rules:
- summary must reference actual scores and data
- overall top 5 must be ordered by highest impact to Life Score first (weakest modules get priority)
- byModule actions must be specific to that module's real data
- module in overall must be one of: health, finance, career, learning, projects, planner`

  const raw = await aiText(prompt, 'You are Vinay\'s AI life coach. Be specific, data-driven, and motivating. Return only valid JSON, no markdown fences.')

  try {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return EMPTY
    const parsed = JSON.parse(match[0]) as FullRecommendations
    return {
      summary:  parsed.summary  ?? '',
      overall:  parsed.overall  ?? [],
      byModule: {
        health:   parsed.byModule?.health   ?? [],
        finance:  parsed.byModule?.finance  ?? [],
        career:   parsed.byModule?.career   ?? [],
        learning: parsed.byModule?.learning ?? [],
        projects: parsed.byModule?.projects ?? [],
      },
    }
  } catch {
    return EMPTY
  }
}

// Keep old export for any callers
export type { RecContext }
export async function getAIRecommendations(ctx: RecContext) {
  const full = await getFullRecommendations(ctx)
  return full.overall
}
