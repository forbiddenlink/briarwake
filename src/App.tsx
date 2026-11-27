import { useCallback, useEffect, useRef, useState } from 'react'
import { BriarwakeCanvas } from './components/BriarwakeCanvas'
import { Menu, type OverlayName } from './components/Menu'
import { Options } from './components/Options'
import { PhoneHud } from './components/PhoneHud'
import {
  AboutPanel,
  HowToPlayPanel,
  ScoresPanel,
  VerminPanel,
} from './components/panels/InfoPanels'
import { buildShareText, dayUrl, resolveDay } from './game/Daily'
import type { Engine, EngineSnapshot } from './game/Engine'
import {
  dailySeed,
  dateKey,
  insertScore,
  loadScores,
  type ScoreEntry,
  saveScores,
} from './game/HighScores'
import { newRunStats } from './game/RunStats'
import { computeLayout, FIELD_PX, GAME_H, GAME_W, HUD_H, type Layout, TITLE_BAR_H } from './layout'
import { type GameSettings, loadSettings, saveSettings } from './settings'

function isTestHarness(): boolean {
  return !!(window as unknown as { __BRIARWAKE_TEST__?: boolean }).__BRIARWAKE_TEST__
}

// Fixed at the desktop layout under the headless harness so captures keep their size.
function currentLayout(): Layout {
  if (isTestHarness()) return { ...computeLayout(1440, 900), scale: 1 }
  return computeLayout(window.innerWidth, window.innerHeight)
}

const initialSnapshot: EngineSnapshot = {
  mode: 'title',
  score: 0,
  highScore: 0,
  level: 1,
  seed: 0,
  cheated: false,
  stats: newRunStats(),
}

export default function App() {
  const [game, setGame] = useState<EngineSnapshot>(initialSnapshot)
  const [overlay, setOverlay] = useState<OverlayName | null>(null)
  const [settings, setSettings] = useState<GameSettings>(loadSettings)
  const [scores, setScores] = useState<ScoreEntry[]>(loadScores)
  const [layout, setLayout] = useState(currentLayout)
  const scale = layout.scale
  const phone = layout.kind === 'portrait-phone'
  const chrome = layout.kind === 'desktop'
  const [dpr, setDpr] = useState(() => window.devicePixelRatio || 1)
  const [newBest, setNewBest] = useState(false)
  const [shareNote, setShareNote] = useState('')
  // ?day=YYYY-MM-DD picks the challenge day; invalid or future days mean today.
  const [challengeDay] = useState(() => resolveDay(window.location.search, new Date()))
  const engineRef = useRef<Engine | null>(null)
  const dailyRef = useRef(false)
  const bestBeforeRunRef = useRef(0)
  const recordedRunRef = useRef<string | null>(null)
  const prevModeRef = useRef<EngineSnapshot['mode']>('title')

  useEffect(() => {
    const onResize = () => {
      setLayout(currentLayout())
      setDpr(window.devicePixelRatio || 1)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleSettings = useCallback((next: GameSettings) => {
    setSettings(next)
    saveSettings(next)
  }, [])

  const handleEngine = useCallback((engine: Engine | null) => {
    engineRef.current = engine
  }, [])

  const handleSnapshot = useCallback((state: EngineSnapshot) => setGame(state), [])

  // Record a finished run once, when the engine reports game over.
  useEffect(() => {
    if (game.mode !== 'gameover') return
    const runKey = `${game.seed}:${game.score}:${game.level}`
    if (recordedRunRef.current === runKey) return
    recordedRunRef.current = runKey
    setNewBest(!game.cheated && game.score > bestBeforeRunRef.current)
    if (game.cheated || game.score <= 0 || isTestHarness()) return
    setScores((prev) => {
      const next = insertScore(prev, {
        score: game.score,
        wave: game.level,
        mode: settings.gameMode,
        date: dateKey(new Date()),
        seed: game.seed,
        daily: dailyRef.current,
      })
      saveScores(next)
      return next
    })
  }, [game.mode, game.seed, game.score, game.level, game.cheated, settings.gameMode])

  const start = useCallback(
    (daily: boolean) => {
      engineRef.current?.startNewGame(daily ? dailySeed(challengeDay) : undefined)
    },
    [challengeDay]
  )
  const handleStart = useCallback(() => {
    setShareNote('')
    start(false)
  }, [start])
  const handleStartDaily = useCallback(() => {
    setShareNote('')
    start(true)
  }, [start])
  const handleResume = useCallback(() => engineRef.current?.resume(), [])
  const handleQuit = useCallback(() => engineRef.current?.abortToTitle(), [])
  const closeOverlay = useCallback(() => setOverlay(null), [])

  // Runs can start from a menu button or from Space inside the engine, so the
  // per-run bookkeeping hangs off the mode change rather than the button.
  // biome-ignore lint/correctness/useExhaustiveDependencies: fires on mode transitions only
  useEffect(() => {
    const prev = prevModeRef.current
    prevModeRef.current = game.mode
    if (game.mode === 'playing' && (prev === 'title' || prev === 'gameover')) {
      bestBeforeRunRef.current = game.highScore
      recordedRunRef.current = null
      dailyRef.current = game.seed === dailySeed(challengeDay)
      setNewBest(false)
    }
  }, [game.mode])

  const handleShare = useCallback(async () => {
    const text = buildShareText({
      day: challengeDay,
      score: game.score,
      wave: game.level,
      url: dayUrl(window.location.href, challengeDay),
    })
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Briarwake Daily', text })
        setShareNote('SHARED')
        return
      }
      await navigator.clipboard.writeText(text)
      setShareNote('COPIED')
    } catch (err) {
      // Closing the share sheet rejects with AbortError: not a failure.
      if (err instanceof DOMException && err.name === 'AbortError') return
      setShareNote('FAILED')
    }
  }, [challengeDay, game.score, game.level])

  const profile = settings.gameMode === 'classic' ? 'classic' : 'x'

  const frame = (
    <div
      style={{
        width: phone ? FIELD_PX : GAME_W,
        flex: '0 0 auto',
        transform: `scale(${scale})`,
        transformOrigin: phone ? 'top left' : 'center center',
        ...(chrome
          ? {
              border: '1px solid #6a6a6a',
              boxShadow: '0 14px 34px rgba(0,0,0,0.55)',
              background: '#d0d0d0',
            }
          : { background: '#000' }),
      }}
    >
      {chrome && (
        <div
          style={{
            height: TITLE_BAR_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(#e6e6e6, #bfbfbf)',
            borderBottom: '1px solid #8a8a8a',
            fontFamily: 'Verdana, Geneva, sans-serif',
            fontSize: 14,
            color: '#252525',
            userSelect: 'none',
          }}
        >
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: 7, display: 'flex', gap: 6 }}
          >
            {[
              ['#de6157', '#8a3a34'],
              ['#e2bb46', '#8f7327'],
              ['#55bf59', '#2f7a33'],
            ].map(([fill, edge]) => (
              <span
                key={fill}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: fill,
                  border: `1px solid ${edge}`,
                }}
              />
            ))}
          </div>
          {profile === 'classic' ? 'Briarwake' : 'Enhanced'}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: phone ? FIELD_PX : GAME_W,
          height: GAME_H,
          overflow: phone ? 'hidden' : undefined,
        }}
      >
        <BriarwakeCanvas
          width={GAME_W}
          height={GAME_H}
          settings={settings}
          pixelRatio={Math.min(4, dpr * scale)}
          uiBlocked={overlay !== null}
          onSnapshot={handleSnapshot}
          onEngine={handleEngine}
        />

        {game.mode !== 'playing' && overlay === null && (
          <Menu
            mode={game.mode}
            visualProfile={profile}
            score={game.score}
            highScore={game.highScore}
            level={game.level}
            seed={game.seed}
            daily={dailyRef.current}
            cheated={game.cheated}
            newBest={newBest}
            stats={game.stats}
            onStart={handleStart}
            onStartDaily={handleStartDaily}
            onResume={handleResume}
            onQuit={handleQuit}
            onOpen={setOverlay}
            onShare={handleShare}
            shareNote={shareNote}
          />
        )}

        {overlay === 'options' && (
          <Options settings={settings} onChange={handleSettings} onClose={closeOverlay} />
        )}
        {overlay === 'howto' && <HowToPlayPanel profile={profile} onClose={closeOverlay} />}
        {overlay === 'vermin' && <VerminPanel profile={profile} onClose={closeOverlay} />}
        {overlay === 'scores' && <ScoresPanel scores={scores} onClose={closeOverlay} />}
        {overlay === 'about' && <AboutPanel onClose={closeOverlay} />}
      </div>
    </div>
  )

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        // The frame is a fixed 800px wide and shrunk with transform, which does
        // not change layout size. An implicit auto column would grow to 800px
        // and start at x=0, pushing the scaled frame off-screen on phones.
        gridTemplateColumns: 'minmax(0, 1fr)',
        gridTemplateRows: 'minmax(0, 1fr)',
        placeItems: 'center',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {phone ? (
        <div style={{ width: layout.viewW }}>
          <PhoneHud engineRef={engineRef} height={HUD_H} />
          <div
            data-testid="play-area"
            style={{
              width: layout.viewW,
              height: layout.viewH,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {frame}
          </div>
        </div>
      ) : (
        frame
      )}
    </div>
  )
}
