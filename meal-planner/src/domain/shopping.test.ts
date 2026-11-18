import { describe, it, expect } from 'vitest'
import { buildShoppingList } from './shopping'
import type { Aisle, Ingredient, PlanEntry, Recipe } from './types'

const AISLES: Aisle[] = ['produce', 'dairy-eggs', 'fish', 'bakery', 'pantry', 'frozen', 'other']

const recipe = (id: string, ingredients: Ingredient[]): Recipe => ({
  id,
  title: { sl: id, en: id },
  slots: ['lunch'],
  minutes: 10,
  nutrients: [],
  ingredients,
  steps: [],
  safety: { status: 'ok', reasons: [] },
})
const entry = (id: string, recipeId: string): PlanEntry => ({
  id,
  date: '2026-01-01',
  slot: 'lunch',
  recipeId,
})
const ing = (name: string, quantity: number, unit: Ingredient['unit'], aisle: Aisle = 'produce'): Ingredient => ({
  name,
  quantity,
  unit,
  aisle,
})

describe('buildShoppingList', () => {
  it('merges the same ingredient across units (g + kg)', () => {
    const r = [recipe('a', [ing('Spinach', 200, 'g')]), recipe('b', [ing('spinach ', 0.3, 'kg')])]
    const list = buildShoppingList([entry('1', 'a'), entry('2', 'b')], r)
    expect(list.produce).toEqual([{ name: 'Spinach', quantity: 500, unit: 'g', aisle: 'produce' }])
  })

  it('merges l into ml', () => {
    const r = [recipe('a', [ing('Milk', 0.25, 'l', 'dairy-eggs')]), recipe('b', [ing('milk', 250, 'ml', 'dairy-eggs')])]
    const list = buildShoppingList([entry('1', 'a'), entry('2', 'b')], r)
    expect(list['dairy-eggs']).toEqual([{ name: 'Milk', quantity: 500, unit: 'ml', aisle: 'dairy-eggs' }])
  })

  it('sums the same ingredient from two recipes', () => {
    const r = [recipe('a', [ing('Egg', 2, 'pcs', 'dairy-eggs')]), recipe('b', [ing('egg', 3, 'pcs', 'dairy-eggs')])]
    const list = buildShoppingList([entry('1', 'a'), entry('2', 'b')], r)
    expect(list['dairy-eggs']).toHaveLength(1)
    expect(list['dairy-eggs'][0].quantity).toBe(5)
  })

  it('doubles quantities when a recipe is planned twice', () => {
    const r = [recipe('a', [ing('Rice', 75, 'g', 'pantry')])]
    const list = buildShoppingList([entry('1', 'a'), entry('2', 'a')], r)
    expect(list.pantry[0].quantity).toBe(150)
  })

  it('returns every aisle as [] for empty entries', () => {
    const list = buildShoppingList([], [])
    for (const a of AISLES) expect(list[a]).toEqual([])
  })

  it('sorts items within an aisle by name', () => {
    const r = [recipe('a', [ing('Tomato', 1, 'pcs'), ing('Apple', 1, 'pcs'), ing('Leek', 1, 'pcs')])]
    const list = buildShoppingList([entry('1', 'a')], r)
    expect(list.produce.map((i) => i.name)).toEqual(['Apple', 'Leek', 'Tomato'])
  })

  it('ignores entries with unknown recipe ids', () => {
    const list = buildShoppingList([entry('1', 'nope')], [])
    expect(list.produce).toEqual([])
  })

  it('avoids floating point noise', () => {
    const r = [recipe('a', [ing('Flour', 0.1, 'kg', 'pantry')]), recipe('b', [ing('flour', 0.2, 'kg', 'pantry')])]
    const list = buildShoppingList([entry('1', 'a'), entry('2', 'b')], r)
    expect(list.pantry[0].quantity).toBe(300)
  })
})
