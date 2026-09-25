import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { nav, profile } from '../data'

export function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.4, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.4, ease: 'power3' })
    const move = (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY) }
    const over = (e) => {
      const hot = e.target.closest && e.target.closest('a, button, [data-hover]')
      gsap.to(ring.current, { scale: hot ? 1.7 : 1, duration: 0.3, overwrite: 'auto' })
      ring.current.classList.toggle('hot', !!hot)
    }
    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  )
}

function ThemeToggle() {
  const icon = useRef(null)
  const toggle = () => {
    const root = document.documentElement
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
    root.classList.add('theme-anim')
    root.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch { /* storage unavailable */ }
    gsap.fromTo(icon.current, { rotate: -90, scale: 0.4 }, { rotate: 0, scale: 1, duration: 0.5, ease: 'back.out(2)' })
    setTimeout(() => root.classList.remove('theme-anim'), 600)
  }
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle light and dark mode">
      <span ref={icon}>
        <svg className="moon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        <svg className="sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </span>
    </button>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="nav">
        <a href="#top" className="nav-logo">
          {profile.initials}
          <span>.</span>
        </a>
        <nav className="nav-links">
          {nav.map((n, i) => (
            <a href={`#${n.id}`} key={n.id}>
              <small>0{i + 1}</small>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <ThemeToggle />
          <a className="nav-cta" href={profile.resume} target="_blank" rel="noreferrer">
            Résumé ↗
          </a>
          <button
            className={`nav-burger${open ? ' open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <div className={`mobile-menu${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        {nav.map((n) => (
          <a href={`#${n.id}`} key={n.id}>
            {n.label}
          </a>
        ))}
      </div>
    </>
  )
}

export function Marquee({ items, outline }) {
  const track = useRef(null)
  useEffect(() => {
    const tween = gsap.to(track.current, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 })
    return () => tween.kill()
  }, [])
  const row = [...items, ...items]
  return (
    <div className={`marquee${outline ? ' marquee--outline' : ''}`}>
      <div className="marquee-track" ref={track}>
        {[0, 1].map((k) => (
          <div className="marquee-set" key={k}>
            {row.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SectionLabel({ n, children, light }) {
  return (
    <div className={`section-label${light ? ' light' : ''}`} data-reveal>
      <span>0{n}</span>
      <span>{children}</span>
    </div>
  )
}
