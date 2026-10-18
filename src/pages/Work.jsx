import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EvidenceTag, ExternalLink, Figure, Glyph, Token } from '../components/ui'
import { getProject, projects } from '../content/projects'
import { prefersReducedMotion } from '../lib/motion'
import { usePageMeta } from '../lib/usePageMeta'

function Findings({ type, items }) {
  if (!items?.length) return null
  return (
    <div className={`findings findings--${type}`}>
      <EvidenceTag type={type} />
      <dl>
        {items.map((f) => (
          <div className="finding" key={f.stat + f.text}>
            <dt>{f.stat}</dt>
            <dd>{f.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function DataTable({ table }) {
  return (
    <div className="table-wrap" role="region" aria-label={table.caption} tabIndex={0}>
      <table className="data-table">
        <caption>{table.caption}</caption>
        <thead>
          <tr>
            {table.columns.map((c) => (
              <th scope="col" key={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={row[0]} className={i === table.highlightRow ? 'is-highlight' : undefined}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th scope="row" key={cell}>
                    {cell}
                    {i === table.highlightRow && <span className="sr-only"> (selected model)</span>}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Bullets({ items, muted }) {
  return (
    <ul className={`bullets${muted ? ' bullets--muted' : ''}`}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

function CaseStudy({ p }) {
  return (
    <div className="case">
      <div className="case__question">
        <h3 className="case__h">The question</h3>
        <p>{p.question}</p>
      </div>

      <div className="case__cols">
        <div className="case__col">
          <div className="case__block">
            <h3 className="case__h">{p.contribution.team ? 'My contribution' : 'What I did'}</h3>
            <p className="case__note">{p.contribution.team ? 'Built with a team. My part:' : 'A solo project. I did all of the work below.'}</p>
            <Bullets items={p.contribution.items} />
          </div>
          <div className="case__block">
            <h3 className="case__h">The data</h3>
            <Bullets items={p.data} />
          </div>
          <div className="case__block">
            <h3 className="case__h">How I approached it</h3>
            <ol className="steps">
              {p.approach.map((s, n) => (
                <li className="step" key={s.title}>
                  <span className="step__n" aria-hidden="true">
                    {n + 1}
                  </span>
                  <div>
                    <p className="step__title">{s.title}</p>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="case__col">
          <div className="case__block">
            <h3 className="case__h">What I found</h3>
            <Findings type="finding" items={p.findings.finding} />
            <Findings type="model" items={p.findings.model} />
            <div className="findings findings--impact">
              <EvidenceTag type="impact" />
              <p className="impact">{p.findings.impact}</p>
            </div>
            {p.table && <DataTable table={p.table} />}
          </div>
        </div>
      </div>

      {p.figures.length > 1 && (
        <div className="gallery">
          {p.figures.slice(1).map((f) => (
            <Figure figure={f} key={f.src} />
          ))}
        </div>
      )}

      <div className="case__cols">
        <div className="case__block">
          <h3 className="case__h">What this could inform</h3>
          <Bullets items={p.couldInform} />
        </div>
        <div className="case__block">
          <h3 className="case__h">Limitations</h3>
          <Bullets items={p.limitations} muted />
        </div>
      </div>
    </div>
  )
}

function Project({ p, open, onToggle }) {
  const ref = useRef(null)
  const detailsId = `case-${p.slug}`
  return (
    <article className={`project${open ? ' is-open' : ''}`} id={`project-${p.slug}`} ref={ref} aria-labelledby={`title-${p.slug}`}>
      <div className="project__main">
        <div className="project__text">
          <div className="project__head">
            <Token number={p.number} />
            <div className="project__heading">
              <p className="project__meta">
                {p.context}
                <span aria-hidden="true"> · </span>
                {p.dates}
              </p>
              <h2 className="project__title" id={`title-${p.slug}`}>
                {p.title}
              </h2>
              <p className="project__subtitle">{p.subtitle}</p>
            </div>
          </div>

          <p className="project__summary">{p.summary}</p>

          <div className="project__stat">
            <span className="project__stat-value">{p.headline.value}</span>
            <span className="project__stat-label">{p.headline.label}</span>
            <EvidenceTag type={p.headline.type} />
          </div>

          <div className="project__actions">
            <button type="button" className="btn btn--primary project__toggle" aria-expanded={open} aria-controls={detailsId} onClick={() => onToggle(p.slug, ref.current)}>
              {open ? 'Hide the case study' : 'Read the case study'}
              <Glyph name="chevron" size={16} className="project__chevron" />
            </button>
            {p.links.map((l) => (
              <ExternalLink key={l.url} href={l.url} className="btn btn--soft">
                {l.label}
              </ExternalLink>
            ))}
          </div>
        </div>

        {p.figures[0] && (
          <div className="project__visual">
            <Figure figure={p.figures[0]} />
          </div>
        )}
      </div>

      <div className="project__details" id={detailsId} inert={!open} aria-hidden={!open}>
        <div className="project__details-inner">
          <CaseStudy p={p} />
        </div>
      </div>
    </article>
  )
}

// Scroll only the content area (scrollIntoView would also nudge the surface itself).
function scrollToProject(el, smooth) {
  const area = el?.closest('[data-panel-scroll]')
  if (!area) return
  const top = el.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop - 16
  area.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
}

export default function Work() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const current = slug ? getProject(slug) : null
  usePageMeta(current ? current.title : 'Work', current?.summary ?? 'Case studies in behavioral, statistical, and predictive analytics by Yra Climaco.')

  const toggle = (s, el) => {
    const opening = s !== slug
    navigate(opening ? `/work/${s}` : '/work', { replace: true })
    if (opening) requestAnimationFrame(() => scrollToProject(el, !prefersReducedMotion()))
  }

  // Deep link straight to a project: bring it into view.
  const initialSlug = useRef(slug)
  useEffect(() => {
    if (!initialSlug.current) return
    scrollToProject(document.getElementById(`project-${initialSlug.current}`), false)
  }, [])

  return (
    <div className="section section--work">
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Work
        </h1>
        <p className="section__lead">
          Four projects covering surf forecasts, esports, YouTube trends, and grappling. Each case study keeps model performance, analytical findings, and real-world impact clearly apart, and is honest about its limits.
        </p>
        {slug && !current && <p className="section__notice">I couldn’t find that project, so here’s everything instead.</p>}
      </header>

      <div className="projects">
        {projects.map((p) => (
          <Project key={p.slug} p={p} open={p.slug === slug} onToggle={toggle} />
        ))}
      </div>
    </div>
  )
}
