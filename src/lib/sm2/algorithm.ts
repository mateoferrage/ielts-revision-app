export interface SM2State {
  ease_factor: number
  interval: number
  repetitions: number
}

export interface SM2Result extends SM2State {
  next_review: string
}

export function sm2Update(state: SM2State, quality: number): SM2Result {
  let { ease_factor, interval, repetitions } = state

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * ease_factor)
    }
    repetitions += 1
  }

  ease_factor = Math.max(
    1.3,
    ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )

  const next = new Date()
  next.setDate(next.getDate() + interval)
  const next_review = next.toISOString().split('T')[0]

  return { ease_factor, interval, repetitions, next_review }
}

export function isDue(next_review: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return next_review <= today
}
