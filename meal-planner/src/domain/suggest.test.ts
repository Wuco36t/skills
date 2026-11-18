import { describe, it, expect } from 'vitest'
import { suggestWeek } from './suggest'
import { weekDays } from './weeks'
import type { PlanEntry, Recipe, Slot } from './types'

const ALL: Slot[] = ['breakfast', 'lunch', 'dinner', 'snack']

function recipe(id: string, slots: Slot[] = ALL, status: 'ok' | 'check' | 'blocked' = 'ok'): Recipe {
  return {
    id,
    title: { sl: id, en: id },
    slots,
    minutes: 10,
    nutrients: [],
    ingredients: [],
    steps: [],
    safety: { status, reasons: [] },
  }
}

const START = '2026-11-16'
const days = weekDays(START)
const recipes = [recipe('a'), recipe('b'), recipe('c')]
const many = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => recipe(id))

describe('suggestWeek', () => {
  it('fills all 28 empty slots in order', () => {
    const out = suggestWeek(START, [], recipes, 1)
    expect(out).toHaveLength(28)
    expect(out[0]).toMatchObject({ date: days[0], slot: 'breakfast' })
    expect(out[1].slot).toBe('lunch')
    expect(out[4].date).toBe(days[1])
  })

  it('never overwrites or duplicates existing entries', () => {
    const existing: PlanEntry[] = [{ id: 'x', date: days[0], slot: 'lunch', recipeId: 'a' }]
    const out = suggestWeek(START, existing, recipes, 1)
    expect(out).toHaveLength(27)
    expect(out.some((e) => e.date === days[0] && e.slot === 'lunch')).toBe(false)
  })

  it('only uses recipes whose slots include the slot', () => {
    const rs = [recipe('s', ['snack']), recipe('d', ['dinner'])]
    const out = suggestWeek(START, [], rs, 3)
    for (const e of out) {
      expect(e.slot === 'snack' ? e.recipeId === 's' : e.recipeId === 'd').toBe(true)
    }
    expect(out.some((e) => e.slot === 'breakfast')).toBe(false)
  })

  it('never suggests check or blocked recipes', () => {
    const rs = [recipe('ok'), recipe('c1', ALL, 'check'), recipe('b1', ALL, 'blocked')]
    const out = suggestWeek(START, [], rs, 5)
    expect(out.every((e) => e.recipeId === 'ok')).toBe(true)
  })

  it('leaves slots empty without candidates and does not throw', () => {
    expect(suggestWeek(START, [], [], 1)).toEqual([])
  })

  it('avoids same recipe in same slot on consecutive days', () => {
    for (let seed = 0; seed < 20; seed++) {
      const out = suggestWeek(START, [], recipes, seed)
      for (const slot of ALL) {
        const ids = out.filter((e) => e.slot === slot).map((e) => e.recipeId)
        for (let i = 1; i < ids.length; i++) expect(ids[i]).not.toBe(ids[i - 1])
      }
    }
  })

  it('considers existing entries on the previous day', () => {
    const existing: PlanEntry[] = [{ id: 'x', date: days[0], slot: 'dinner', recipeId: 'a' }]
    for (let seed = 0; seed < 20; seed++) {
      const out = suggestWeek(START, existing, recipes, seed)
      const d = out.find((e) => e.date === days[1] && e.slot === 'dinner')!
      expect(d.recipeId).not.toBe('a')
    }
  })

  it('avoids same recipe twice on a day when alternatives exist', () => {
    for (let seed = 0; seed < 20; seed++) {
      const out = suggestWeek(START, [], many, seed)
      for (const d of days) {
        const ids = out.filter((e) => e.date === d).map((e) => e.recipeId)
        expect(new Set(ids).size).toBe(ids.length)
      }
    }
  })

  it('repeats when only one candidate exists', () => {
    const out = suggestWeek(START, [], [recipe('only')], 1)
    expect(out).toHaveLength(28)
  })

  it('is deterministic per seed and varies across seeds', () => {
    expect(suggestWeek(START, [], recipes, 7)).toEqual(suggestWeek(START, [], recipes, 7))
    const outs = new Set(
      [1, 2, 3, 4, 5].map((s) => JSON.stringify(suggestWeek(START, [], recipes, s))),
    )
    expect(outs.size).toBeGreaterThan(1)
  })

  it('does not mutate inputs', () => {
    const existing: PlanEntry[] = [{ id: 'x', date: days[0], slot: 'lunch', recipeId: 'a' }]
    const e = JSON.stringify(existing)
    const r = JSON.stringify(recipes)
    suggestWeek(START, existing, recipes, 1)
    expect(JSON.stringify(existing)).toBe(e)
    expect(JSON.stringify(recipes)).toBe(r)
  })
})
