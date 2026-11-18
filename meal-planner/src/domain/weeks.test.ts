import { describe, it, expect } from 'vitest'
import { weekStart, weekDays } from './weeks'

describe('weekStart', () => {
  it('maps a Wednesday to its Monday', () => {
    expect(weekStart('2026-11-18')).toBe('2026-11-16')
  })
  it('maps Sunday to the preceding Monday', () => {
    expect(weekStart('2026-11-22')).toBe('2026-11-16')
  })
  it('keeps a Monday unchanged', () => {
    expect(weekStart('2026-11-16')).toBe('2026-11-16')
  })
})

describe('weekDays', () => {
  it('returns 7 consecutive dates across a year boundary', () => {
    expect(weekDays('2026-12-28')).toEqual([
      '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31',
      '2027-01-01', '2027-01-02', '2027-01-03',
    ])
  })
})
