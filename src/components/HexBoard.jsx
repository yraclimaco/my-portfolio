import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Robber from './Robber'
import TerrainDefs from './TerrainDefs'
import { HOME, destinations, islandTiles } from '../content/board'
import { DEST_GLYPH_OPACITY, glyphFor, glyphInk } from '../content/terrain'
import { profile } from '../content/profile'
import { SQRT3, hash, hexDistance, hexToPixel, pointInHex, roundedHexPath } from '../lib/hex'
import { clamp } from '../lib/layout'

const ZOOM = 1.05

const island = new Map(islandTiles().map((t) => [`${t.q},${t.r}`, t]))

// The island, centred under the header (the name lives in the header, not over the board).
function computeLayout(W, H) {
  const ringOne = Math.min((W * 0.92) / (3 * SQRT3), (H * 0.86) / 5)
  const ringTwo = Math.min((W * 0.92) / (5 * SQRT3), (H * 0.9) / 8)
  const s = Math.min(ringOne, Math.max(ringTwo, 64), 122)
  const cx = W / 2
  const cy = H / 2

  // Cover the stage (plus room to pan when a panel is docked) with sea and land.
  const margin = Math.min(Math.max(W, H) * 0.45, 640) + s * 2
  const N = Math.ceil((Math.max(W, H) + margin * 2) / (1.5 * s)) + 2
  const hexes = []
  for (let q = -N; q <= N; q++) {
    for (let r = -N; r <= N; r++) {
      const p = hexToPixel(q, r, s)
      const x = cx + p.x
      const y = cy + p.y
      if (x < -margin || x > W + margin || y < -margin || y > H + margin) continue
      const d = hexDistance(q, r)
      const tile = island.get(`${q},${r}`)
      hexes.push({ q, r, x, y, d, terrain: tile?.terrain ?? (hash(q, r) > 0.5 ? 'sea' : 'sea2'), dest: tile?.dest })
    }
  }

  const dests = {}
  for (const h of hexes) {
    if (!h.dest) continue
    // The robber rests low in the hex, clear of the label above it.
    dests[h.dest] = { x: h.x, y: h.y, rest: { x: h.x, y: h.y + s * 0.7 } }
  }
  dests[HOME] = { x: cx, y: cy, rest: { x: cx, y: cy + s * 0.22 } }

  return { W, H, s, cx, cy, hexes, dests }
}

const Tile = memo(function Tile({ hex, paths, state }) {
  const land = hex.d <= 2
  const glyph = glyphFor(hex.terrain)
  const ink = glyphInk[glyph]
  return (
    <g transform={`translate(${hex.x.toFixed(1)} ${hex.y.toFixed(1)})`} className={`tile tile--${hex.terrain}${hex.dest ? ' tile--dest' : ''} ${state}`}>
      <g className="tile__lift">
        <path className="tile__base" d={land ? paths.land : paths.sea} fill={`url(#fill-${hex.terrain})`} />
        {(land || hash(hex.q + 7, hex.r - 3) > 0.62) && (
          <use
            href={`#glyph-${glyph}`}
            className="tile__glyph"
            transform={`scale(${paths.scale})`}
            color={ink.color}
            opacity={hex.dest ? DEST_GLYPH_OPACITY : ink.opacity}
          />
        )}
        {hex.dest && (
          <>
            <path className="tile__glow" d={paths.land} />
            <path className="tile__ring" d={paths.ring} />
          </>
        )}
      </g>
    </g>
  )
})

export default function HexBoard({ robber, focusDest, panelOpen, reduced, onDrop, revealKey }) {
  const stageRef = useRef(null)
  const robberRef = useRef(null)
  const liftRef = useRef(null)
  const shadowRef = useRef(null)
  const tweens = useRef([])
  const drag = useRef(null)
  const hoverRef = useRef(null)
  const settlingTo = useRef(null)
  const robberAt = useRef(robber.at)
  const xf = useRef({ tx: 0, ty: 0, k: 1 })

  const [size, setSize] = useState(null)
  const [hover, setHover] = useState(null)
  const [dragHover, setDragHover] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [revealing, setRevealing] = useState(false)

  // Measure the stage.
  useLayoutEffect(() => {
    const measure = () => {
      const r = stageRef.current.getBoundingClientRect()
      setSize((prev) => (prev && prev.W === Math.round(r.width) && prev.H === Math.round(r.height) ? prev : { W: Math.round(r.width), H: Math.round(r.height) }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stageRef.current)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(() => (size ? computeLayout(size.W, size.H) : null), [size])

  const paths = useMemo(() => {
    if (!layout) return null
    const { s } = layout
    return {
      land: roundedHexPath(s * 0.93, s * 0.22),
      sea: roundedHexPath(s * 0.95, s * 0.26),
      shore: roundedHexPath(s * 1.09, s * 0.36),
      ring: roundedHexPath(s * 0.83, s * 0.2),
      scale: (s / 100).toFixed(3),
    }
  }, [layout])

  const robberH = layout ? clamp(layout.s * 0.66, 44, 74) : 60
  const restOf = useCallback((id) => layout?.dests[id]?.rest ?? layout?.dests[HOME].rest, [layout])

  // While a section is open, the board leans in gently toward the chosen destination.
  const transform = useMemo(() => {
    if (!layout || !panelOpen || reduced) return { tx: 0, ty: 0, k: 1 }
    const d = layout.dests[focusDest] ?? layout.dests[HOME]
    return { tx: d.x * (1 - ZOOM), ty: d.y * (1 - ZOOM), k: ZOOM }
  }, [layout, panelOpen, focusDest, reduced])

  useLayoutEffect(() => {
    xf.current = transform
  }, [transform])

  const kill = () => {
    tweens.current.forEach((t) => t.kill())
    tweens.current = []
  }

  // Held in the hand: lifted, a touch larger, tilted slightly, with a wider, softer shadow.
  const pickUp = (tl, at = 0, duration = 0.14) =>
    tl
      .to(liftRef.current, { y: -12, scale: 1.06, rotation: -3.5, duration, ease: 'power2.out' }, at)
      .to(shadowRef.current, { scale: 1.45, opacity: 0.42, duration, ease: 'power2.out' }, at)

  // Set down like wood on a tabletop: a short drop, the shadow tightening as the base meets
  // the board, then a small wobble (pivoting on the base) that loses energy fast. ~370ms.
  const setDown = (tl, at = 0) =>
    tl
      .to(liftRef.current, { y: 0, scale: 1, duration: 0.13, ease: 'power2.in' }, at)
      .to(shadowRef.current, { scale: 1, opacity: 1, duration: 0.13, ease: 'power2.in' }, at)
      .to(
        liftRef.current,
        {
          keyframes: [
            { rotation: 2.8, duration: 0.06 },
            { rotation: -1.5, duration: 0.07 },
            { rotation: 0.55, duration: 0.07 },
            { rotation: 0, duration: 0.07 },
          ],
          easeEach: 'sine.inOut',
        },
        at + 0.1,
      )

  const timeline = () => {
    kill()
    const tl = gsap.timeline({ onComplete: () => (tweens.current = []) })
    tweens.current = [tl]
    return tl
  }

  const place = useCallback(
    (id) => {
      const p = restOf(id)
      if (!p || !robberRef.current) return
      kill()
      gsap.set(robberRef.current, { x: p.x, y: p.y })
      gsap.set(liftRef.current, { y: 0, scale: 1, rotation: 0 })
      gsap.set(shadowRef.current, { scale: 1, opacity: 1 })
    },
    [restOf],
  )

  // Clicking or tapping a tile: pick the robber up, carry it over, set it down.
  const travel = useCallback(
    (id) => {
      const p = restOf(id)
      if (!p) return
      const tl = timeline()
      pickUp(tl, 0, 0.12)
      tl.to(robberRef.current, { x: p.x, y: p.y, duration: 0.3, ease: 'power2.inOut' }, 0.04)
      setDown(tl, 0.3)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [restOf],
  )

  // Keep the robber on its space through resizes.
  useLayoutEffect(() => {
    if (layout && !drag.current) place(robberAt.current)
  }, [layout, place])

  // Respond to navigation: travel (click / keyboard) or stay put (drop already settled it).
  useLayoutEffect(() => {
    robberAt.current = robber.at
    if (!layout || robber.nonce === 0) return
    if (settlingTo.current === robber.at) {
      settlingTo.current = null
      return
    }
    if (robber.travel && !reduced) travel(robber.at)
    else place(robber.at)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robber.nonce])

  // Brief reveal when the box opens onto the board.
  useEffect(() => {
    if (!revealKey || reduced) return
    setRevealing(true)
    const t = setTimeout(() => setRevealing(false), 900)
    return () => clearTimeout(t)
  }, [revealKey, reduced])

  // ---------- Dragging ----------

  const toWorld = (clientX, clientY) => {
    const r = stageRef.current.getBoundingClientRect()
    const { tx, ty, k } = xf.current
    return { x: (clientX - r.left - tx) / k, y: (clientY - r.top - ty) / k }
  }

  const hitTest = (x, y) => {
    const by = y - robberH * 0.35
    for (const d of destinations) {
      const p = layout.dests[d.id]
      if (p && pointInHex(x, by, p.x, p.y, layout.s * 0.98)) return d.id
    }
    return null
  }

  const onPointerDown = (e) => {
    if (!layout || (e.pointerType === 'mouse' && e.button !== 0)) return
    e.preventDefault()
    const el = robberRef.current
    el.setPointerCapture(e.pointerId)
    const pos = { x: gsap.getProperty(el, 'x'), y: gsap.getProperty(el, 'y') }
    const w = toWorld(e.clientX, e.clientY)
    drag.current = { id: e.pointerId, offX: w.x - pos.x, offY: w.y - pos.y, sx: e.clientX, sy: e.clientY, moved: false }
    setDragging(true)
    if (!reduced) pickUp(timeline(), 0, 0.14)
    else kill()
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    e.preventDefault()
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) d.moved = true
    const w = toWorld(e.clientX, e.clientY)
    const x = w.x - d.offX
    const y = w.y - d.offY
    gsap.set(robberRef.current, { x, y })
    const hit = d.moved ? hitTest(x, y) : null
    if (hit !== hoverRef.current) {
      hoverRef.current = hit
      setDragHover(hit)
    }
  }

  const finish = (commit) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    const hit = commit && d.moved ? hoverRef.current : null
    hoverRef.current = null
    setDragHover(null)
    setDragging(false)
    const el = robberRef.current

    if (hit) {
      const p = restOf(hit)
      settlingTo.current = hit === robberAt.current ? null : hit
      if (reduced) place(hit)
      else {
        // Snap gently onto the resting spot, then set it down.
        const tl = timeline()
        tl.to(el, { x: p.x, y: p.y, duration: 0.16, ease: 'power2.out' }, 0)
        setDown(tl, 0.06)
      }
      onDrop(hit)
    } else if (d.moved) {
      // Not a destination: glide back to the last resting place.
      const p = restOf(robberAt.current)
      if (reduced) place(robberAt.current)
      else {
        timeline()
          .to(el, { x: p.x, y: p.y, duration: 0.36, ease: 'power2.out' }, 0)
          .to(liftRef.current, { y: 0, scale: 1, rotation: 0, duration: 0.32, ease: 'power2.out' }, 0)
          .to(shadowRef.current, { scale: 1, opacity: 1, duration: 0.32, ease: 'power2.out' }, 0)
      }
    } else {
      // A tap or click on the robber itself: set it back down and point out where it can go.
      if (reduced) place(robberAt.current)
      else setDown(timeline(), 0)
      setPulse(true)
      setTimeout(() => setPulse(false), 1100)
    }
  }

  const tileState = (hex) => {
    if (!hex.dest) return ''
    const c = []
    if (hover === hex.dest || dragHover === hex.dest) c.push('is-hot')
    if (panelOpen && focusDest === hex.dest) c.push('is-active')
    if (dragging || pulse) c.push('is-target')
    return c.join(' ')
  }

  const land = layout?.hexes.filter((h) => h.d <= 2) ?? []
  const sea = layout?.hexes.filter((h) => h.d > 2) ?? []
  const worldStyle = { transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.k})` }

  return (
    <div
      ref={stageRef}
      className={`stage${dragging ? ' is-dragging' : ''}${revealing ? ' is-revealing' : ''}${reduced ? ' is-reduced' : ''}${layout && layout.s < 86 ? ' is-compact' : ''}`}
      style={layout ? { '--s': `${layout.s}px`, '--robber-h': `${robberH}px` } : undefined}
    >
      <div className="world" style={worldStyle}>
        {layout && (
          <svg className="map" width={layout.W} height={layout.H} aria-hidden="true" focusable="false">
            <TerrainDefs />
            <g className="map__sea">
              {sea.map((h) => (
                <Tile key={`${h.q},${h.r}`} hex={h} paths={paths} state="" />
              ))}
            </g>
            <g className="map__shore" filter="url(#shore-shadow)">
              {land.map((h) => (
                <path key={`${h.q},${h.r}`} d={paths.shore} transform={`translate(${h.x.toFixed(1)} ${h.y.toFixed(1)})`} />
              ))}
            </g>
            <g className="map__land" filter="url(#land-shadow)">
              {land.map((h) => (
                <Tile key={`${h.q},${h.r}`} hex={h} paths={paths} state={tileState(h)} />
              ))}
            </g>
          </svg>
        )}

        {layout && (
          <ul className="dests" aria-label="Destinations">
            {destinations.map((d) => {
              const p = layout.dests[d.id]
              const hot = hover === d.id || dragHover === d.id
              return (
                <li key={d.id}>
                  <Link
                    to={d.to}
                    data-dest={d.id}
                    className={`dest dest--${d.terrain}${hot ? ' is-hot' : ''}${panelOpen && focusDest === d.id ? ' is-active' : ''}`}
                    style={{ left: p.x, top: p.y }}
                    aria-current={panelOpen && focusDest === d.id ? 'page' : undefined}
                    onPointerEnter={() => setHover(d.id)}
                    onPointerLeave={() => setHover((h) => (h === d.id ? null : h))}
                    onFocus={() => setHover(d.id)}
                    onBlur={() => setHover((h) => (h === d.id ? null : h))}
                  >
                    <span className="dest__plaque">
                      <span className="dest__label">{d.label}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {layout && robber.at === HOME && !dragging && (
          <p className="hint-pill" style={{ left: layout.cx, top: layout.cy + layout.s * 0.6 }} aria-hidden="true">
            Drag to explore
          </p>
        )}

        <div
          ref={robberRef}
          className="robber"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => finish(true)}
          onPointerCancel={() => finish(false)}
          onLostPointerCapture={() => finish(false)}
          aria-hidden="true"
        >
          <span className="robber__shadow" ref={shadowRef} />
          <span className="robber__lift" ref={liftRef}>
            <Robber height={robberH} />
          </span>
        </div>
      </div>

      <h1 id="board-title" className="sr-only" tabIndex={-1}>
        {profile.name}: choose a destination, or drag the robber onto one
      </h1>
    </div>
  )
}
