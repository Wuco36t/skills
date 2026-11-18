import type { PlanEntry, Recipe, Slot } from './types'
import { weekDays } from './weeks'

const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner', 'snack']

/** Small seeded PRNG; returns floats in [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Propose recipes for empty (date, slot) cells of the week starting at `start`.
 * Only safe ('ok') recipes are used; existing entries are never touched.
 */
export function suggestWeek(
  start: string,
  existing: PlanEntry[],
  recipes: Recipe[],
  seed: number,
): Omit<PlanEntry, 'id'>[] {
  const rand = mulberry32(seed)
  const days = weekDays(start)
  const safe = recipes.filter((r) => r.safety.status === 'ok')

  // Working view of occupied cells: "date|slot" -> recipeId
  const occupied = new Map<string, string>()
  for (const e of existing) occupied.set(`${e.date}|${e.slot}`, e.recipeId)

  const prevDay = (i: number): string | undefined => {
    if (i > 0) return days[i - 1]
    const [y, m, d] = days[0].split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10)
  }

  const out: Omit<PlanEntry, 'id'>[] = []
  days.forEach((date, i) => {
    const prev = prevDay(i)!
    for (const slot of SLOTS) {
      if (occupied.has(`${date}|${slot}`)) continue
      const candidates = safe.filter((r) => r.slots.includes(slot))
      if (candidates.length === 0) continue

      const prevId = occupied.get(`${prev}|${slot}`)
      const usedToday = new Set(SLOTS.map((s) => occupied.get(`${date}|${s}`)))
      const tiers = [
        candidates.filter((r) => r.id !== prevId && !usedToday.has(r.id)),
        candidates.filter((r) => r.id !== prevId),
        candidates,
      ]
      const pool = tiers.find((t) => t.length > 0)!
      const pick = pool[Math.floor(rand() * pool.length)]
      occupied.set(`${date}|${slot}`, pick.id)
      out.push({ date, slot, recipeId: pick.id })
    }
  })
  return out
}
