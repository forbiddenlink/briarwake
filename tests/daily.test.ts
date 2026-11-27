import { describe, expect, it } from 'vitest'
import { buildShareText, dayUrl, parseDayKey, resolveDay } from '../src/game/Daily'

const today = new Date(2026, 10, 27, 9)

describe('parseDayKey', () => {
  it('accepts a real date', () => {
    expect(parseDayKey('2026-11-20')?.getDate()).toBe(20)
  })
  it('rejects malformed and impossible dates', () => {
    for (const bad of [
      '',
      'abc',
      '2026-1-2',
      '20261120',
      '2026-02-30',
      '2026-13-01',
      '2026-11-20x',
    ]) {
      expect(parseDayKey(bad)).toBeNull()
    }
  })
  it('accepts a leap day only in leap years', () => {
    expect(parseDayKey('2028-02-29')).not.toBeNull()
    expect(parseDayKey('2027-02-29')).toBeNull()
  })
})

describe('resolveDay', () => {
  it('uses a valid past day', () => {
    expect(resolveDay('?day=2026-11-01', today).getDate()).toBe(1)
  })
  it('uses today for missing or malformed values', () => {
    expect(resolveDay('', today)).toBe(today)
    expect(resolveDay('?foo=1', today)).toBe(today)
    expect(resolveDay('?day=nope', today)).toBe(today)
    expect(resolveDay('?day=', today)).toBe(today)
  })
  it('clamps a future day to today', () => {
    expect(resolveDay('?day=2099-01-01', today)).toBe(today)
    expect(resolveDay('?day=2026-11-28', today)).toBe(today)
  })
  it('keeps today itself', () => {
    expect(resolveDay('?day=2026-11-27', today).getDate()).toBe(27)
  })
})

describe('buildShareText', () => {
  const url = 'https://briarwake.vercel.app/?day=2026-11-27'
  it('has name, date, score, wave, emoji line and link', () => {
    const lines = buildShareText({ day: today, score: 12345, wave: 3, url }).split('\n')
    expect(lines).toEqual(['Briarwake Daily 2026-11-27', 'Score 12,345 · Wave 3', '🍄🍄🍄🐛', url])
  })
  it('caps the emoji line and floors bad numbers', () => {
    const text = buildShareText({ day: today, score: -5.9, wave: 40, url })
    expect(text).toContain('Score 0 ')
    expect(text.split('\n')[2]).toBe(`${'🍄'.repeat(8)}🐛`)
  })
  it('contains no em dash', () => {
    expect(buildShareText({ day: today, score: 1, wave: 1, url })).not.toContain('—')
  })
})

describe('dayUrl', () => {
  it('replaces any existing query and hash', () => {
    expect(dayUrl('https://briarwake.vercel.app/?x=1&day=2020-01-01#a', today)).toBe(
      'https://briarwake.vercel.app/?day=2026-11-27'
    )
  })
})
