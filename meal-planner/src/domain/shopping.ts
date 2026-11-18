import type { Aisle, Ingredient, PlanEntry, Recipe } from './types'

export interface ShoppingItem {
  name: string
  quantity: number
  unit: Ingredient['unit']
  aisle: Aisle
}

const AISLES: Aisle[] = ['produce', 'dairy-eggs', 'fish', 'bakery', 'pantry', 'frozen', 'other']

function normalise(quantity: number, unit: Ingredient['unit']): { quantity: number; unit: Ingredient['unit'] } {
  if (unit === 'kg') return { quantity: quantity * 1000, unit: 'g' }
  if (unit === 'l') return { quantity: quantity * 1000, unit: 'ml' }
  return { quantity, unit }
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function buildShoppingList(entries: PlanEntry[], recipes: Recipe[]): Record<Aisle, ShoppingItem[]> {
  const byId = new Map(recipes.map((r) => [r.id, r]))
  const merged = new Map<string, ShoppingItem>()

  for (const entry of entries) {
    const recipe = byId.get(entry.recipeId)
    if (!recipe) continue
    for (const ing of recipe.ingredients) {
      const { quantity, unit } = normalise(ing.quantity, ing.unit)
      const key = `${ing.name.trim().toLowerCase()}|${unit}`
      const existing = merged.get(key)
      if (existing) existing.quantity += quantity
      else merged.set(key, { name: ing.name, quantity, unit, aisle: ing.aisle })
    }
  }

  const result = Object.fromEntries(AISLES.map((a) => [a, [] as ShoppingItem[]])) as Record<Aisle, ShoppingItem[]>
  for (const item of merged.values()) {
    result[item.aisle].push({ ...item, quantity: round2(item.quantity) })
  }
  for (const a of AISLES) result[a].sort((x, y) => x.name.localeCompare(y.name))
  return result
}
