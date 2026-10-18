import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { experience } from '../content/experience'
import { MOTION_OK, ScrollTrigger, gsap, panelScroller, refreshWhenSettled, arriveAtAnchor, useGSAP } from '../lib/scroll'
import { usePageMeta } from '../lib/usePageMeta'

export default function Experience() {
  usePageMeta('Experience', 'Experience of Yra Climaco: i4NS, Data Science Student Society, and the Center for Community Energy.')
  const root = useRef(null)
  const location = useLocation()

  // Arriving at a specific role (/experience#ds3): go to it once the surface has opened.
  useEffect(() => {
    return arriveAtAnchor(location.hash.slice(1))
  }, [location.hash])

  useGSAP(
    () => {
      const scroller = panelScroller(root.current)
      if (!scroller) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // Markers start unfilled only when they will be filled in; otherwise they show as reached.
        const timeline = root.current.querySelector('.timeline')
        timeline.classList.add('is-animated')
        // The connecting line draws with the scroll (tied directly to it, no smoothing lag). On a
        // surface too short to scroll, 'max' is 0 and the line is simply drawn in full.
        gsap.fromTo(
          '.timeline__fill',
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', scroller, start: 'top 75%', end: 'max', scrub: true } },
        )
        // Each entry is emphasised once as it arrives: its marker fills and the entry rises in.
        gsap.utils.toArray('.role', root.current).forEach((role, i) => {
          const body = role.querySelector('.role__body')
          gsap.set(body, { opacity: 0, y: 14 })
          ScrollTrigger.create({
            trigger: role,
            scroller,
            start: 'top 88%',
            once: true,
            onEnter: () => {
              role.classList.add('is-reached')
              gsap.to(body, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: i < 2 ? 0.12 + i * 0.08 : 0, clearProps: 'transform' })
            },
          })
        })
        // Safety net (wall clock): anything on screen that missed its trigger is shown anyway.
        const safety = setTimeout(() =>
          gsap.utils.toArray('.role', root.current).forEach((role) => {
            const r = role.getBoundingClientRect()
            const box = scroller.getBoundingClientRect()
            if (r.top < box.bottom && !role.classList.contains('is-reached')) {
              role.classList.add('is-reached')
              gsap.set(role.querySelector('.role__body'), { opacity: 1, y: 0 })
            }
          }),
        1600)
        const stopRefresh = refreshWhenSettled(root.current)
        return () => {
          clearTimeout(safety)
          stopRefresh()
          timeline.classList.remove('is-animated')
        }
      })
    },
    { scope: root },
  )

  return (
    <div className="section" ref={root}>
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Experience
        </h1>
        <p className="section__lead">Research, mentoring, and data engineering, most recent first.</p>
      </header>

      <div className="timeline">
        <div className="timeline__line" aria-hidden="true">
          <span className="timeline__fill" />
        </div>
        <ol className="roles">
          {experience.map((job) => (
            <li className={`role${job.current ? ' is-current' : ''}`} key={job.id} id={job.id}>
              <span className="role__dot" aria-hidden="true" />
              <div className="role__body">
                <p className="role__when">
                  <span>{job.dates}</span>
                  {job.current && <span className="tag">Current</span>}
                </p>
                <h2 className="role__title">{job.role}</h2>
                <p className="role__org">
                  {job.org}
                  <span aria-hidden="true"> · </span>
                  {job.place}
                </p>
                <p className="role__summary">{job.summary}</p>
                <ul className="bullets">
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <ul className="chips" aria-label="Skills used">
                  {job.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="section__aside">
        Education and certification are on the <Link to="/about">About</Link> page.
      </p>
    </div>
  )
}
