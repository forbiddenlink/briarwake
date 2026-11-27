import { type RefObject, useEffect, useState } from 'react'
import type { Engine } from '../game/Engine'

interface Hud {
  score: number
  bonus: number
  lives: number
  wave: number
}

interface PhoneHudProps {
  engineRef: RefObject<Engine | null>
  height: number
}

const EMPTY: Hud = { score: 0, bonus: 0, lives: 3, wave: 1 }

// Compact score strip for portrait phones, where the canvas side panel is
// cropped away. Polls the engine a few times a second; the numbers change
// slowly enough that this is cheaper than wiring per-frame React state.
export function PhoneHud({ engineRef, height }: PhoneHudProps) {
  const [hud, setHud] = useState<Hud>(EMPTY)

  useEffect(() => {
    const tick = () => {
      const next = engineRef.current?.hud()
      if (!next) return
      setHud((prev) =>
        prev.score === next.score &&
        prev.bonus === next.bonus &&
        prev.lives === next.lives &&
        prev.wave === next.wave
          ? prev
          : next
      )
    }
    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [engineRef])

  const cell = (label: string, value: string, color: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      <span style={{ fontSize: 9, letterSpacing: 1, color: '#8f979c' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color }}>{value}</span>
    </div>
  )

  return (
    <div
      data-testid="phone-hud"
      style={{
        height,
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr',
        alignItems: 'center',
        gap: 6,
        padding: '0 8px',
        background: '#1a1f22',
        borderBottom: '1px solid #3a4145',
        fontFamily: 'Verdana, Geneva, sans-serif',
        fontVariantNumeric: 'tabular-nums',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          font: 'italic 700 17px Georgia, serif',
          color: '#be8730',
          paddingRight: 4,
        }}
      >
        Briarwake
      </span>
      {cell('SCORE', String(hud.score), '#e8e8e8')}
      {cell('BONUS', String(hud.bonus), '#d3a43c')}
      {cell('LIVES', String(hud.lives), '#5ed8ef')}
      {cell('WAVE', String(hud.wave), '#db2e26')}
    </div>
  )
}
