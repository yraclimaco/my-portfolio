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
