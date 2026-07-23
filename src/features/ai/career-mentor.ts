'use server'

import { askAI } from '@/lib/ai-gateway'
import { computeReadiness } from '@/features/career/quiz-calculations'
import { QUIZ_TOPICS, READINESS_CONFIG } from '@/features/career/types'
import type { CareerProfile, Skill, Application, JDAnalysis, QuizAttempt } from '@/features/career/types'

interface CareerContext {
  profile: CareerProfile | null
  skills: Skill[]
  applications: Application[]
  quizAttempts?: QuizAttempt[]
  codingStreak?: number
  studyStreak?: number
}

export async function askCareerMentor(question: string, ctx: CareerContext): Promise<string> {
  const skillsByCategory = ctx.skills.reduce<Record<string, string[]>>((acc, s) => {
    acc[s.category] = [...(acc[s.category] ?? []), `${s.name} (${s.level})`]
    return acc
  }, {})

  const activeApps = ctx.applications.filter(a => ['applied', 'screening', 'interview'].includes(a.status))
  const offers = ctx.applications.filter(a => a.status === 'offer')

  const attemptedTopics = ctx.quizAttempts?.length
    ? QUIZ_TOPICS
        .map(topic => ({ topic, ...computeReadiness(ctx.quizAttempts!, topic) }))
        .filter(t => t.tier !== 'not_started')
        .map(t => `${t.topic}: ${READINESS_CONFIG[t.tier].label} (${t.avgPercent}%)`)
    : []

  const context = `Vinay's career snapshot:
- Current role: ${ctx.profile?.current_role ?? 'not set'} at ${ctx.profile?.current_company ?? 'not set'}
- Current salary: ${ctx.profile?.current_salary ? `₹${ctx.profile.current_salary.toLocaleString('en-IN')}/year` : 'not set'}
- Target role: ${ctx.profile?.target_role ?? 'not set'}
- Years of experience: ${ctx.profile?.years_experience ?? 'not set'}

Skills:
${Object.entries(skillsByCategory).map(([cat, skills]) => `  ${cat}: ${skills.join(', ')}`).join('\n') || '  None added yet'}

Job search: ${activeApps.length} active applications${offers.length ? `, ${offers.length} offer(s)` : ''}
Recent applications: ${ctx.applications.slice(0, 5).map(a => `${a.company} (${a.role}, ${a.status})`).join(', ') || 'none'}
${attemptedTopics.length ? `Interview quiz readiness: ${attemptedTopics.join(', ')}` : ''}
${ctx.codingStreak ? `Coding practice: ${ctx.codingStreak}-day streak — factor consistency into interview readiness` : ''}
${ctx.studyStreak ? `Study consistency: ${ctx.studyStreak}-day streak — factor into how prepared they are on fundamentals` : ''}

Question: ${question}`

  return askAI('career_mentor', context, `You are Vinay's personal career mentor — sharp, honest, and specific.
He is a frontend/testing engineer targeting senior+ roles.
Give concrete, actionable advice referencing his actual skills, experience, and quiz readiness.
If asked about readiness for a role, give a clear verdict with specific gaps to close.
For salary questions, give actual numbers. For learning paths, give a prioritised list.
Under 250 words. No generic platitudes.`)
}

export async function analyzeJobDescription(
  jobDescription: string,
  company: string,
  role: string,
  profile: CareerProfile | null
): Promise<JDAnalysis | null> {
  const prompt = `Job description for a ${role} role at ${company}:
"""
${jobDescription}
"""

Candidate profile:
- Current role: ${profile?.current_role ?? 'not set'}
- Target role: ${profile?.target_role ?? 'not set'}
- Years of experience: ${profile?.years_experience ?? 'not set'}
- Bio/focus: ${profile?.bio ?? 'not set'}

Analyze the fit and return ONLY a JSON object in this exact format:
{
  "requiredSkills": ["...", ...],
  "missingSkills": ["...", ...],
  "matchPercentage": 0,
  "priorityTopics": ["...", ...],
  "companyFocus": "..."
}

requiredSkills: the concrete skills/technologies this JD asks for.
missingSkills: the subset of requiredSkills the candidate likely lacks or is weak on, based on their profile above.
matchPercentage: your honest 0-100 estimate of how well the candidate profile matches this JD.
priorityTopics: 3-5 topics worth prepping first for this specific role, ordered by priority.
companyFocus: one or two sentences on what this company likely emphasizes in interviews for this kind of role.`

  const raw = await askAI('jd_analysis', prompt, 'You are a sharp technical recruiter and hiring manager. Return only valid JSON, no explanation, no markdown fences.')
  try {
    const match = raw.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch {
    return null
  }
}
