export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type Aisle =
  | 'produce'
  | 'dairy-eggs'
  | 'fish'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'other'

export type Nutrient =
  | 'iron'
  | 'folate'
  | 'calcium'
  | 'protein'
  | 'omega3'
  | 'b12'
  | 'fibre'

export type SafetyResult = {
  status: 'ok' | 'check' | 'blocked'
  reasons: string[]
}

export interface Ingredient {
  name: string
  quantity: number
  unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'tbsp' | 'tsp'
  aisle: Aisle
}

export interface Recipe {
  id: string
  title: { sl: string; en: string }
  slots: Slot[]
  minutes: number
  nutrients: Nutrient[]
  ingredients: Ingredient[]
  steps: string[]
  sourceUrl?: string
  safety: SafetyResult
}

export interface PlanEntry {
  id: string
  date: string // YYYY-MM-DD
  slot: Slot
  recipeId: string
}
