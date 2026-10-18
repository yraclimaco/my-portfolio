import { useRef, useState } from 'react'
import { Glyph } from '../components/ui'
import { profile } from '../content/profile'
import { MOTION_OK, finishIfStalled, gsap, useGSAP } from '../lib/scroll'
import { usePageMeta } from '../lib/usePageMeta'

// Official brand marks (single-path versions of the GitHub and LinkedIn logos).
const GITHUB_MARK =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
const LINKEDIN_MARK =
  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 4.892v6.449zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'

// Decorative: each card's title already names the destination.
function BrandMark({ d, color }) {
  return (
    <svg className="ccard__mark" viewBox="0 0 24 24" width="64" height="64" aria-hidden="true" focusable="false">
      <path d={d} fill={color} />
    </svg>
  )
}

function DocumentMark() {
  return (
    <svg className="ccard__mark" viewBox="0 0 48 48" width="64" height="64" aria-hidden="true" focusable="false">
      <path d="M12 5h17l9 9v29H12z" fill="#fdf8ee" stroke="#4f6e51" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M29 5v9h9" fill="none" stroke="#4f6e51" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M18 23h14M18 29h14M18 35h9" stroke="#9a5b41" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

// Copy with the async Clipboard API, falling back to the older selection-based copy.
async function copyText(text, node) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const range = document.createRange()
      range.selectNodeContents(node)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
      const ok = document.execCommand('copy')
      sel.removeAllRanges()
      return ok
    } catch {
      return false
    }
  }
}

export default function Contact() {
  usePageMeta('Contact', 'Contact Yra Climaco by email, LinkedIn, or GitHub, or view the résumé.')
  const root = useRef(null)
  const addressRef = useRef(null)
  const timer = useRef(null)
  const [status, setStatus] = useState(null) // null | 'copied' | 'failed'

  const copy = async () => {
    const ok = await copyText(profile.email, addressRef.current)
    if (!ok) {
      // Leave the address selected so a keyboard copy works straight away.
      const range = document.createRange()
      range.selectNodeContents(addressRef.current)
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
    setStatus(ok ? 'copied' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(null), ok ? 2200 : 6000)
  }

  // A brief, staggered entrance: the email first, then the three cards.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const tl = gsap
          .timeline({ delay: 0.1 })
          .from('.contact-hero > *', { opacity: 0, y: 10, duration: 0.45, stagger: 0.06, ease: 'power2.out' })
          .from('.ccard', { opacity: 0, y: 18, duration: 0.5, stagger: 0.08, ease: 'power3.out' }, 0.18)
        return finishIfStalled(tl)
      })
      return () => clearTimeout(timer.current)
    },
    { scope: root },
  )

  return (
    <div className="contact-page" ref={root}>
      <div className="contact-hero">
        <h1 id="panel-title" className="contact-hero__title" tabIndex={-1}>
          Contact
        </h1>
        <p className="contact-hero__intro">Email is the quickest way to reach me.</p>
        <p className="contact-hero__email" ref={addressRef}>
          {profile.email}
        </p>
        <div className="contact-hero__actions">
          <a className="btn btn--primary" href={`mailto:${profile.email}`}>
            <Glyph name="mail" size={16} /> Open email
          </a>
          <button type="button" className={`btn btn--soft contact-hero__copy${status === 'copied' ? ' is-copied' : ''}`} onClick={copy}>
            <Glyph name={status === 'copied' ? 'check' : 'page'} size={16} />
            {status === 'copied' ? 'Copied!' : 'Copy email'}
          </button>
        </div>
        <p className={`contact-hero__status${status ? ` is-${status}` : ''}`} role="status" aria-live="polite">
          {/* The button itself shows Copied!; this line announces it for screen readers. */}
          {status === 'copied' && <span className="sr-only">Email address copied to your clipboard.</span>}
          {status === 'failed' && 'Couldn’t copy automatically. The address is selected, so you can copy it yourself.'}
        </p>
      </div>

      <ul className="ccards" aria-label="Elsewhere">
        <li className="ccard">
          <BrandMark d={GITHUB_MARK} color="#181717" />
          <h2 className="ccard__title">
            <a className="ccard__link" href={profile.github} target="_blank" rel="noopener">
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h2>
          <p className="ccard__text">Explore my code.</p>
          <span className="ccard__hint" aria-hidden="true">
            github.com/yraclimaco <Glyph name="external" size={14} />
          </span>
        </li>
        <li className="ccard">
          <BrandMark d={LINKEDIN_MARK} color="#0A66C2" />
          <h2 className="ccard__title">
            <a className="ccard__link" href={profile.linkedin} target="_blank" rel="noopener">
              LinkedIn
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h2>
          <p className="ccard__text">Let’s connect.</p>
          <span className="ccard__hint" aria-hidden="true">
            linkedin.com/in/yra-climaco <Glyph name="external" size={14} />
          </span>
        </li>
        <li className="ccard">
          <DocumentMark />
          <h2 className="ccard__title">
            <a className="ccard__link" href={profile.resume} target="_blank" rel="noopener">
              Résumé
              <span className="sr-only"> (view the PDF in a new tab)</span>
            </a>
          </h2>
          <p className="ccard__text">View or download the PDF.</p>
          <div className="ccard__options">
            <span className="ccard__hint" aria-hidden="true">
              View PDF <Glyph name="external" size={14} />
            </span>
            <a className="ccard__download" href={profile.resume} download="Yra_Climaco_Resume.pdf">
              Download
            </a>
          </div>
        </li>
      </ul>

      <p className="contact-page__note">
        I’m looking for product analytics, data analytics, and data science opportunities.
        <span> Based in {profile.location}.</span>
      </p>
    </div>
  )
}
