import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { siGit, siGithub, siGooglecloud, siJupyter, siNumpy, siPandas, siPlotly, siPostgresql, siPython, siScikitlearn } from 'simple-icons'
import { Glyph } from '../components/ui'
import { analytics, featured, groups, usedIn } from '../content/skills'
import { profile } from '../content/profile'
import { MOTION_OK, gsap, panelScroller, refreshWhenSettled, revealOnce, useGSAP } from '../lib/scroll'
import { usePageMeta } from '../lib/usePageMeta'

const brand = {
  python: siPython,
  pandas: siPandas,
  numpy: siNumpy,
  scikitlearn: siScikitlearn,
  plotly: siPlotly,
  postgresql: siPostgresql,
  googlecloud: siGooglecloud,
  git: siGit,
  jupyter: siJupyter,
}

// One visual slot for every skill: a brand mark, the neutral SQL symbol, or a monogram.
function SkillMark({ item, size }) {
  if (item.icon) {
    const icon = brand[item.icon]
    return (
      <svg className="skill-mark" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <path d={icon.path} fill={`#${icon.hex}`} />
      </svg>
    )
  }
  if (item.mark === 'database') {
    return (
      <svg className="skill-mark" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <g fill="none" stroke="#4f6e51" strokeWidth="1.8">
          <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" fill="#e8efdf" />
          <path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13" />
          <path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8" />
        </g>
      </svg>
    )
  }
  return (
    <span className="skill-mono" style={{ width: size, height: size, fontSize: Math.round(size * (item.mono.length > 2 ? 0.3 : 0.38)) }} aria-hidden="true">
      {item.mono}
    </span>
  )
}

function UsedIn({ name, links }) {
  return (
    <div className="used-in">
      <p className="used-in__h">{name} used in</p>
      <ul>
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// A group of skills. Skills with verified projects are buttons that reveal a compact "Used in"
// list under the group (one open at a time); the rest are plain labels.
function Group({ group, featuredTiles = false }) {
  const [open, setOpen] = useState(null)
  const baseId = useId()
  const panelId = `${baseId}-used`
  const items = group.items.map((it) => ({ ...it, links: usedIn(it.name) }))
  const practices = (group.practices ?? []).map((name) => ({ name, links: usedIn(name) }))
  const current = [...items, ...practices].find((x) => x.name === open)

  const tile = (it) => {
    const body = (
      <>
        <SkillMark item={it} size={featuredTiles ? 52 : 30} />
        <span className="skill__text">
          <span className="skill__name">{it.name}</span>
          {it.detail && <span className="skill__detail">{it.detail}</span>}
        </span>
        {it.links.length > 0 && <Glyph name="chevron" size={16} className="skill__chev" />}
      </>
    )
    return (
      <li key={it.name} className={`skill${featuredTiles ? ' skill--featured' : ''}`}>
        {it.links.length ? (
          <button
            type="button"
            className="skill__btn"
            aria-expanded={open === it.name}
            aria-controls={panelId}
            onClick={() => setOpen((o) => (o === it.name ? null : it.name))}
          >
            {body}
          </button>
        ) : (
          <div className="skill__btn is-static">{body}</div>
        )}
      </li>
    )
  }

  return (
    <section className={`sgroup sgroup--${group.id}`} aria-labelledby={`${baseId}-h`}>
      <h2 className="sgroup__h" id={`${baseId}-h`}>
        {group.title}
      </h2>
      <ul className={featuredTiles ? 'skills-featured' : 'skills-tiles'}>{items.map(tile)}</ul>
      {practices.length > 0 && (
        <ul className="skill-words" aria-label={`${group.title} practices`}>
          {practices.map((p) => (
            <li key={p.name}>
              {p.links.length ? (
                <button type="button" className="skill-word" aria-expanded={open === p.name} aria-controls={panelId} onClick={() => setOpen((o) => (o === p.name ? null : p.name))}>
                  {p.name}
                </button>
              ) : (
                <span className="skill-word is-static">{p.name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="sgroup__used" id={panelId} aria-live="polite">
        {current && <UsedIn name={current.name} links={current.links} />}
      </div>
    </section>
  )
}

function Methods() {
  const [open, setOpen] = useState(null)
  const baseId = useId()
  const panelId = `${baseId}-used`
  const items = analytics.items.map((name) => ({ name, links: usedIn(name) }))
  const current = items.find((x) => x.name === open)
  return (
    <section className="sgroup sgroup--methods" aria-labelledby={`${baseId}-h`}>
      <h2 className="sgroup__h" id={`${baseId}-h`}>
        {analytics.title}
      </h2>
      <p className="sgroup__lead">Methods I reach for when a question needs evidence.</p>
      <ul className="skill-words">
        {items.map((m) => (
          <li key={m.name}>
            {m.links.length ? (
              <button type="button" className="skill-word" aria-expanded={open === m.name} aria-controls={panelId} onClick={() => setOpen((o) => (o === m.name ? null : m.name))}>
                {m.name}
              </button>
            ) : (
              <span className="skill-word is-static">{m.name}</span>
            )}
          </li>
        ))}
      </ul>
      <div className="sgroup__used" id={panelId} aria-live="polite">
        {current && <UsedIn name={current.name} links={current.links} />}
      </div>
    </section>
  )
}

export default function Skills() {
  usePageMeta('Skills', 'Skills of Yra Climaco: Python, SQL, analytics methods, libraries, data and cloud tools.')
  const root = useRef(null)

  useGSAP(
    () => {
      const scroller = panelScroller(root.current)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const offs = [
          revealOnce('.skill--featured', scroller, { y: 16, stagger: 0.08 }),
          revealOnce('.sgroup:not(.sgroup--languages)', scroller, { y: 14, stagger: 0.07 }),
          refreshWhenSettled(root.current),
        ]
        return () => offs.forEach((f) => f())
      })
    },
    { scope: root },
  )

  return (
    <div className="section section--skills" ref={root}>
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Skills
        </h1>
        <p className="section__lead">The languages, methods, and tools behind my projects. Choose a skill to see where I used it.</p>
      </header>

      <Group group={{ id: 'languages', title: 'Languages', items: featured }} featuredTiles />
      <Methods />
      <div className="skills-columns">
        {groups.map((g) => (
          <Group key={g.id} group={g} />
        ))}
      </div>

      <p className="skills-github">
        <a className="btn btn--soft" href={profile.github} target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d={siGithub.path} fill="currentColor" />
          </svg>
          See my code on GitHub
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </p>
    </div>
  )
}
