import { describe, expect, it } from 'vitest'
import { ENHANCED_MAX_WEAVERS, getLevelTuning, tickWeaverSpawn } from '../src/game/GameMode'

// Observed in original footage (youtube.com/watch?v=irQzOwsLlok) and the reference game
// port (youtube.com/watch?v=yG6W0hnXdPw): Orrin the Weaver never shares the screen
// with a second Weaver, and appearances in the same wave are 8-28s apart.

describe('Classic Weaver cadence', () => {
  it('holds the spawn timer while a Weaver is on screen', () => {
    const r = tickWeaverSpawn(0.5, 1, 1, 'classic')
    expect(r.timer).toBe(0.5)
    expect(r.spawn).toBe(false)
  })

  it('counts down and spawns once the screen is clear', () => {
    expect(tickWeaverSpawn(2, 1, 0, 'classic')).toEqual({ timer: 1, spawn: false })
    expect(tickWeaverSpawn(0.5, 1, 0, 'classic').spawn).toBe(true)
  })

  it('uses gaps in the observed range on wave 1 and keeps a floor later', () => {
    const w1 = getLevelTuning(1, 'classic')
    expect(w1.spiderMin).toBeGreaterThanOrEqual(6)
    expect(w1.spiderMax).toBeGreaterThanOrEqual(15)
    expect(w1.spiderMax).toBeLessThanOrEqual(25)

    const w12 = getLevelTuning(12, 'classic')
    expect(w12.spiderMin).toBeGreaterThanOrEqual(4)
    expect(w12.spiderMax).toBeGreaterThan(w12.spiderMin)
  })
})

describe('Enhanced Weaver cadence', () => {
  it('still stacks Weavers, up to two on screen', () => {
    expect(tickWeaverSpawn(0.5, 1, 1, 'enhanced').spawn).toBe(true)
    const held = tickWeaverSpawn(0.5, 1, ENHANCED_MAX_WEAVERS, 'enhanced')
    expect(held.spawn).toBe(false)
    expect(held.timer).toBe(0.5)
  })

  it('keeps its pre-calibration spawn window', () => {
    const e6 = getLevelTuning(6, 'enhanced')
    expect(e6.spiderMin).toBeCloseTo(3.8 * 0.82)
    expect(e6.spiderMax).toBeCloseTo(8.2 * 0.82)
  })
})
