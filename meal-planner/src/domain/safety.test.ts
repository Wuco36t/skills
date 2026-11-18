import { describe, expect, it } from 'vitest'
import { checkSafety } from './safety'
import type { Ingredient } from './types'

const ing = (name: string): Ingredient => ({
  name,
  quantity: 1,
  unit: 'pcs',
  aisle: 'other',
})

describe('checkSafety', () => {
  it('blocks chicken in English and Slovenian', () => {
    expect(checkSafety('Dinner', [ing('Chicken breast')]).status).toBe('blocked')
    expect(checkSafety('Večerja', [ing('piščančje prsi')]).status).toBe('blocked')
    expect(checkSafety('Večerja', [ing('Piščanec')]).status).toBe('blocked')
  })

  it('allows minced beef only in bolognese or lasagna', () => {
    expect(checkSafety('Spinach lasagna with beef', [ing('minced beef')]).status).toBe('ok')
    expect(checkSafety('Bolonjska omaka', [ing('mleto goveje meso')]).status).toBe('ok')
    expect(checkSafety('Beef stew', [ing('minced beef')]).status).toBe('blocked')
    expect(checkSafety('Lasagna', [ing('beef steak')]).status).toBe('blocked')
  })

  it('blocks unpasteurised dairy', () => {
    expect(checkSafety('x', [ing('surovo mleko')]).status).toBe('blocked')
    expect(checkSafety('x', [ing('nepasterizirano mleko')]).status).toBe('blocked')
    expect(checkSafety('x', [ing('Raw milk')]).status).toBe('blocked')
  })

  it('blocks raw sprouts and raw fish', () => {
    expect(checkSafety('x', [ing('raw sprouts')]).status).toBe('blocked')
    expect(checkSafety('x', [ing('sushi')]).status).toBe('blocked')
  })

  it('treats only brussels sprouts as ok sprouts', () => {
    expect(checkSafety('x', [ing('alfalfa sprouts')]).status).toBe('blocked')
    expect(checkSafety('x', [ing('sprouts')]).status).not.toBe('ok')
    expect(checkSafety('x', [ing('Brussels sprouts')]).status).toBe('ok')
  })

  it('flags items to check', () => {
    expect(checkSafety('x', [ing('smoked salmon')]).status).toBe('check')
    expect(checkSafety('x', [ing('dimljen losos')]).status).toBe('check')
    expect(checkSafety('x', [ing('brie')]).status).toBe('check')
    const r = checkSafety('x', [ing('mystery paste')])
    expect(r.status).toBe('check')
    expect(r.reasons.join(' ')).toContain('mystery paste')
  })

  it('does not misread champignon as ham', () => {
    expect(checkSafety('x', [ing('champignon')]).status).toBe('ok')
  })

  it('passes known-ok ingredients', () => {
    const r = checkSafety('Frittata', [ing('spinach'), ing('eggs'), ing('feta')])
    expect(r).toEqual({ status: 'ok', reasons: [] })
  })

  it('blocked wins over check', () => {
    expect(checkSafety('x', [ing('mystery paste'), ing('bacon')]).status).toBe('blocked')
  })

  it('does not let one harmless word make an ingredient ok', () => {
    const cases: [string, string][] = [
      ['cornish hen', 'blocked'], ['corn dog', 'check'], ['medium-rare steak', 'blocked'],
      ['porchetta', 'blocked'], ['rabbit stew with carrots', 'blocked'],
      ['duck with lemon', 'blocked'], ['salmon sashimi', 'blocked'], ['raw salmon', 'blocked'],
      ['surov losos', 'blocked'], ['soft-boiled egg', 'check'], ['runny egg', 'check'],
      ['mehko kuhano jajce', 'check'], ['surovo jajce', 'check'], ['raw egg', 'check'],
    ]
    for (const [name, status] of cases) {
      expect([name, checkSafety('Dinner', [ing(name)]).status]).toEqual([name, status])
    }
  })

  it('blocks the wider meat list in English and Slovenian', () => {
    const names = ['duck', 'goose', 'rabbit', 'veal', 'ribs', 'steak', 'salami', 'prosciutto',
      'pancetta', 'mortadella', 'pate', 'liver', 'chorizo', 'venison', 'kebab', 'burger',
      'meatballs', 'meat', 'mince', 'hot dog', 'frankfurter', 'hamburger', 'raca', 'gos',
      'zajec', 'teletina', 'rebra', 'salama', 'pašteta', 'jetra', 'divjačina', 'čevapčiči',
      'polpete', 'mesne kroglice', 'perutnina', 'meso', 'jagnječje', 'šunka', 'sunka', 'prsut']
    for (const name of names) {
      expect([name, checkSafety('Dinner', [ing(name)]).status]).toEqual([name, 'blocked'])
    }
  })

  it('handles Slovenian inflections and missing diacritics', () => {
    expect(checkSafety('x', [ing('surovega mleka')]).status).toBe('blocked')
    expect(checkSafety('x', [ing('piscanec')]).status).toBe('blocked')
  })

  it('minced-beef exemption only covers the beef word', () => {
    expect(checkSafety('Bolognese', [ing('minced beef and chicken')]).status).toBe('blocked')
    expect(checkSafety('Bolognese', [ing('ground beef, raw milk')]).status).toBe('blocked')
    expect(checkSafety('Beef stew', [ing('ground beef')]).status).toBe('blocked')
    expect(checkSafety('Spinach lasagna', [ing('ground beef')]).status).toBe('ok')
  })

  it('keeps ordinary starter ingredients ok', () => {
    const names = ['Spinach', 'feta', 'eggs', 'red lentils', 'carrots', 'potatoes',
      'salmon fillet', 'olive oil', 'rdeča leča', 'korenje', 'krompir', 'jajca', 'losos',
      'tomatoes', 'sweet potato', 'crni poper', '200 g fresh spinach', 'tomato paste']
    for (const name of names) {
      expect([name, checkSafety('x', [ing(name)]).status]).toEqual([name, 'ok'])
    }
  })
})
