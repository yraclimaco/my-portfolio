import { useLayoutEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { EvidenceTag, ExternalLink, Figure, Glyph } from '../components/ui'
import { getProject, projects } from '../content/projects'
import { FINE_POINTER, MOTION_OK, ScrollTrigger, finishIfStalled, gsap, panelScroller, refreshWhenSettled, revealOnce, smoothScrollTo, useGSAP } from '../lib/scroll'
import { usePageMeta } from '../lib/usePageMeta'

// Where the gallery was when a project was opened (scroll position, and the card's thumbnail on
// screen), so the detail can grow out of that card and Back to Projects returns to the same spot.
const memory = { scroll: 0, rect: null, returning: false }

const scrollArea = () => document.querySelector('[data-panel-scroll]')

// ---------- Gallery ----------

function ProjectCard({ p }) {
  const thumb = p.thumb ?? p.figures[0]
  return (
    <li className="pcard">
      <Link
        to={`/projects/${p.slug}`}
        state={{ fromGallery: true }}
        className="pcard__link"
        data-slug={p.slug}
        onClick={(e) => {
          memory.scroll = scrollArea()?.scrollTop ?? 0
          memory.rect = e.currentTarget.querySelector('.pcard__thumb')?.getBoundingClientRect() ?? null
        }}
        aria-describedby={`pcard-line-${p.slug}`}
      >
        <span className={`pcard__thumb pcard__thumb--${p.thumb ? 'cover' : 'contain'}`}>
          <span className="pcard__media">
            <img src={thumb.src} width={thumb.width} height={thumb.height} alt="" loading="lazy" decoding="async" />
          </span>
          <span className="pcard__badge">{p.context.split(' · ')[0]}</span>
        </span>
        <span className="pcard__body">
          <span className="pcard__title">{p.title}</span>
          <span className="pcard__line" id={`pcard-line-${p.slug}`}>
            {p.subtitle}
          </span>
          {p.dates && <span className="pcard__meta">{p.dates}</span>}
        </span>
      </Link>
    </li>
  )
}

function Gallery({ notFound }) {
  return (
    <div className="section">
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Projects
        </h1>
        <p className="section__lead">Five projects in NBA shot modeling, surf forecasting, esports, YouTube trends, and grappling. Choose one for the full story.</p>
        {notFound && <p className="section__notice">I couldn’t find that project, so here are all of them instead.</p>}
      </header>
      <ul className="pgrid" aria-label="Projects">
        {projects.map((p) => (
          <ProjectCard key={p.slug} p={p} />
        ))}
      </ul>
    </div>
  )
}

// ---------- Project detail ----------

function Bullets({ items }) {
  return (
    <ul className="bullets">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

// Results: each number with its context, labelled by the kind of evidence it is. The accent bar
// draws in as the result appears; the number itself never animates.
function Results({ findings }) {
  const items = [...(findings.model ?? []).map((f) => ({ ...f, type: 'model' })), ...(findings.finding ?? []).map((f) => ({ ...f, type: 'finding' }))]
  return (
    <dl className="results">
      {items.map((f) => (
        <div className={`result result--${f.type}`} key={f.stat + f.text}>
          <span className="result__bar" aria-hidden="true" />
          <dt>
            <EvidenceTag type={f.type} /> <span className="result__stat">{f.stat}</span>
          </dt>
          <dd>{f.text}</dd>
          {f.note && <dd className="result__note">{f.note}</dd>}
        </div>
      ))}
    </dl>
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

const parts = [
  { id: 'question', label: 'Question' },
  { id: 'contribution', label: 'Contribution' },
  { id: 'approach', label: 'Approach' },
  { id: 'results', label: 'Results' },
  { id: 'visuals', label: 'Visuals' },
]

// Intentional jumps within the project scroll smoothly (instantly with reduced motion),
// then move focus to the heading so keyboard and screen reader users land there too.
function jumpTo(e, id) {
  e.preventDefault()
  const area = scrollArea()
  const target = document.getElementById(`pd-${id}`)
  if (!area || !target) return
  const top = target.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop - 16
  smoothScrollTo(area, top)
  target.querySelector('h2')?.focus({ preventScroll: true })
}

function BackToProjects({ onBack }) {
  return (
    <button type="button" className="btn btn--soft pdetail__back" onClick={onBack}>
      <Glyph name="back" size={17} /> Back to Projects
    </button>
  )
}

function ProjectDetail({ p, onBack }) {
  const hasVisuals = p.figures.length > 1
  return (
    <article className="pdetail" aria-labelledby="panel-title">
      <BackToProjects onBack={onBack} />

      <header className="pdetail__head">
        <p className="pdetail__meta">
          {p.context}
          {p.dates && (
            <>
              <span aria-hidden="true"> · </span>
              {p.dates}
            </>
          )}
        </p>
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          {p.title}
        </h1>
        <p className="pdetail__sub">{p.subtitle}</p>
        <div className="pdetail__links">
          {p.links.map((l, i) => (
            <ExternalLink key={l.url} href={l.url} className={`btn ${i === 0 ? 'btn--primary' : 'btn--soft'}`}>
              {l.label}
            </ExternalLink>
          ))}
        </div>
      </header>

      {p.metrics && (
        <ul className="pmetrics" aria-label="Key numbers">
          {p.metrics.map((m) => (
            <li key={m.label}>
              <span className="pmetrics__value">{m.value}</span> <span className="pmetrics__label">{m.label}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="pdetail__hero">
        <Figure figure={p.figures[0]} />
      </div>

      <nav className="pdetail__toc" aria-label="On this page">
        {parts
          .filter((x) => x.id !== 'visuals' || hasVisuals)
          .map((x) => (
            <a key={x.id} href={`#pd-${x.id}`} onClick={(e) => jumpTo(e, x.id)}>
              {x.label}
            </a>
          ))}
      </nav>

      <div className="pdetail__body">
        <section id="pd-question" className="pblock">
          <h2 tabIndex={-1}>The question</h2>
          <p className="pblock__lead">{p.question}</p>
        </section>

        <section id="pd-contribution" className="pblock">
          <h2 tabIndex={-1}>My contribution</h2>
          <p className="pblock__note">{p.contribution.note ?? (p.contribution.team ? 'A team project. My part:' : 'A solo project. I did all of the work below.')}</p>
          <Bullets items={p.contribution.items} />
        </section>

        <section id="pd-approach" className="pblock">
          <h2 tabIndex={-1}>Approach and tools</h2>
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
          <h3>The data</h3>
          <Bullets items={p.data} />
          <h3>Tools</h3>
          <ul className="chips" aria-label="Tools">
            {p.stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section id="pd-results" className="pblock">
          <h2 tabIndex={-1}>Results</h2>
          <Results findings={p.findings} />
          {p.findings.impact && (
            <div className="impact-row">
              <EvidenceTag type="impact" />
              <p className="impact">{p.findings.impact}</p>
            </div>
          )}
          {p.table && <DataTable table={p.table} />}
          {p.couldInform && (
            <>
              <h3>What this could inform</h3>
              <Bullets items={p.couldInform} />
            </>
          )}
          {p.limitations && (
            <>
              <h3>Limitations</h3>
              <Bullets items={p.limitations} />
            </>
          )}
        </section>

        {p.learned && (
          <section id="pd-learned" className="pblock">
            <h2 tabIndex={-1}>What I learned</h2>
            <p>{p.learned}</p>
          </section>
        )}

        {hasVisuals && (
          <section id="pd-visuals" className="pblock pblock--wide">
            <h2 tabIndex={-1}>Supporting visuals</h2>
            <div className="gallery">
              {p.figures.slice(1).map((f) => (
                <Figure figure={f} key={f.src} />
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="pdetail__foot">
        <BackToProjects onBack={onBack} />
      </footer>
    </article>
  )
}

// ---------- Work ----------

export default function Work() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const current = slug ? getProject(slug) : null
  usePageMeta(current ? current.title : 'Projects', current?.summary ?? 'Projects in product, behavioral, and predictive analytics by Yra Climaco.')

  // Moving between the gallery and a project: start a project at its top with focus on its title;
  // come back to the gallery where it was, with focus on the card that was opened.
  const prev = useRef(current ? slug : null)
  useLayoutEffect(() => {
    const from = prev.current
    const to = current ? slug : null
    prev.current = to
    if (from === to) return
    const area = scrollArea()
    if (to) {
      if (area) area.scrollTop = 0
      document.getElementById('panel-title')?.focus({ preventScroll: true })
    } else if (from) {
      if (area) area.scrollTop = memory.scroll
      memory.returning = true
      const card = document.querySelector(`.pcard__link[data-slug="${from}"]`)
      card?.focus({ preventScroll: true })
      // A brief ring shows which card you came back from.
      card?.classList.add('is-returned')
    }
  }, [slug, current])

  // Opened from the gallery: step back in history, so the browser's Back button agrees.
  // Arrived directly (a shared link): replace this entry with the gallery.
  // ---------- Motion (scoped to the current view; rebuilt only when the view changes)
  const viewRef = useRef(null)
  const viewKey = current ? current.slug : 'gallery'
  useGSAP(
    () => {
      const root = viewRef.current
      const scroller = panelScroller(root)
      if (!scroller) return
      const fromCard = memory.rect
      memory.rect = null
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const offs = []
        // Cards reveal on the first visit only; coming back, they are simply there.
        if (!current) {
          if (!memory.returning) offs.push(revealOnce('.pcard', scroller, { y: 16, stagger: 0.07 }))
          memory.returning = false
        } else {
          // The project grows out of the card that was chosen: its hero image starts where the
          // thumbnail was and settles into place while the text around it arrives.
          const hero = root.querySelector('.pdetail__hero')
          if (fromCard && hero) {
            const to = hero.getBoundingClientRect()
            const grow = gsap.from(hero, {
              x: fromCard.left - to.left,
              y: fromCard.top - to.top,
              scale: fromCard.width / to.width,
              transformOrigin: '0 0',
              duration: 0.55,
              ease: 'power3.inOut',
              clearProps: 'transform',
            })
            offs.push(finishIfStalled(grow))
          }
          // Explanations, screenshots and findings arrive in small groups as they scroll in.
          offs.push(revealOnce('.pblock > :not(.results)', scroller, { stagger: 0.05 }))
          offs.push(revealOnce('.gallery .figure', scroller, { y: 20, stagger: 0.08 }))
          gsap.set('.result', { opacity: 0, y: 14 })
          gsap.set('.result__bar', { scaleX: 0 })
          ScrollTrigger.batch('.result', {
            scroller,
            start: 'top 92%',
            once: true,
            onEnter: (batch) => {
              gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'transform' })
              gsap.to(
                batch.map((el) => el.querySelector('.result__bar')),
                { scaleX: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.1 },
              )
            },
          })
          // Safety net (wall clock): anything on screen that missed its trigger is shown anyway.
          const t = setTimeout(
            () =>
              gsap.utils.toArray('.result', root).forEach((el) => {
                const r = el.getBoundingClientRect()
                if (r.top < scroller.getBoundingClientRect().bottom && Number(gsap.getProperty(el, 'opacity')) < 1) {
                  gsap.set(el, { opacity: 1, y: 0 })
                  gsap.set(el.querySelector('.result__bar'), { scaleX: 1 })
                }
              }),
            1600,
          )
          offs.push(() => clearTimeout(t))
        }
        offs.push(refreshWhenSettled(root))
        return () => offs.forEach((f) => f())
      })
      // Thumbnails drift a few pixels with the pointer (the card lift itself is plain CSS).
      mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        if (current) return
        const off = []
        gsap.utils.toArray('.pcard__link', root).forEach((card) => {
          const media = card.querySelector('.pcard__media')
          const mx = gsap.quickTo(media, 'x', { duration: 0.5, ease: 'power3.out' })
          const my = gsap.quickTo(media, 'y', { duration: 0.5, ease: 'power3.out' })
          const move = (e) => {
            const r = card.getBoundingClientRect()
            mx(((e.clientX - r.left) / r.width - 0.5) * -10)
            my(((e.clientY - r.top) / r.height - 0.5) * -6)
          }
          const leave = () => {
            mx(0)
            my(0)
          }
          card.addEventListener('pointermove', move)
          card.addEventListener('pointerleave', leave)
          off.push(() => {
            card.removeEventListener('pointermove', move)
            card.removeEventListener('pointerleave', leave)
          })
        })
        return () => off.forEach((f) => f())
      })
    },
    { scope: viewRef, dependencies: [viewKey], revertOnUpdate: true },
  )

  const back = () => (location.state?.fromGallery ? navigate(-1) : navigate('/projects', { replace: true }))

  return (
    <div className="view-in" key={viewKey} ref={viewRef}>
      {current ? <ProjectDetail p={current} onBack={back} /> : <Gallery notFound={Boolean(slug)} />}
    </div>
  )
}
