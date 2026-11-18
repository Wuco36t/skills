import { checkSafety } from './safety'
import type { Ingredient, Recipe, SafetyResult, Slot } from './types'

export type ImportResult =
  | { ok: true; recipe: Omit<Recipe, 'id'> }
  | { ok: false; error: 'no-recipe-data' }

// Used when the page gives no usable duration.
const DEFAULT_MINUTES = 30
const DEFAULT_SLOTS: Slot[] = ['lunch', 'dinner']

type Json = unknown
type Obj = Record<string, Json>

const isObj = (v: Json): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

// Pure string extraction of ld+json blocks; nothing is ever injected into a DOM.
function extractJsonLd(html: string): Json[] {
  const out: Json[] = []
  const re = /<script\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script\s*>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    try {
      out.push(JSON.parse(m[1].trim()))
    } catch {
      // malformed block: skip
    }
  }
  return out
}

function isRecipeNode(n: Obj): boolean {
  const t = n['@type']
  return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'))
}

function findRecipe(node: Json, depth = 0): Obj | null {
  if (depth > 6) return null
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findRecipe(n, depth + 1)
      if (r) return r
    }
    return null
  }
  if (!isObj(node)) return null
  if (isRecipeNode(node)) return node
  return node['@graph'] !== undefined ? findRecipe(node['@graph'], depth + 1) : null
}

// ISO-8601 duration -> minutes (seconds ignored). Returns null if absent/zero/invalid.
export function parseDuration(v: Json): number | null {
  if (typeof v !== 'string') return null
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:\d+S)?)?$/i.exec(v.trim())
  if (!m) return null
  const total = Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
  return total > 0 ? total : null
}

function minutesOf(r: Obj): number {
  const total = parseDuration(r.totalTime)
  if (total) return total
  const sum = (parseDuration(r.cookTime) ?? 0) + (parseDuration(r.prepTime) ?? 0)
  return sum > 0 ? sum : DEFAULT_MINUTES
}

function stepsOf(v: Json): string[] {
  const out: string[] = []
  const walk = (n: Json): void => {
    if (typeof n === 'string') out.push(n)
    else if (Array.isArray(n)) n.forEach(walk)
    else if (isObj(n)) {
      if (n.itemListElement !== undefined) walk(n.itemListElement)
      else if (typeof n.text === 'string') out.push(n.text)
    }
  }
  walk(v)
  return out.map((s) => s.trim()).filter((s) => s.length > 0)
}

function slotsOf(v: Json): Slot[] {
  const text = (Array.isArray(v) ? v : [v]).filter((x) => typeof x === 'string').join(' ').toLowerCase()
  const found: Slot[] = []
  if (/breakfast|brunch|zajtrk/.test(text)) found.push('breakfast')
  if (/lunch|kosil/.test(text)) found.push('lunch')
  if (/dinner|supper|ve[cč]erj/.test(text)) found.push('dinner')
  if (/snack|dessert|prigrizek|prigrizk|sladic|desert/.test(text)) found.push('snack')
  return found.length > 0 ? found : [...DEFAULT_SLOTS]
}

const FRACTIONS: Record<string, number> = {
  '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125,
}

type Unit = Ingredient['unit']
const UNITS: Record<string, { unit: Unit; factor: number }> = {
  g: { unit: 'g', factor: 1 }, gr: { unit: 'g', factor: 1 }, gram: { unit: 'g', factor: 1 }, grams: { unit: 'g', factor: 1 },
  kg: { unit: 'kg', factor: 1 },
  ml: { unit: 'ml', factor: 1 },
  cl: { unit: 'ml', factor: 10 },
  dl: { unit: 'ml', factor: 100 },
  l: { unit: 'l', factor: 1 }, liter: { unit: 'l', factor: 1 }, litre: { unit: 'l', factor: 1 },
  liters: { unit: 'l', factor: 1 }, litres: { unit: 'l', factor: 1 },
  tbsp: { unit: 'tbsp', factor: 1 }, tablespoon: { unit: 'tbsp', factor: 1 }, tablespoons: { unit: 'tbsp', factor: 1 },
  'žlica': { unit: 'tbsp', factor: 1 }, 'žlice': { unit: 'tbsp', factor: 1 }, 'žlic': { unit: 'tbsp', factor: 1 },
  tsp: { unit: 'tsp', factor: 1 }, teaspoon: { unit: 'tsp', factor: 1 }, teaspoons: { unit: 'tsp', factor: 1 },
  'žlička': { unit: 'tsp', factor: 1 }, 'žličke': { unit: 'tsp', factor: 1 }, 'žličk': { unit: 'tsp', factor: 1 },
  pcs: { unit: 'pcs', factor: 1 }, pc: { unit: 'pcs', factor: 1 }, piece: { unit: 'pcs', factor: 1 },
  pieces: { unit: 'pcs', factor: 1 }, kos: { unit: 'pcs', factor: 1 }, kosa: { unit: 'pcs', factor: 1 },
  kosov: { unit: 'pcs', factor: 1 },
}

const FRAC_CLASS = Object.keys(FRACTIONS).join('')
const QTY_RE = new RegExp(
  `^(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?\\s?[${FRAC_CLASS}]?|[${FRAC_CLASS}])`,
)

function parseQuantity(s: string): number | null {
  const t = s.trim()
  let m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t)
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3])
  m = /^(\d+)\/(\d+)$/.exec(t)
  if (m) return Number(m[2]) === 0 ? null : Number(m[1]) / Number(m[2])
  m = new RegExp(`^(\\d+(?:[.,]\\d+)?)?\\s?([${FRAC_CLASS}])?$`).exec(t)
  if (m && (m[1] || m[2])) {
    return (m[1] ? Number(m[1].replace(',', '.')) : 0) + (m[2] ? FRACTIONS[m[2]] : 0)
  }
  return null
}

// A leading quantity is required. A recognised unit is converted/mapped; a
// quantity followed directly by a name ("1 onion") counts as pieces.
// Lines without a leading quantity are reported as unparsed.
export function parseIngredientLine(line: string): { ingredient: Ingredient; parsed: boolean } {
  const raw = line.trim()
  const fallback = {
    ingredient: { name: raw, quantity: 1, unit: 'pcs' as Unit, aisle: 'other' as const },
    parsed: false,
  }
  const qm = QTY_RE.exec(raw)
  if (!qm) return fallback
  const qty = parseQuantity(qm[1])
  if (qty === null || qty <= 0) return fallback
  let rest = raw.slice(qm[0].length).trim()
  let unit: Unit = 'pcs'
  let factor = 1
  const um = /^([\p{L}]+)\.?(?=\s|$)/u.exec(rest)
  if (um) {
    const u = UNITS[um[1].toLowerCase()]
    if (u) {
      unit = u.unit
      factor = u.factor
      rest = rest.slice(um[0].length).trim()
    }
  }
  const name = rest.replace(/^of\s+/i, '').trim()
  if (!name) return fallback
  return { ingredient: { name, quantity: qty * factor, unit, aisle: 'other' }, parsed: true }
}

const RANK: Record<SafetyResult['status'], number> = { ok: 0, check: 1, blocked: 2 }

export function parseRecipeFromHtml(html: string, sourceUrl: string): ImportResult {
  const none = { ok: false, error: 'no-recipe-data' } as const
  let recipe: Obj | null = null
  for (const block of extractJsonLd(html)) {
    recipe = findRecipe(block)
    if (recipe) break
  }
  if (!recipe) return none

  const name = typeof recipe.name === 'string' ? recipe.name.trim() : ''
  const lines = (Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient : [])
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (!name || lines.length === 0) return none

  const ingredients: Ingredient[] = []
  const parseReasons: string[] = []
  for (const line of lines) {
    const { ingredient, parsed } = parseIngredientLine(line)
    ingredients.push(ingredient)
    if (!parsed) parseReasons.push(`Could not parse ingredient: ${line}`)
  }

  const base = checkSafety(name, ingredients)
  let status = base.status
  if (parseReasons.length > 0 && RANK[status] < RANK.check) status = 'check'
  const safety: SafetyResult = { status, reasons: [...base.reasons, ...parseReasons] }

  return {
    ok: true,
    recipe: {
      title: { sl: name, en: name },
      slots: slotsOf(recipe.recipeCategory),
      minutes: minutesOf(recipe),
      nutrients: [],
      ingredients,
      steps: stepsOf(recipe.recipeInstructions),
      sourceUrl,
      safety,
    },
  }
}
