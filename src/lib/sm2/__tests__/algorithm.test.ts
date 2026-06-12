import { describe, it, expect } from 'vitest'
import { sm2Update, isDue } from '../algorithm'

describe('sm2Update', () => {
  const initial = { ease_factor: 2.5, interval: 1, repetitions: 0 }

  it('resets on quality < 3', () => {
    const result = sm2Update(initial, 2)
    expect(result.repetitions).toBe(0)
    expect(result.interval).toBe(1)
  })

  it('first successful review: interval = 1, repetitions = 1', () => {
    const result = sm2Update(initial, 4)
    expect(result.repetitions).toBe(1)
    expect(result.interval).toBe(1)
  })

  it('second successful review: interval = 6', () => {
    const after1 = sm2Update(initial, 4)
    const after2 = sm2Update(after1, 4)
    expect(after2.repetitions).toBe(2)
    expect(after2.interval).toBe(6)
  })

  it('ease_factor never drops below 1.3', () => {
    let state = initial
    for (let i = 0; i < 10; i++) state = sm2Update(state, 0)
    expect(state.ease_factor).toBeGreaterThanOrEqual(1.3)
  })

  it('next_review is a future date string', () => {
    const result = sm2Update(initial, 5)
    expect(result.next_review).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('isDue', () => {
  it('returns true for past dates', () => {
    expect(isDue('2020-01-01')).toBe(true)
  })

  it('returns false for future dates', () => {
    expect(isDue('2099-12-31')).toBe(false)
  })
})
