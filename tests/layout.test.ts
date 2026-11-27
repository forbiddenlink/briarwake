import { describe, expect, it } from 'vitest'
import { computeLayout, FIELD_PX, HUD_H, layoutKind } from '../src/layout'

describe('layoutKind', () => {
  it('picks the layout from viewport shape', () => {
    expect(layoutKind(390, 844)).toBe('portrait-phone')
    expect(layoutKind(844, 390)).toBe('landscape-phone')
    expect(layoutKind(1440, 900)).toBe('desktop')
    expect(layoutKind(768, 1024)).toBe('desktop')
    expect(layoutKind(1024, 600)).toBe('desktop')
  })
})

describe('computeLayout', () => {
  it('desktop keeps the framed window scale', () => {
    const l = computeLayout(1440, 900)
    expect(l.kind).toBe('desktop')
    expect(l.scale).toBeCloseTo((900 - 24) / 617, 5)
  })
  it('portrait phone fills the width with the square field', () => {
    const l = computeLayout(390, 844)
    expect(l.viewW).toBeCloseTo(390, 5)
    expect(l.viewH).toBeCloseTo(390, 5)
    expect(l.viewH + HUD_H).toBeLessThanOrEqual(844)
  })
  it('short portrait viewports are limited by height minus the strip', () => {
    expect(computeLayout(500, 400).kind).toBe('landscape-phone')
    const p = computeLayout(590, 600)
    expect(p.kind).toBe('portrait-phone')
    expect(p.viewH).toBeCloseTo(600 - HUD_H, 5)
    expect(p.viewW).toBeLessThanOrEqual(590)
  })
  it('landscape phone is height limited and drops chrome', () => {
    const l = computeLayout(844, 390)
    expect(l.viewH).toBeCloseTo(390, 5)
    expect(l.viewW).toBeLessThanOrEqual(844)
    expect(FIELD_PX * l.scale).toBeCloseTo(390, 5)
  })
  it('never leaves the clamp range', () => {
    expect(computeLayout(100, 100).scale).toBeGreaterThanOrEqual(0.3)
    expect(computeLayout(4000, 4000).scale).toBeLessThanOrEqual(3)
  })
})
