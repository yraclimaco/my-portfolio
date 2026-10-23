import { useEffect, useRef, useState } from 'react'
import { siSpotify } from 'simple-icons'
import { gsap } from '../lib/scroll'
import { useReducedMotion } from '../lib/motion'
import { Glyph } from './ui'
import { music } from '../content/beyond'

// A small waveform, kept as ambient decoration: heights are fixed (so it is a still picture under
// reduced motion), and the bars only breathe a little while the card is on screen.
const BARS = Array.from({ length: 26 }, (_, i) => {
  const h = 0.3 + 0.55 * Math.abs(Math.sin(i * 0.9)) * (0.62 + 0.38 * Math.sin(i * 0.27 + 1))
  return Math.round(h * 100) / 100
})
const VIEW_H = 32

function Waveform({ reduced }) {
  const ref = useRef(null)

  useEffect(() => {
    if (reduced || !ref.current) return
    const bars = [...ref.current.querySelectorAll('rect')]
    const tl = gsap.timeline({ paused: true })
    bars.forEach((bar, i) => {
      // Each bar swells or settles a little on its own slow rhythm.
      const dur = 1.7 + ((i * 7) % 11) * 0.17
      tl.to(
        bar,
        { scaleY: i % 3 === 0 ? 0.5 : i % 2 ? 1.38 : 0.68, duration: dur, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -((i * 5) % 9) * 0.37 },
        0,
      )
    })
    // Only moves while the card is on screen and the tab is in front.
    let visible = false
    const sync = () => (visible && !document.hidden ? tl.play() : tl.pause())
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    io.observe(ref.current)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      tl.kill()
      gsap.set(bars, { clearProps: 'transform' })
    }
  }, [reduced])

  return (
    <svg ref={ref} className="music__wave" viewBox={`0 0 ${BARS.length * 4} ${VIEW_H}`} aria-hidden="true" focusable="false">
      {BARS.map((h, i) => {
        const height = Math.max(3, h * VIEW_H)
        return <rect key={i} className={i % 6 === 2 ? 'is-warm' : undefined} x={i * 4 + 1} y={(VIEW_H - height) / 2} width="2" height={height} rx="1" />
      })}
    </svg>
  )
}

const RING = 2 * Math.PI * 20

// A short preview of the song. Nothing loads or plays until the button is pressed, only one clip
// plays at a time, and it stops on its own (or when the page is left or the tab is hidden).
function PreviewButton({ url, title, artist }) {
  const audio = useRef(null)
  const [state, setState] = useState('idle') // idle | loading | playing | error
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stop = () => audio.current?.pause()
    const onHide = () => document.hidden && stop()
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      if (audio.current) {
        audio.current.pause()
        audio.current.removeAttribute('src')
        audio.current = null
      }
    }
  }, [])

  const toggle = async () => {
    if (state === 'playing' || state === 'loading') {
      audio.current?.pause()
      return
    }
    let a = audio.current
    if (!a) {
      a = new Audio()
      a.preload = 'none'
      a.src = url
      a.addEventListener('playing', () => setState('playing'))
      a.addEventListener('pause', () => setState((s) => (s === 'error' ? s : 'idle')))
      a.addEventListener('ended', () => {
        setState('idle')
        setProgress(0)
      })
      a.addEventListener('timeupdate', () => setProgress(a.duration ? a.currentTime / a.duration : 0))
      a.addEventListener('error', () => setState('error'))
      audio.current = a
    }
    setState('loading')
    try {
      await a.play()
    } catch (err) {
      // A pause pressed during loading is not a failure; anything else is.
      if (err?.name !== 'AbortError') setState('error')
      else setState('idle')
    }
  }

  const on = state === 'playing' || state === 'loading'
  const label = state === 'error' ? 'Preview unavailable' : on ? 'Pause preview' : 'Play a short preview'
  return (
    <>
      <button type="button" className={`music__play is-${state}`} onClick={toggle} disabled={state === 'error'} aria-label={`${label}: ${title} by ${artist}`}>
        <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
          <circle className="music__play-ring" cx="24" cy="24" r="20" strokeDasharray={RING} strokeDashoffset={RING * (1 - progress)} transform="rotate(-90 24 24)" />
          {on ? (
            <g className="music__play-icon">
              <rect x="17.5" y="16" width="4.5" height="16" rx="1.5" />
              <rect x="26" y="16" width="4.5" height="16" rx="1.5" />
            </g>
          ) : (
            <path className="music__play-icon" d="M19.5 15.8v16.4c0 1 1.1 1.6 1.9 1.1l13-8.2c.8-.5.8-1.7 0-2.2l-13-8.2c-.8-.5-1.9.1-1.9 1.1z" />
          )}
        </svg>
      </button>
      <span className="sr-only" role="status">
        {state === 'error' ? 'The preview could not be played.' : ''}
      </span>
    </>
  )
}

// "On repeat": one song, picked by hand. It is a recommendation, not live listening data. The
// preview only plays when pressed. Edit the song in src/content/beyond.js.
export default function OnRepeat() {
  const reduced = useReducedMotion()
  const { heading, title, artist, artwork, trackUrl, previewUrl, profileUrl } = music

  return (
    <section className="music" aria-labelledby="music-title">
      <h2 className="music__heading" id="music-title">
        {heading}
      </h2>
      <div className="music__row">
        <div className="music__card">
          <figure className="music__art">
            <img src={artwork.src} alt={artwork.alt} width={artwork.width} height={artwork.height} loading="lazy" decoding="async" />
            {previewUrl && <PreviewButton url={previewUrl} title={title} artist={artist} />}
          </figure>
          <div className="music__body">
            <p className="music__song">{title}</p>
            <p className="music__artist">{artist}</p>
            {trackUrl && (
              <p className="music__links">
                <a className="hobby__link" href={trackUrl} target="_blank" rel="noopener">
                  Open in Spotify <Glyph name="external" size={14} />
                  <span className="sr-only">
                    ({title} by {artist}, opens in a new tab)
                  </span>
                </a>
              </p>
            )}
          </div>
          <Waveform reduced={reduced} />
        </div>
        {profileUrl && (
          <a className="music__profile" href={profileUrl} target="_blank" rel="noopener">
            <span className="music__profile-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d={siSpotify.path} />
              </svg>
            </span>
            <span className="music__profile-label">My Spotify</span>
            <span className="sr-only">profile (opens in a new tab)</span>
          </a>
        )}
      </div>
    </section>
  )
}
