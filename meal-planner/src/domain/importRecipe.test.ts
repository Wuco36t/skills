import { describe, expect, it } from 'vitest'
import { parseRecipeFromHtml } from './importRecipe'
import * as fx from './__fixtures__/recipePages'

const URL = 'https://example.com/r'
const ok = (html: string) => {
  const r = parseRecipeFromHtml(html, URL)
  if (!r.ok) throw new Error('expected ok')
  return r.recipe
}

describe('parseRecipeFromHtml', () => {
  it('parses a plain ld+json recipe', () => {
    const r = ok(fx.plainRecipe)
    expect(r.title).toEqual({ sl: 'Lentil soup', en: 'Lentil soup' })
    expect(r.minutes).toBe(75)
    expect(r.steps).toEqual(['Fry the onion.', 'Add lentils and stock.', 'Simmer.'])
    expect(r.ingredients.map((i) => [i.name, i.quantity, i.unit, i.aisle])).toEqual([
      ['red lentils', 200, 'g', 'other'],
      ['vegetable stock', 1, 'l', 'other'],
      ['olive oil', 2, 'tbsp', 'other'],
      ['onion', 1, 'pcs', 'other'],
    ])
    expect(r.slots).toEqual(['lunch'])
    expect(r.nutrients).toEqual([])
    expect(r.sourceUrl).toBe(URL)
  })

  it('finds a recipe inside @graph with array @type; cook+prep time', () => {
    const r = ok(fx.graphRecipe)
    expect(r.title.en).toBe('Oat porridge')
    expect(r.minutes).toBe(15)
    expect(r.slots).toEqual(['breakfast'])
    expect(r.steps).toEqual(['Cook the oats in the milk.'])
  })

  it('returns no-recipe-data when there is no Recipe', () => {
    expect(parseRecipeFromHtml(fx.noRecipe, URL)).toEqual({ ok: false, error: 'no-recipe-data' })
    expect(parseRecipeFromHtml(fx.noLd, URL)).toEqual({ ok: false, error: 'no-recipe-data' })
    expect(parseRecipeFromHtml(fx.noIngredients, URL)).toEqual({ ok: false, error: 'no-recipe-data' })
    expect(parseRecipeFromHtml(fx.noName, URL)).toEqual({ ok: false, error: 'no-recipe-data' })
  })

  it('skips a malformed block and uses the good one; defaults', () => {
    const r = ok(fx.malformedThenGood)
    expect(r.title.en).toBe('Toast')
    expect(r.minutes).toBe(30)
    expect(r.slots).toEqual(['lunch', 'dinner'])
  })

  it('marks unknown ingredients as check', () => {
    expect(ok(fx.plainRecipe).safety.status).toBe('check')
  })

  it('blocks chicken', () => {
    expect(ok(fx.chickenRecipe).safety.status).toBe('blocked')
  })

  it('parses fractions, decimal commas, dl, žlica; unparseable lines are never ok', () => {
    const r = ok(fx.howToRecipe)
    expect(r.minutes).toBe(120)
    const [flour, milk, salt, love, oil] = r.ingredients
    expect(flour).toMatchObject({ name: 'flour', quantity: 1.5, unit: 'kg' })
    expect(milk).toMatchObject({ name: 'milk', quantity: 250, unit: 'ml' })
    expect(salt).toMatchObject({ name: 'salt', quantity: 0.5, unit: 'tsp' })
    expect(love).toMatchObject({ name: 'a pinch of love', quantity: 1, unit: 'pcs' })
    expect(oil).toMatchObject({ name: 'olja', quantity: 3, unit: 'tbsp' })
    expect(r.safety.status).not.toBe('ok')
    expect(r.safety.reasons).toContain('Could not parse ingredient: a pinch of love')
  })

  it('reads HowToStep and HowToSection instructions', () => {
    expect(ok(fx.howToRecipe).steps).toEqual(['Mix.', 'Heat pan.', 'Fry.'])
  })
})
