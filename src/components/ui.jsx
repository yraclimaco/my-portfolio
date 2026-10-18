import { evidenceLabels } from '../content/projects'

const glyphPaths = {
  arrow: <path d="M3 10h13m-4.5-4.5L16 10l-4.5 4.5" />,
  back: <path d="M17 10H4m4.5-4.5L4 10l4.5 4.5" />,
  close: <path d="M5 5l10 10M15 5 5 15" />,
  external: (
    <>
      <path d="M8 4H4.5v11.5H16V12" />
      <path d="M11 3.5h5.5V9M16.3 3.7 9.5 10.5" />
    </>
  ),
  chevron: <path d="m5.5 8 4.5 4.5L14.5 8" />,
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  person: (
    <>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 16.5c.8-3 3.2-4.5 6-4.5s5.2 1.5 6 4.5" />
    </>
  ),
  code: <path d="M7.5 6 3.5 10l4 4m5-8 4 4-4 4" />,
  // A closed game box, for Home.
  home: (
    <>
      <rect x="3" y="7.5" width="14" height="8.5" rx="1.5" />
      <path d="M2.5 7.5h15l-1-3.5h-13z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path d="m3.8 6 6.2 4.6L16.2 6" />
    </>
  ),
  page: (
    <>
      <path d="M5.5 2.8h6.5l3 3v11.4h-9.5z" />
      <path d="M12 2.8V6h3M8 9.5h5M8 12h5M8 14.5h3" />
    </>
  ),
}

export function Glyph({ name, size = 18, className = '' }) {
  return (
    <svg
      className={`glyph ${className}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyphPaths[name]}
    </svg>
  )
}

// Round number token, like the numbered discs placed on game tiles.
export function Token({ number, className = '' }) {
  return (
    <span className={`token ${className}`} aria-hidden="true">
      {number}
    </span>
  )
}

const evidenceShapes = {
  model: <rect x="2.5" y="2.5" width="7" height="7" rx="1.5" />,
  finding: <path d="M6 1.8 10.2 6 6 10.2 1.8 6z" />,
  impact: <circle cx="6" cy="6" r="4" />,
}

export function EvidenceTag({ type }) {
  return (
    <span className={`evidence evidence--${type}`}>
      <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
        {evidenceShapes[type]}
      </svg>
      {evidenceLabels[type]}
    </span>
  )
}

export function ExternalLink({ href, children, className = '' }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener">
      {children}
      <Glyph name="external" size={15} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

export function Figure({ figure }) {
  return (
    <figure className="figure">
      <a className="figure__frame" href={figure.src} target="_blank" rel="noopener">
        <img src={figure.src} width={figure.width} height={figure.height} alt={figure.alt} loading="lazy" decoding="async" />
        <span className="figure__open" aria-hidden="true">
          <Glyph name="external" size={14} /> Full size
        </span>
        <span className="sr-only">(opens full-size image in a new tab)</span>
      </a>
      <figcaption>{figure.caption}</figcaption>
    </figure>
  )
}
