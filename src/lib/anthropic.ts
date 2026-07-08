import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const SONNET_MODEL = 'claude-sonnet-4-6'
export const HAIKU_MODEL = 'claude-haiku-4-5'

export interface AIResult {
  text: string
  inputTokens: number
  outputTokens: number
}

// Low-level primitive. Only the AI Gateway (src/lib/ai-gateway.ts) should call
// this directly — every feature module goes through askAI() instead, so
// model routing, caching, and budget tracking stay in one place.
export async function callClaude(prompt: string, system: string | undefined, model: string): Promise<AIResult> {
  const msg = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: system ?? 'You are a helpful personal AI assistant. Be concise, practical, and actionable.',
    messages: [{ role: 'user', content: prompt }],
  })
  const block = msg.content.find(b => b.type === 'text')
  return {
    text: block?.type === 'text' ? block.text : '',
    inputTokens: msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
  }
}
