// Per-run counters shown on the game over screen. Written by Engine, read by UI.
export interface RunStats {
  shots: number
  hits: number
  kills: { thornworm: number; weaver: number; dripper: number; skitter: number; ufo: number }
  yummiesCollected: number
  yummiesMissed: number
  // Points earned in each wave, in order. The last entry is the wave the run ended on.
  waveScores: number[]
}

export function newRunStats(): RunStats {
  return {
    shots: 0,
    hits: 0,
    kills: { thornworm: 0, weaver: 0, dripper: 0, skitter: 0, ufo: 0 },
    yummiesCollected: 0,
    yummiesMissed: 0,
    waveScores: [],
  }
}

export function accuracyPercent(stats: RunStats): number {
  if (stats.shots <= 0) return 0
  return Math.round((Math.min(stats.hits, stats.shots) / stats.shots) * 100)
}
