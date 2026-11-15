import { describe, expect, it } from 'vitest'
import { CELL, SCORE } from '../src/game/Constants'
import { getWeaverDistance, getWeaverScore } from '../src/game/Enemies'

// The reference FAQ scores table lists "Scorpion 1500" with the note that
// 1500 is the most it is worth and closer kills score more; its tips section
// gives the same rule for "the Weaver". They are one enemy: Orrin the
// Weaver, the spider-style enemy.

describe('Orrin the Weaver proximity score', () => {
  it('is worth at most 1500, per the reference FAQ', () => {
    expect(getWeaverScore(0)).toBe(1500)
    expect(Math.max(SCORE.WEAVER_NEAR, SCORE.WEAVER_MED, SCORE.WEAVER_FAR)).toBe(1500)
  })

  it('gives higher score when closer to player', () => {
    expect(getWeaverScore(CELL)).toBe(SCORE.WEAVER_NEAR)
    expect(getWeaverScore(CELL * 3)).toBe(SCORE.WEAVER_MED)
    expect(getWeaverScore(CELL * 6)).toBe(SCORE.WEAVER_FAR)
    expect(getWeaverScore(CELL * 2)).toBe(SCORE.WEAVER_MED)
    expect(getWeaverScore(CELL * 4)).toBe(SCORE.WEAVER_FAR)
    expect(SCORE.WEAVER_NEAR).toBeGreaterThan(SCORE.WEAVER_MED)
    expect(SCORE.WEAVER_MED).toBeGreaterThan(SCORE.WEAVER_FAR)
  })

  it('uses center-to-center distance, so horizontal separation lowers the score too', () => {
    const player = { x: 100, y: 100, w: CELL, h: CELL }
    const horizontal = { x: 100 + CELL * 2, y: 100, w: CELL, h: CELL }
    const diagonal = { x: 100 + CELL * 2, y: 100 + CELL * 2, w: CELL, h: CELL }

    expect(getWeaverScore(getWeaverDistance(player, horizontal))).toBe(SCORE.WEAVER_MED)
    expect(getWeaverScore(getWeaverDistance(player, diagonal))).toBe(SCORE.WEAVER_MED)
  })
})

describe('Orrin the Weaver entry side', () => {
  it('comes in from the side away from the player', async () => {
    const { Spider } = await import('../src/game/Enemies')
    const { GRID } = await import('../src/game/GameConfig')
    const width = GRID.COLS * GRID.CELL
    for (const roll of [0.1, 0.9]) {
      const nearLeft = new Spider(1, () => roll, 20)
      expect(nearLeft.x).toBe(width)
      expect(nearLeft.vx).toBeLessThan(0)
      const nearRight = new Spider(1, () => roll, width - 20)
      expect(nearRight.x).toBeLessThan(0)
      expect(nearRight.vx).toBeGreaterThan(0)
    }
  })
})
