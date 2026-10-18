import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Robber from './Robber'
import { Glyph } from './ui'
import { profile } from '../content/profile'
import { useGoHome } from '../lib/home'

const links = [
  { to: '/projects', label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/skills', label: 'Skills' },
  { to: '/about', label: 'About' },
  { to: '/beyond-data', label: 'Beyond Data' },
  { to: '/contact', label: 'Contact' },
]

// Home returns to the closed game box (not just the board), so it is a button, not a link.
function HomeButton({ className = '', onDone }) {
  const goHome = useGoHome()
  return (
    <button
      type="button"
      className={`nav-link nav-link--home ${className}`}
      onClick={() => {
        onDone?.()
        goHome()
      }}
    >
      <Glyph name="home" size={16} />
      Home
      <span className="sr-only">: back to the game box</span>
    </button>
  )
}

function ResumeLink({ className = '' }) {
  return (
    <a className={`nav-link nav-link--resume ${className}`} href={profile.resume} target="_blank" rel="noopener">
      Résumé
      <Glyph name="external" size={14} />
      <span className="sr-only">(PDF, opens in a new tab)</span>
    </a>
  )
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector('a')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointer = (e) => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <Robber height={22} className="brand__robber" />
          <span className="brand__name">{profile.name}</span>
          <span className="sr-only">, back to the board</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list">
            <li>
              <HomeButton />
            </li>
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className="nav-link">
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li>
              <ResumeLink />
            </li>
          </ul>
        </nav>

        <div className="site-header__compact">
          <ResumeLink />
          <button
            ref={buttonRef}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="menu-button__icon" aria-hidden="true">
              <span />
              <span />
            </span>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <nav id="mobile-nav" className="mobile-nav" aria-label="Primary" ref={panelRef} hidden={!open}>
        <ul className="mobile-nav__list">
          <li>
            <HomeButton onDone={() => setOpen(false)} />
          </li>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className="nav-link" onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
