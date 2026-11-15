import { describe, expect, it } from 'vitest'
import { CHEATS, continuesCheat, feedCheatBuffer } from '../src/game/Cheats'

function type(text: string) {
  let buffer = ''
  let word: string | null = null
  for (const letter of text) {
    const fed = feedCheatBuffer(buffer, letter)
    buffer = fed.buffer
    if (fed.word) word = fed.word
  }
  return { buffer, word }
}

describe('Cheat words', () => {
  it('recognizes every word from the reference game', () => {
    for (const word of Object.keys(CHEATS)) {
      expect(type(word).word).toBe(word)
    }
  })

  it('ignores case and leading noise, and clears after a match', () => {
    expect(type('xxrattle')).toEqual({ buffer: '', word: 'RATTLE' })
  })

  it('does not fire on a partial word', () => {
    expect(type('LANTER').word).toBeNull()
  })

  it('knows when P is part of a word rather than the resume key', () => {
    expect(continuesCheat('LAN', 'T')).toBe(true)
    expect(continuesCheat('', 'P')).toBe(true) // PRISM starts with P
    expect(continuesCheat('PRI', 'S')).toBe(true)
    expect(continuesCheat('', 'Q')).toBe(false)
  })
})
