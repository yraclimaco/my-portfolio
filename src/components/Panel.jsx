import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Glyph } from './ui'
import { destinationFor, destinations } from '../content/board'
import { profile } from '../content/profile'
import { useGoHome } from '../lib/home'

const EXIT_MS = 300
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'

// The content surface: a modal that takes over most of the screen once a destination is chosen.
export default function Panel({ phase, section, wide, onExited, children }) {
  const ref = useRef(null)
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const goHome = useGoHome()
  const dest = destinationFor(section)

  // Grow out of the destination tile: use its on-screen position as the transform origin.
  useLayoutEffect(() => {
    const el = ref.current
    const tile = document.querySelector(`[data-dest="${section}"]`)
    if (!el || !tile) return
    const t = tile.getBoundingClientRect()
    // offsetLeft/Top ignore the entrance transform, so the origin is measured from the final layout.
    el.style.setProperty('--ox', `${t.left + t.width / 2 - el.offsetLeft}px`)
    el.style.setProperty('--oy', `${t.top + t.height / 2 - el.offsetTop}px`)
    // Only on entry; later section switches keep the surface where it is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // New section: start at the top of its content.
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [section])

  // Keep keyboard focus inside the surface while it is open.
  useEffect(() => {
    if (phase === 'leave') return
    const el = ref.current
    const onKey = (e) => {
      if (e.key !== 'Tab') return
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => !n.closest('[inert]') && n.getClientRects().length)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || !el.contains(document.activeElement))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [phase])

  useEffect(() => {
    if (phase !== 'leave') return
    const el = ref.current
    const done = (e) => {
      if (!e || e.target === el) onExited()
    }
    el.addEventListener('animationend', done)
    const fallback = setTimeout(done, EXIT_MS + 150)
    return () => {
      clearTimeout(fallback)
      el.removeEventListener('animationend', done)
    }
  }, [phase, onExited])

  return (
    <div className={`overlay overlay--${wide ? 'wide' : 'full'} is-${phase}`}>
      <div className="overlay__scrim" onClick={() => navigate('/')} aria-hidden="true" />
      <section
        ref={ref}
        className={`panel panel--${wide ? 'wide' : 'full'} panel--${phase}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        inert={phase === 'leave'}
      >
        <div className="panel__bar">
          <Link to="/" className="panel__back">
            <Glyph name="back" size={18} />
            Back to board
          </Link>
          <button type="button" className="panel__home" onClick={goHome}>
            <Glyph name="home" size={17} />
            Home
            <span className="sr-only">: back to the game box</span>
          </button>
          <nav className="panel__tabs" aria-label="Sections">
            {destinations.map((d) => (
              <NavLink key={d.id} to={d.to} className={`panel__tab panel__tab--${d.terrain}`}>
                <span className="panel__tab-dot" aria-hidden="true" />
                {d.label}
              </NavLink>
            ))}
          </nav>
          <a className="panel__resume" href={profile.resume} target="_blank" rel="noopener">
            Résumé
            <Glyph name="external" size={15} />
            <span className="sr-only">(PDF, opens in a new tab)</span>
          </a>
        </div>
        <div className={`panel__scroll panel__scroll--${dest?.terrain ?? 'desert'}`} ref={scrollRef} data-panel-scroll>
          <div className="panel__content" key={section}>
            {children}
          </div>
        </div>
      </section>
    </div>
  )
}
