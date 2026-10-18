import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate, useRoutes } from 'react-router-dom'
import HexBoard from './components/HexBoard'
import BoxFallback from './components/BoxFallback'
import World from './components/World'
import Panel from './components/Panel'
import SiteHeader from './components/SiteHeader'
import { routes } from './routes'
import { HOME, destinationFor, destinations, sectionFor } from './content/board'
import { BOX_OPENED_KEY, PIECE_KEY, session } from './lib/session'
import { WIDE_QUERY } from './lib/layout'
import { useReducedMotion } from './lib/motion'
import { usePageMeta } from './lib/usePageMeta'
import { webglAvailable } from './lib/webgl'
import { HomeContext } from './lib/home'

function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => true,
  )
}

function BoardMeta() {
  usePageMeta(null)
  return null
}

const knownSpot = (id) => id === HOME || destinations.some((d) => d.id === id)

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const wide = useMedia(WIDE_QUERY)
  const section = sectionFor(location.pathname)
  // One continuous 3D world when the browser can draw it; the flat board and printed box otherwise.
  const [engine, setEngine] = useState(() => (webglAvailable() ? '3d' : '2d'))
  const onWorldFail = useCallback(() => setEngine('2d'), [])

  // ---- Box: shown once per session, only when the visit starts on the board.
  const [boxOpened, setBoxOpened] = useState(
    () =>
      section !== null ||
      session.get(BOX_OPENED_KEY) === '1' ||
      // Dev-only: lets headless screenshot tools start on the board. Removed from production builds.
      (import.meta.env.DEV && new URLSearchParams(location.search).has('nobox')),
  )
  const [revealKey, setRevealKey] = useState(0)
  const boxVisible = section === null && !boxOpened
  useEffect(() => {
    if (boxOpened) session.set(BOX_OPENED_KEY, '1')
  }, [boxOpened])

  // ---- Robber: where it rests, and whether its next move should travel.
  const [robber, setRobber] = useState(() => {
    const fromRoute = destinationFor(section)?.id
    const saved = session.get(PIECE_KEY)
    return { at: fromRoute ?? (knownSpot(saved) ? saved : HOME), travel: false, nonce: 0 }
  })
  useEffect(() => session.set(PIECE_KEY, robber.at), [robber.at])

  // ---- Panel: content for the current section, plus where focus should go next.
  const [panel, setPanel] = useState(() => (section ? { section, location, phase: 'shown' } : null))
  const [focusWant, setFocusWant] = useState(null)
  const [lastKey, setLastKey] = useState(location.key)

  // React to navigation while rendering (no effect round-trip).
  if (lastKey !== location.key) {
    setLastKey(location.key)
    if (section) {
      if (!boxOpened) setBoxOpened(true)
      if (!panel || panel.phase === 'leave') {
        setPanel({ section, location, phase: reduced ? 'shown' : 'enter' })
        setFocusWant({ to: 'panel', key: location.key })
      } else if (panel.section !== section) {
        setPanel({ section, location, phase: 'shown' })
        setFocusWant({ to: 'panel', key: location.key })
      } else {
        setPanel({ ...panel, location })
      }
      const dest = destinationFor(section)?.id
      if (dest && dest !== robber.at) setRobber({ at: dest, travel: true, nonce: robber.nonce + 1 })
    } else if (panel) {
      setPanel(reduced ? null : { ...panel, phase: 'leave' })
      setFocusWant({ to: 'board', key: location.key })
    }
  }

  // Focus placement once the new content (or the board) is actually in place.
  const focusDone = useRef(null)
  useEffect(() => {
    if (!focusWant || focusDone.current === focusWant.key) return
    let el = null
    if (focusWant.to === 'panel' && panel?.section === section && panel.phase !== 'leave') {
      el = document.querySelector('.panel:not(.panel--leave) #panel-title')
    } else if (focusWant.to === 'board' && !boxVisible && (!panel || panel.phase === 'leave')) {
      el = document.querySelector(`[data-dest="${robber.at}"]`) ?? document.getElementById('board-title')
    } else if (focusWant.to === 'board-title' && !boxVisible) {
      el = document.getElementById('board-title')
    }
    if (!el) return
    el.focus({ preventScroll: true })
    if (document.activeElement === el) focusDone.current = focusWant.key
  }, [focusWant, panel, section, robber.at, boxVisible])

  // Escape closes the panel.
  useEffect(() => {
    if (!panel || panel.phase === 'leave') return
    const onKey = (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented) navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel, navigate])

  const onPanelExited = useCallback(() => setPanel((p) => (p?.phase === 'leave' ? null : p)), [])

  // Dropping the robber on a destination: it has already settled there, so no travel.
  const onDrop = useCallback(
    (destId) => {
      const dest = destinationFor(destId)
      if (!dest) return
      setRobber((r) => (r.at === destId ? r : { at: destId, travel: false, nonce: r.nonce + 1 }))
      if (location.pathname !== dest.to) navigate(dest.to)
    },
    [location.pathname, navigate],
  )

  // Home: close any open content, then take the board back into the box (the reverse journey).
  const [homeDelay, setHomeDelay] = useState(0)
  const goHome = useCallback(() => {
    // Let the content surface start closing before the camera pulls back.
    setHomeDelay(panel && panel.phase !== 'leave' && !reduced ? 0.28 : 0)
    setBoxOpened(false)
    if (location.pathname !== '/') navigate('/')
  }, [panel, reduced, location.pathname, navigate])

  const onBoxOpened = useCallback(() => {
    setBoxOpened(true)
    setRevealKey((k) => k + 1)
    setFocusWant({ to: 'board-title', key: `box-${Date.now()}` })
  }, [])

  const panelElement = useRoutes(routes, panel?.location ?? location)
  const panelOpen = Boolean(panel && panel.phase !== 'leave')
  const focusDest = panel ? (destinationFor(panel.section)?.id ?? null) : null

  return (
    <HomeContext.Provider value={goHome}>
      {!boxVisible && (
        <a className="skip-link" href="#main">
          Skip to content
        </a>
      )}
      <div className="app" inert={engine === '2d' && boxVisible}>
        {/* The open content surface is modal: everything behind it is inert. */}
        <div className={`header-wrap${boxVisible ? ' is-intro' : ''}`} inert={panelOpen || boxVisible}>
          <SiteHeader />
        </div>
        <main id="main" tabIndex={-1}>
          {!section && <BoardMeta />}
          <div className="board-wrap" inert={panelOpen}>
            {engine === '3d' ? (
              <World
                intro={boxVisible}
                homeDelay={homeDelay}
                onOpened={onBoxOpened}
                robber={robber}
                panelOpen={panelOpen}
                focusDest={focusDest}
                reduced={reduced}
                onDrop={onDrop}
                onFail={onWorldFail}
              />
            ) : (
              <HexBoard robber={robber} focusDest={focusDest} panelOpen={panelOpen} reduced={reduced} onDrop={onDrop} revealKey={revealKey} />
            )}
          </div>
          {panel && (
            <Panel phase={panel.phase} section={panel.section} wide={wide} onExited={onPanelExited}>
              {panelElement}
            </Panel>
          )}
        </main>
      </div>
      {engine === '2d' && boxVisible && <BoxFallback onOpened={onBoxOpened} reducedMotion={reduced} />}
    </HomeContext.Provider>
  )
}
