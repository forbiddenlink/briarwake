// Viewport layout math. Pure, so it can be unit tested without a DOM.

export const GAME_W = 800
export const GAME_H = 592
// The playfield is square: the right-hand 208px of the canvas is the score panel.
export const FIELD_PX = 592
export const TITLE_BAR_H = 22
export const FRAME_W = GAME_W + 2
export const FRAME_H = GAME_H + TITLE_BAR_H + 3
const MARGIN = 12
const MARGIN_SMALL = 6
// Height of the DOM score strip shown above the field on portrait phones.
export const HUD_H = 40

export type LayoutKind = 'desktop' | 'landscape-phone' | 'portrait-phone'

export interface Layout {
  kind: LayoutKind
  scale: number
  // CSS px of the game viewport after scaling (what the player sees).
  viewW: number
  viewH: number
}

const clampScale = (s: number) => Math.max(0.3, Math.min(3, s))

export function layoutKind(vw: number, vh: number): LayoutKind {
  if (vw < 600 && vh >= vw) return 'portrait-phone'
  if (vh < 500 && vw > vh) return 'landscape-phone'
  return 'desktop'
}

export function computeLayout(vw: number, vh: number): Layout {
  const kind = layoutKind(vw, vh)
  if (kind === 'portrait-phone') {
    // Only the square field is shown, edge to edge; the strip sits above it.
    const s = clampScale(Math.min(vw / FIELD_PX, (vh - HUD_H) / FIELD_PX))
    return { kind, scale: s, viewW: FIELD_PX * s, viewH: FIELD_PX * s }
  }
  if (kind === 'landscape-phone') {
    // No window chrome: field plus side panel fill the short screen.
    const s = clampScale(Math.min(vw / GAME_W, vh / GAME_H))
    return { kind, scale: s, viewW: GAME_W * s, viewH: GAME_H * s }
  }
  const margin = vw < 600 ? MARGIN_SMALL : MARGIN
  const s = clampScale(Math.min((vw - margin * 2) / FRAME_W, (vh - margin * 2) / FRAME_H))
  return { kind, scale: s, viewW: FRAME_W * s, viewH: FRAME_H * s }
}
