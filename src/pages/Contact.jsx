import { useState } from 'react'
import { Glyph } from '../components/ui'
import { profile } from '../content/profile'
import { usePageMeta } from '../lib/usePageMeta'

export default function Contact() {
  usePageMeta('Contact', 'Contact Yra Climaco by email or LinkedIn.')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      setCopied(false)
    }
  }

  const rows = [
    { label: 'LinkedIn', value: 'linkedin.com/in/yra-climaco', href: profile.linkedin },
    { label: 'GitHub', value: 'github.com/yraclimaco', href: profile.github },
    { label: 'Résumé', value: 'Yra_Climaco_Resume.pdf', href: profile.resume, note: 'PDF' },
  ]

  return (
    <div className="section">
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Contact
        </h1>
        <p className="section__lead">I’m looking for product analytics, data analytics, and data science opportunities. Email is the quickest way to reach me.</p>
      </header>

      <div className="split split--even">
        <div className="contact">
          <p className="label">Say hello</p>
          <a className="contact__email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <div className="contact__actions">
            <a className="btn btn--primary" href={`mailto:${profile.email}`}>
              <Glyph name="mail" size={16} /> Write an email
            </a>
            <button type="button" className="btn btn--soft" onClick={copy}>
              {copied ? 'Copied!' : 'Copy address'}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? 'Email address copied to clipboard' : ''}
            </span>
          </div>
          <p className="muted contact__place">Based in {profile.location}.</p>
        </div>

        <ul className="links">
          {rows.map((r) => (
            <li key={r.label}>
              <a href={r.href} target="_blank" rel="noopener" className="links__row">
                <span className="links__label">{r.label}</span>
                <span className="links__value">
                  {r.value}
                  {r.note && <span className="links__note">{r.note}</span>}
                </span>
                <Glyph name="external" size={16} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
