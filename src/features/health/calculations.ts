import type { ActivityLevel, Gender, HealthMetric, HabitWithLogs } from './types'

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const KCAL_PER_KG_FAT = 7700
const MIN_SAFE_CALORIES = 1500

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIER[activityLevel]
}

export interface WeightLossPlan {
  dailyCalorieTarget: number
  proteinTargetG: number
  carbsG: number
  fatG: number
  weeklyLossKg: number
  weeklyDeficit: number
  expectedGoalDate: string
  daysRemaining: number
}

export function calculateWeightLossPlan(
  currentWeightKg: number,
  targetWeightKg: number,
  tdee: number,
  goalDeadline?: string | null
): WeightLossPlan {
  const weightToLoseKg = Math.max(0, currentWeightKg - targetWeightKg)
  const today = new Date()

  let weeklyLossKg: number
  let expectedGoalDate: Date

  if (goalDeadline) {
    const deadline = new Date(goalDeadline + 'T00:00:00')
    const weeksRemaining = Math.max(1, (deadline.getTime() - today.getTime()) / (7 * 86400000))
    weeklyLossKg = weightToLoseKg > 0 ? Math.min(1, weightToLoseKg / weeksRemaining) : 0
    expectedGoalDate = deadline
  } else {
    weeklyLossKg = weightToLoseKg > 0 ? Math.min(1, Math.max(0.4, weightToLoseKg * 0.01 * 7)) : 0
    const weeksNeeded = weeklyLossKg > 0 ? weightToLoseKg / weeklyLossKg : 0
    expectedGoalDate = new Date(today.getTime() + weeksNeeded * 7 * 86400000)
  }

  const dailyDeficit = (weeklyLossKg * KCAL_PER_KG_FAT) / 7
  const dailyCalorieTarget = Math.max(MIN_SAFE_CALORIES, Math.round(tdee - dailyDeficit))

  const proteinTargetG = Math.round(currentWeightKg * 2.0)
  const fatG = Math.round((dailyCalorieTarget * 0.25) / 9)
  const carbsG = Math.max(0, Math.round((dailyCalorieTarget - proteinTargetG * 4 - fatG * 9) / 4))

  const daysRemaining = Math.max(0, Math.round((expectedGoalDate.getTime() - today.getTime()) / 86400000))

  return {
    dailyCalorieTarget,
    proteinTargetG,
    carbsG,
    fatG,
    weeklyLossKg: Math.round(weeklyLossKg * 100) / 100,
    weeklyDeficit: Math.round(dailyDeficit * 7),
    expectedGoalDate: expectedGoalDate.toISOString().split('T')[0],
    daysRemaining,
  }
}

export interface SubScore {
  score: number
  reason: string
}

export interface HealthScoreBreakdown {
  overall: number
  nutrition: SubScore
  sleep: SubScore
  activity: SubScore
  consistency: SubScore
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n))
}

export function calculateHealthScore(
  todayMetric: HealthMetric | null,
  targets: { calories: number; protein: number; steps: number },
  habits: HabitWithLogs[],
  today: string
): HealthScoreBreakdown {
  // Nutrition
  let nutritionScore: number
  let nutritionReason: string
  if (todayMetric?.calories == null && todayMetric?.protein_g == null) {
    nutritionScore = 0
    nutritionReason = 'Nothing logged today — log calories and protein to see this score'
  } else {
    const calDelta = todayMetric?.calories != null ? Math.abs(todayMetric.calories - targets.calories) / targets.calories : 0.5
    const calScore = clamp(100 - calDelta * 150)
    const proteinScore = todayMetric?.protein_g != null ? clamp((todayMetric.protein_g / targets.protein) * 100) : 40
    nutritionScore = Math.round((calScore + proteinScore) / 2)
    const proteinGap = targets.protein - (todayMetric?.protein_g ?? 0)
    nutritionReason = proteinGap > 20
      ? `Protein is ${Math.round(proteinGap)}g below target`
      : calDelta > 0.15
        ? `Calories are ${Math.round(calDelta * 100)}% off target`
        : 'On track with today\'s nutrition targets'
  }

  // Sleep
  let sleepScore: number
  let sleepReason: string
  if (todayMetric?.sleep_hours == null) {
    sleepScore = 0
    sleepReason = 'Sleep not logged today'
  } else {
    const h = todayMetric.sleep_hours
    sleepScore = h >= 7 && h <= 9 ? 100 : clamp(100 - Math.abs(h - 8) * 20)
    sleepReason = h < 7 ? `${h}h is below the 7-9h target` : h > 9 ? `${h}h is above the 7-9h target` : 'Within the 7-9h target range'
  }

  // Activity
  let activityScore: number
  let activityReason: string
  const workoutDoneToday = habits.some(h => h.logs.some(l => l.date === today) && /gym|workout|run|walk/i.test(h.name))
  if (todayMetric?.steps == null) {
    activityScore = workoutDoneToday ? 50 : 0
    activityReason = workoutDoneToday ? 'Workout logged, but steps not tracked today' : 'Steps and workout not logged today'
  } else {
    const stepScore = clamp((todayMetric.steps / targets.steps) * 100)
    activityScore = Math.round(workoutDoneToday ? Math.min(100, stepScore + 15) : stepScore)
    activityReason = todayMetric.steps < targets.steps
      ? `${targets.steps - todayMetric.steps} steps short of today's ${targets.steps} target`
      : `Hit today's ${targets.steps} step target`
  }

  // Consistency — habit completion today across all tracked habits
  let consistencyScore: number
  let consistencyReason: string
  if (habits.length === 0) {
    consistencyScore = 0
    consistencyReason = 'No habits set up yet'
  } else {
    const doneToday = habits.filter(h => h.logs.some(l => l.date === today)).length
    consistencyScore = Math.round((doneToday / habits.length) * 100)
    consistencyReason = `${doneToday}/${habits.length} habits completed today`
  }

  const overall = Math.round(
    nutritionScore * 0.3 + activityScore * 0.25 + sleepScore * 0.25 + consistencyScore * 0.2
  )

  return {
    overall,
    nutrition: { score: nutritionScore, reason: nutritionReason },
    sleep: { score: sleepScore, reason: sleepReason },
    activity: { score: activityScore, reason: activityReason },
    consistency: { score: consistencyScore, reason: consistencyReason },
  }
}
