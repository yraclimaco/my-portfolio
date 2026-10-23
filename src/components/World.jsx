import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SkipIntro } from './BoxFallback'
import { Glyph } from './ui'
import { HOME, destinations, destinationFor } from '../content/board'
import { profile } from '../content/profile'
import { getTheme, useTheme } from '../lib/theme'

// The 3D world: the intro box and the board it opens onto are one scene. The intro's words and
// controls are HTML laid over it and work before the scene has loaded. Labels are crisp HTML
// anchored to the 3D destinations, so they stay readable and keyboard focusable.
export default function World({ intro, homeDelay = 0, onOpened, robber, panelOpen, focusDest, reduced, onDrop, onFail }) {
  const navigate = useNavigate()
  // intro: the closed box. opening / closing: the journey in either direction. board: playing.
  const [phase, setPhase] = useState(intro ? 'intro' : 'board')
  const [ready, setReady] = useState(false)
  const rootRef = useRef(null)
  const sceneRef = useRef(null)
  const apiRef = useRef(null)
  const labels = useRef({})
  const titleRef = useRef(null)
  const actionsRef = useRef(null)
  const skipRef = useRef(null)
  const phaseRef = useRef(phase)
  const doneRef = useRef(!intro) // the board has been reached (guards double completion)
  const timerRef = useRef(null)
  const live = useRef({})
  const theme = useTheme()

  // The route and Home drive the world: arriving on a section shows the board, Home closes the box.
  const [lastIntro, setLastIntro] = useState(intro)
  if (lastIntro !== intro) {
    setLastIntro(intro)
    if (!intro && (phase === 'intro' || phase === 'closing')) setPhase('board')
    if (intro && (phase === 'board' || phase === 'opening')) setPhase(reduced ? 'intro' : 'closing')
  }

  const fadeEls = () => [titleRef.current, actionsRef.current, skipRef.current].filter(Boolean)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    clearTimeout(timerRef.current)
    setPhase('board')
    onOpened()
  }, [onOpened])

  const finishClose = useCallback(() => {
    clearTimeout(timerRef.current)
    doneRef.current = false
    setPhase('intro')
  }, [])

  // Keep the scene in step with the phase.
  const prevPhase = useRef(phase)
  useEffect(() => {
    const api = apiRef.current
    const from = prevPhase.current
    prevPhase.current = phase
    phaseRef.current = phase
    if (phase === 'board') {
      doneRef.current = true
      api?.toBoard()
    } else if (phase === 'intro') {
      doneRef.current = false
      api?.toIntro()
      // Back home: put focus on the box's title so the next step (Open portfolio) is one Tab away.
      if (from !== 'intro') document.getElementById('box-title')?.focus({ preventScroll: true })
    } else if (phase === 'closing') {
      clearTimeout(timerRef.current)
      if (!api) return void queueMicrotask(finishClose)
      // If frames stall, still land on the closed box.
      timerRef.current = setTimeout(() => api.toIntro(), 2600 + homeDelay * 1000)
      api.close({ delay: homeDelay, fadeEls: fadeEls(), onDone: finishClose })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const open = () => {
    const ph = phaseRef.current
    if (ph !== 'intro' && ph !== 'closing') return
    const api = apiRef.current
    doneRef.current = false
    clearTimeout(timerRef.current)
    // Reduced motion, or the scene is not up yet: go straight to the board view.
    if (!api || reduced) {
      api?.toBoard()
      finish()
      return
    }
    phaseRef.current = 'opening'
    setPhase('opening')
    // If frames stall (background tab, throttled device), land on the board anyway.
    timerRef.current = setTimeout(() => api.toBoard(), 2600)
    api.open({ fadeEls: fadeEls(), onDone: finish })
  }

  const skip = () => {
    if (phaseRef.current === 'closing') {
      if (apiRef.current) apiRef.current.toIntro()
      else finishClose()
      return
    }
    apiRef.current?.toBoard()
    finish()
  }

  useLayoutEffect(() => {
    live.current = { open, onDrop, navigate, panelOpen, robber }
  })

  // Create the scene once. It keeps running behind the content and is never rebuilt.
  useEffect(() => {
    let cancelled = false
    let api = null
    const fail = () => {
      if (cancelled) return
      cancelled = true
      api?.dispose()
      apiRef.current = api = null
      onFail()
    }
    const slow = setTimeout(() => !api && fail(), 8000)
    import('../three/world')
      .then(({ createWorld }) =>
        createWorld({
          container: sceneRef.current,
          bgEl: rootRef.current,
          reduced,
          opened: doneRef.current,
          robberAt: live.current.robber.at,
          night: getTheme() === 'dark',
          getLabel: (id) => labels.current[id] ?? null,
          getReserve: () => {
            const t = titleRef.current?.getBoundingClientRect()
            const a = actionsRef.current?.getBoundingClientRect()
            return { top: t ? t.bottom + 20 : 120, bottom: a ? window.innerHeight - a.top + 20 : 160 }
          },
          onFirstFrame: () => !cancelled && setReady(true),
          onContextLost: fail,
          onBoxClick: () => live.current.open(),
          onTileClick: (id) => live.current.navigate(destinationFor(id).to),
          onDrop: (id) => live.current.onDrop(id),
        }),
      )
      .then((a) => {
        if (cancelled) return a.dispose()
        api = apiRef.current = a
        // Catch up with anything that happened while it loaded.
        if (phaseRef.current === 'board' && a.phase !== 'board') a.toBoard()
        a.setRobber(live.current.robber.at, false)
        a.setPaused(live.current.panelOpen)
        a.setNight(getTheme() === 'dark', { animate: false })
        if (import.meta.env.DEV) window.__world = a
      })
      .catch(fail)
    return () => {
      cancelled = true
      clearTimeout(slow)
      api?.dispose()
      apiRef.current = null
    }
    // Created once; reduced motion is read at creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The robber follows the route (keyboard, header links, tile clicks, history).
  useEffect(() => {
    if (robber.nonce > 0) apiRef.current?.setRobber(robber.at, robber.travel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robber.nonce])

  // Day and night: the same scene, re-lit (no rebuild).
  useEffect(() => {
    apiRef.current?.setNight(theme === 'dark')
  }, [theme])

  // Nothing needs to move while content covers the board.
  useEffect(() => {
    apiRef.current?.setPaused(panelOpen)
  }, [panelOpen])

  // Keep the box clear of the title and the controls as they reflow.
  useLayoutEffect(() => {
    if (phase !== 'intro') return
    const ro = new ResizeObserver(() => apiRef.current?.relayout())
    if (titleRef.current) ro.observe(titleRef.current)
    if (actionsRef.current) ro.observe(actionsRef.current)
    return () => ro.disconnect()
  }, [phase])

  // Escape skips the intro (or the rest of the opening).
  useEffect(() => {
    if (phase === 'board') return
    const onKey = (e) => {
      if (e.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const onBoard = phase === 'board'

  return (
    <div ref={rootRef} className={`world3d is-${phase}${ready ? ' is-ready' : ''}`}>
      <div className="world3d__scene" ref={sceneRef} />

      <div className="world3d__board" inert={!onBoard}>
        {onBoard && (
          <h1 id="board-title" className="sr-only" tabIndex={-1}>
            {profile.name}: choose a destination, or drag the robber onto one
          </h1>
        )}
        <ul className="dests3d" aria-label="Destinations">
          {destinations.map((d) => (
            <li key={d.id}>
              <Link
                to={d.to}
                data-dest={d.id}
                ref={(el) => (labels.current[d.id] = el)}
                className={`dest3d${panelOpen && focusDest === d.id ? ' is-active' : ''}`}
                aria-current={panelOpen && focusDest === d.id ? 'page' : undefined}
              >
                <span className="dest__plaque">
                  <span className="dest__label">{d.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p ref={(el) => (labels.current.hint = el)} className={`hint3d${robber.at === HOME ? '' : ' is-away'}`} aria-hidden="true">
          <span>Drag to explore</span>
        </p>
      </div>

      {!onBoard && (
        <section className="world-intro" aria-labelledby="box-title">
          <div className="world-intro__skip" ref={skipRef}>
            <SkipIntro onSkip={skip} />
          </div>
          <header className="world-intro__title" ref={titleRef}>
            <h1 id="box-title" tabIndex={-1}>
              {profile.name}
            </h1>
            <p>{profile.focus}</p>
          </header>
          <div className="world-intro__actions" ref={actionsRef}>
            <button type="button" className="btn btn--lamp" onClick={open}>
              Open portfolio
            </button>
            <p className="world-intro__links">
              <Link to="/projects">View projects</Link>
              <Link to="/contact">Contact</Link>
              <a href={profile.resume} target="_blank" rel="noopener">
                Résumé <Glyph name="external" size={14} />
                <span className="sr-only">(PDF, opens in a new tab)</span>
              </a>
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
