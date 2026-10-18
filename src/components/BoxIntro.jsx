import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import BoxFallback, { BoxActions, SkipIntro } from './BoxFallback'
import { profile } from '../content/profile'

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
  } catch {
    return false
  }
}

// Where the full-screen board's island sits, relative to the intro (for the camera handoff).
function boardHandoff(container) {
  const stage = document.querySelector('.stage[data-island]')
  if (!stage || !container) return null
  const [x, y, s] = stage.dataset.island.split(' ').map(Number)
  const r = stage.getBoundingClientRect()
  const c = container.getBoundingClientRect()
  return { x: r.left - c.left + x, y: r.top - c.top + y, s }
}

// The opening screen: a real 3D game box. Its controls work from the first paint,
// whether or not the 3D scene has loaded, and a printed fallback covers missing WebGL.
export default function BoxIntro({ onOpened, reducedMotion }) {
  const [mode, setMode] = useState(() => (webglAvailable() ? 'loading' : 'fallback'))
  const [opening, setOpening] = useState(false)
  const rootRef = useRef(null)
  const sceneElRef = useRef(null)
  const topRef = useRef(null)
  const actionsRef = useRef(null)
  const sceneRef = useRef(null)
  const doneRef = useRef(false)
  const timerRef = useRef(null)
  const modeRef = useRef(mode)
  const openRef = useRef(null)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    clearTimeout(timerRef.current)
    onOpened()
  }, [onOpened])

  const open = () => {
    if (doneRef.current) return
    const scene = sceneRef.current
    // Reduced motion, or the scene is not up yet: go straight to the board.
    if (reducedMotion || modeRef.current !== 'ready' || !scene) {
      finish()
      return
    }
    if (opening) {
      scene.open({}) // already opening: jump to the end
      return
    }
    setOpening(true)
    // If frames stall (background tab, throttled device), enter anyway.
    timerRef.current = setTimeout(finish, 2400)
    scene.open({ fadeEl: rootRef.current, onDone: finish })
  }
  useLayoutEffect(() => {
    openRef.current = open
    modeRef.current = mode
  })

  // Tell the scene how much room the controls take, so the box sits clear of them.
  useLayoutEffect(() => {
    if (mode === 'fallback') return
    const el = sceneElRef.current
    const measure = () => {
      const h = el.getBoundingClientRect().height
      const a = actionsRef.current.getBoundingClientRect()
      el.dataset.reserveBottom = String(Math.round(h - a.top + 20))
      el.dataset.reserveTop = String(Math.round(topRef.current.getBoundingClientRect().bottom + 8))
      sceneRef.current?.relayout()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(actionsRef.current)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  // Load and run the scene.
  useEffect(() => {
    if (modeRef.current === 'fallback') return
    let cancelled = false
    let api = null
    const fail = () => {
      if (cancelled) return
      cancelled = true
      api?.dispose()
      api = sceneRef.current = null
      setMode('fallback')
    }
    // A slow connection should not hold the visitor on an empty table.
    const slow = setTimeout(() => !api && fail(), 6000)
    import('../three/boxScene')
      .then(({ createBoxScene }) =>
        createBoxScene({
          container: sceneElRef.current,
          reduced: reducedMotion,
          getHandoff: () => boardHandoff(sceneElRef.current),
          onFirstFrame: () => !cancelled && setMode('ready'),
          onContextLost: fail,
        }),
      )
      .then((a) => {
        if (cancelled) return a.dispose()
        api = sceneRef.current = a
        if (import.meta.env.DEV) window.__boxScene = a
        a.setOnBoxClick(() => openRef.current?.())
      })
      .catch(fail)
    return () => {
      cancelled = true
      clearTimeout(slow)
      api?.dispose()
      sceneRef.current = null
    }
    // The scene is created once; reduced motion is read at creation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Escape skips the intro (or the rest of the opening).
  useEffect(() => {
    if (mode === 'fallback') return
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, finish])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (mode === 'fallback') return <BoxFallback onOpened={onOpened} reducedMotion={reducedMotion} />

  return (
    <section className={`box3d is-${mode}${opening ? ' is-opening' : ''}`} ref={rootRef} aria-labelledby="box-title">
      <div className="box3d__scene" ref={sceneElRef} />
      <p className="box3d__loading" aria-hidden="true">
        Unpacking the box
      </p>
      <div className="box3d__top" ref={topRef}>
        <SkipIntro onSkip={finish} />
      </div>
      <div className="box3d__bottom">
        <h1 id="box-title" className="sr-only">
          {profile.name}: {profile.focus}
        </h1>
        <BoxActions onOpen={open} actionsRef={actionsRef} />
      </div>
    </section>
  )
}
