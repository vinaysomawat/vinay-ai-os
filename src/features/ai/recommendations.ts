'use server'

import { askAI } from '@/lib/ai-gateway'

export interface Recommendation {
  emoji: string
  action: string
  impact: string
}

export async function getModuleRecommendations(moduleLabel: string, context: string, bypassCache = false): Promise<Recommendation[]> {
  const prompt = `You are Vinay's AI life coach. Based on his current ${moduleLabel} data below, suggest exactly 3 specific, actionable recommendations he can act on today to improve this area.

${context}

Return ONLY a JSON array (no markdown, no extra text) of exactly 3 items in this shape:
[{"emoji": "single emoji", "action": "specific action referencing his real data above", "impact": "short expected effect"}]`

  const raw = await askAI('module_recommendations', prompt, "You are Vinay's AI life coach. Be specific, data-driven, and motivating — reference his actual numbers. Return only a valid JSON array, no markdown fences.", { bypassCache })

  try {
    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0]) as Recommendation[]
    return Array.isArray(parsed) ? parsed.slice(0, 3) : []
  } catch {
    return []
  }
}
