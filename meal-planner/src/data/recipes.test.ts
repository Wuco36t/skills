import { describe, expect, it } from 'vitest'
import { starterRecipes } from './recipes'
import type { Slot } from '../domain/types'
import { checkSafety } from '../domain/safety'

const count = (slot: Slot) => starterRecipes.filter((r) => r.slots.includes(slot)).length

describe('starterRecipes', () => {
  it('has at least 60 recipes with unique kebab-case ids', () => {
    expect(starterRecipes.length).toBeGreaterThanOrEqual(60)
    const ids = starterRecipes.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('is structurally complete', () => {
    for (const r of starterRecipes) {
      expect(r.title.sl.length, r.id).toBeGreaterThan(2)
      expect(r.title.en.length, r.id).toBeGreaterThan(2)
      expect(r.slots.length, r.id).toBeGreaterThan(0)
      expect(r.nutrients.length, r.id).toBeGreaterThan(0)
      expect(r.minutes, r.id).toBeGreaterThan(0)
      expect(r.ingredients.length, r.id).toBeGreaterThan(0)
      for (const ing of r.ingredients) {
        expect(ing.name.length, r.id).toBeGreaterThan(0)
        expect(ing.quantity, `${r.id}/${ing.name}`).toBeGreaterThan(0)
      }
      expect(r.steps.length, r.id).toBeGreaterThanOrEqual(3)
      expect(r.steps.length, r.id).toBeLessThanOrEqual(6)
    }
  })

  it('every recipe is pregnancy-safe (status ok)', () => {
    for (const r of starterRecipes) {
      const res = checkSafety(r.title.en, r.ingredients)
      expect(res.status, `${r.id}: ${res.reasons.join('; ')}`).toBe('ok')
      expect(r.safety.status, r.id).toBe('ok')
    }
  })

  it('covers every slot', () => {
    expect(count('breakfast')).toBeGreaterThanOrEqual(10)
    expect(count('lunch')).toBeGreaterThanOrEqual(10)
    expect(count('dinner')).toBeGreaterThanOrEqual(10)
    expect(count('snack')).toBeGreaterThanOrEqual(8)
  })

  it('only bolognese or lasagna recipes may contain beef', () => {
    for (const r of starterRecipes) {
      if (/bolognese|lasagna/i.test(r.title.en)) continue
      for (const ing of r.ingredients) expect(ing.name, r.id).not.toMatch(/beef|govedin/i)
    }
  })
})
