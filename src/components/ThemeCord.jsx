import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/scroll'
import { useReducedMotion } from '../lib/motion'
import { getTheme, setTheme, useTheme } from '../lib/theme'

const REST = 56 // where the bead hangs, in the drawing's units
const MAX_PULL = 26
const TRIGGER = 13

// A small pull-cord, like a lamp's. Drag it down and let go, or press it (click, tap, Enter,
// Space), to switch between day and night. One animation system owns the cord: GSAP drives
// `pull`, and the drawing is updated from it.
export default function ThemeCord() {
  const theme = useTheme()
  const reduced = useReducedMotion()
  const night = theme === 'dark'
  const cord = useRef(null)
  const bead = useRef(null)
  const btn = useRef(null)
  const pull = useRef({ v: 0 })
  const drag = useRef(null)
  const skipClick = useRef(false)
  const [said, setSaid] = useState('')

  const draw = () => {
    const v = pull.current.v
    cord.current?.setAttribute('d', `M20 4V${REST + v - 8}`)
    bead.current?.setAttribute('transform', `translate(0 ${v})`)
  }

  const springBack = () => {
    gsap.killTweensOf(pull.current)
    if (reduced) {
      pull.current.v = 0
      draw()
      return
    }
    gsap.to(pull.current, { v: 0, duration: 0.75, ease: 'elastic.out(1, 0.4)', onUpdate: draw })
  }

  const toggle = () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark'
    setTheme(next, { fade: !reduced })
    setSaid(next === 'dark' ? 'Night mode on' : 'Day mode on')
  }

  // A short tug for a press (as opposed to a drag).
  const tug = () => {
    if (reduced) return
    gsap.killTweensOf(pull.current)
    gsap
      .timeline()
      .to(pull.current, { v: 15, duration: 0.1, ease: 'power2.out', onUpdate: draw })
      .to(pull.current, { v: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', onUpdate: draw })
  }

  useEffect(() => () => gsap.killTweensOf(pull.current), [])

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    gsap.killTweensOf(pull.current)
    drag.current = { id: e.pointerId, y: e.clientY, moved: false }
    btn.current.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    const dy = e.clientY - d.y
    if (Math.abs(dy) > 4) d.moved = true
    // The cord gives a little and stops: it never pulls further than MAX_PULL.
    pull.current.v = MAX_PULL * (1 - Math.exp(-Math.max(0, dy) / MAX_PULL))
    draw()
  }
  const onPointerUp = (e) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    drag.current = null
    if (d.moved) {
      skipClick.current = true
      if (pull.current.v >= TRIGGER) toggle()
      springBack()
    }
  }
  const onPointerCancel = () => {
    drag.current = null
    springBack()
  }
  const onClick = () => {
    if (skipClick.current) {
      skipClick.current = false
      return
    }
    tug()
    toggle()
  }

  const label = night ? 'Switch to day mode' : 'Switch to night mode'
  return (
    <div className="cord">
      <button
        ref={btn}
        type="button"
        className="cord__btn"
        aria-label={label}
        title={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClick={onClick}
      >
        <svg viewBox="0 0 40 112" aria-hidden="true" focusable="false">
          <rect className="cord__mount" x="12" y="0" width="16" height="5" rx="2.5" />
          <path ref={cord} className="cord__line" d={`M20 4V${REST - 8}`} />
          <g ref={bead} className="cord__bead">
            <circle cx="20" cy={REST} r="10.5" />
            {/* The icon shows what a pull will switch to: a moon by day, a sun at night. */}
            {night ? (
              <g className="cord__icon">
                <circle cx="20" cy={REST} r="3.4" />
                <path d={`M20 ${REST - 7.4}v2M20 ${REST + 5.4}v2M12.6 ${REST}h2M25.4 ${REST}h2M14.8 ${REST - 5.2}l1.4 1.4M23.8 ${REST + 3.8}l1.4 1.4M14.8 ${REST + 5.2}l1.4-1.4M23.8 ${REST - 3.8}l1.4-1.4`} />
              </g>
            ) : (
              <path className="cord__icon cord__icon--fill" d={`M22.8 ${REST - 5.6}a6 6 0 1 0 2.6 8.6a5 5 0 0 1-2.6-8.6z`} />
            )}
          </g>
        </svg>
      </button>
      <span className="sr-only" role="status">
        {said}
      </span>
    </div>
  )
}
