import { dateKey } from './HighScores'

const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

// Parse a YYYY-MM-DD string into a local Date at noon, or null when the text
// is malformed or names a day that does not exist (2026-02-30).
export function parseDayKey(text: string): Date | null {
  const m = DAY_RE.exec(text)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const date = new Date(y, mo - 1, d, 12)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  return date
}

// Resolve the `?day=` query value to the challenge day. Missing, malformed or
// invalid values give today; a future day clamps to today.
export function resolveDay(search: string, today: Date): Date {
  const raw = new URLSearchParams(search).get('day')
  const parsed = raw === null ? null : parseDayKey(raw.trim())
  if (!parsed) return today
  return dateKey(parsed) > dateKey(today) ? today : parsed
}

export interface ShareInput {
  day: Date
  score: number
  wave: number
  url: string
}

function emojiLine(wave: number): string {
  const n = Math.max(1, Math.min(8, Math.floor(wave)))
  return `${'🍄'.repeat(n)}🐛`
}

// Compact, plain-text result card plus a link that opens the same day.
export function buildShareText({ day, score, wave, url }: ShareInput): string {
  return [
    `Briarwake Daily ${dateKey(day)}`,
    `Score ${Math.max(0, Math.floor(score)).toLocaleString('en-US')} · Wave ${wave}`,
    emojiLine(wave),
    url,
  ].join('\n')
}

// Link to a given day's challenge on the current origin and path.
export function dayUrl(base: string, day: Date): string {
  const u = new URL(base)
  u.search = ''
  u.hash = ''
  u.searchParams.set('day', dateKey(day))
  return u.toString()
}
