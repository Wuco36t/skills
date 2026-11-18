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
})
