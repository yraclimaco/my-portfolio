import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Glyph } from './ui'
import { profile } from '../content/profile'
import { SQRT3, roundedHexPath } from '../lib/hex'

// The intro's actions, shared by the 3D box and the static fallback.
export function BoxActions({ onOpen, actionsRef, className = '' }) {
  return (
    <div className={`box-actions ${className}`} ref={actionsRef}>
      <button type="button" className="btn btn--primary" onClick={onOpen}>
        Open portfolio
      </button>
      <Link className="btn btn--soft" to="/projects">
        View projects
      </Link>
      <Link className="btn btn--soft" to="/contact">
        Contact
      </Link>
      <a className="btn btn--soft" href={profile.resume} target="_blank" rel="noopener">
        Résumé
        <Glyph name="external" size={15} />
        <span className="sr-only">(PDF, opens in a new tab)</span>
      </a>
    </div>
  )
}

export function SkipIntro({ onSkip }) {
  return (
    <button type="button" className="box-skip" onClick={onSkip}>
      Skip intro <Glyph name="arrow" size={15} />
    </button>
  )
}

// Lid artwork: a seven-hex island in the board's terrain palette, with the robber.
const ISLAND = [
  [0, 0, '#f9eed4'],
  [0, -1, '#f2d48a'],
  [1, -1, '#dca088'],
  [1, 0, '#ecc3a9'],
  [0, 1, '#97b494'],
  [-1, 1, '#c6d8ac'],
  [-1, 0, '#97b494'],
]

function LidArt() {
  const s = 30
  const hex = roundedHexPath(s * 0.92, s * 0.18)
  const shore = roundedHexPath(s * 1.1, s * 0.34)
  const pos = ([q, r]) => [s * SQRT3 * (q + r / 2), s * 1.5 * r]
  return (
    <svg className="lid-art" viewBox="-110 -100 220 200" aria-hidden="true" focusable="false">
      <circle r="98" fill="#c4dbdc" opacity="0.22" />
      <g fill="#f3e7cc" opacity="0.95">
        {ISLAND.map((h) => {
          const [x, y] = pos(h)
          return <path key={`s${h[0]}${h[1]}`} d={shore} transform={`translate(${x} ${y})`} />
        })}
      </g>
      {ISLAND.map((h) => {
        const [x, y] = pos(h)
        return <path key={`${h[0]}${h[1]}`} d={hex} transform={`translate(${x} ${y})`} fill={h[2]} />
      })}
      <g transform="translate(-9 -24) scale(0.45)">
        <ellipse cx="20" cy="62" rx="16" ry="4" fill="#3b2c1f" opacity="0.25" />
        <path d="M15.4 20.5C14.6 26 12.6 31.5 10.6 37.4 8.4 44 7.4 49.5 7.6 54h24.8c.2-4.5-.8-10-3-16.6-2-5.9-4-11.4-4.8-16.9z" fill="#6a4c38" />
        <circle cx="20" cy="11.4" r="8.6" fill="#6a4c38" />
        <path d="M6.4 53.2h27.2c1.6 0 2.9 1.3 2.9 2.9v1.6c0 2.4-1.9 4.3-4.3 4.3H7.8c-2.4 0-4.3-1.9-4.3-4.3v-1.6c0-1.6 1.3-2.9 2.9-2.9z" fill="#4e3827" />
      </g>
    </svg>
  )
}

// A flat, printed version of the box for when WebGL is unavailable or fails to load.
export default function BoxFallback({ onOpened, reducedMotion }) {
  const rootRef = useRef(null)
  const lidRef = useRef(null)
  const actionsRef = useRef(null)
  const tlRef = useRef(null)
  const doneRef = useRef(false)
  const fallbackRef = useRef(null)
  const [opening, setOpening] = useState(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    clearTimeout(fallbackRef.current)
    onOpened()
  }

  const open = () => {
    if (tlRef.current) {
      tlRef.current.progress(1) // a second click skips the rest
      finish()
      return
    }
    if (reducedMotion) {
      finish()
      return
    }
    setOpening(true)
    // If animation frames stall (background tab, throttled device), open anyway.
    fallbackRef.current = setTimeout(finish, 1300)
    tlRef.current = gsap
      .timeline({ onComplete: finish })
      .to(actionsRef.current, { opacity: 0, y: 8, duration: 0.2, ease: 'power1.out' }, 0)
      .to(lidRef.current, { y: -12, scale: 1.02, duration: 0.22, ease: 'power2.out' }, 0)
      .to(lidRef.current, { y: -70, scale: 1.08, opacity: 0, duration: 0.42, ease: 'power2.in' }, 0.24)
      .to(rootRef.current, { opacity: 0, duration: 0.36, ease: 'power1.inOut' }, 0.46)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (tlRef.current) tlRef.current.progress(1)
      else finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(fallbackRef.current)
      tlRef.current?.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      className={`box-intro${opening ? ' is-opening' : ''}`}
      ref={rootRef}
      aria-labelledby="box-title"
      onClick={opening ? () => tlRef.current?.progress(1) : undefined}
    >
      <SkipIntro onSkip={finish} />
      <div className="box-intro__stage">
        <div className="game-box">
          <div className="game-box__lid" ref={lidRef}>
            <div className="game-box__hit" onClick={opening ? undefined : open} aria-hidden="true" />
            <div className="game-box__print">
              <LidArt />
              <div className="game-box__title-block">
                <p className="game-box__kicker">A portfolio in four destinations</p>
                <h1 id="box-title" className="game-box__title">
                  {profile.name}
                </h1>
                <p className="game-box__subtitle">{profile.focus}</p>
                <p className="game-box__audience">{profile.audienceLine}</p>
              </div>
            </div>
          </div>
        </div>

        <BoxActions onOpen={open} actionsRef={actionsRef} />
      </div>
    </section>
  )
}
