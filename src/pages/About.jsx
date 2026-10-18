import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { about, certification, highlights, involvement } from '../content/about'
import { profile } from '../content/profile'
import { session } from '../lib/session'
import { MOTION_OK, ScrollTrigger, finishIfStalled, gsap, panelScroller, refreshWhenSettled, revealOnce, useGSAP } from '../lib/scroll'
import { usePageMeta } from '../lib/usePageMeta'

const COUNTED_KEY = 'yc:highlights-counted'

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
const format = (h, v) => (h.ordinal ? ordinal(Math.max(1, Math.round(v))) : v.toFixed(h.decimals ?? 0)) + (h.suffix ?? '')

// A highlight number. The final value is always in the page: a hidden copy reserves its width (so
// nothing shifts while counting), screen readers get it once, and the counting digits are hidden
// from assistive technology.
function Highlight({ h }) {
  const final = format(h, h.value)
  return (
    <li className="hl">
      <p className="hl__value">
        <span className="sr-only">{final}</span>
        <span className="hl__ghost" aria-hidden="true">
          {final}
        </span>
        <span className="hl__num" aria-hidden="true">
          {final}
        </span>
      </p>
      <p className="hl__label">{h.to ? <Link to={h.to}>{h.label}</Link> : h.label}</p>
    </li>
  )
}

export default function About() {
  usePageMeta('About', 'About Yra Climaco: Data Science at UC San Diego, background, and goals.')
  const root = useRef(null)

  useGSAP(
    () => {
      const scroller = panelScroller(root.current)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const intro = gsap
          .timeline({ delay: 0.15 })
          .from('.about__portrait-img', { y: 18, opacity: 0, duration: 0.7, ease: 'power3.out' })
          .from('.about__copy > *', { y: 12, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.05)
        const offs = [finishIfStalled(intro), revealOnce('.fact', scroller), revealOnce('.involve__item', scroller, { stagger: 0.07 }), refreshWhenSettled(root.current)]

        // Count the highlights up once per visit, the first time they come into view.
        if (session.get(COUNTED_KEY) !== '1' && scroller) {
          const nums = gsap.utils.toArray('.hl__num', root.current)
          const set = (v) => nums.forEach((el, i) => (el.textContent = format(highlights[i], highlights[i].value * v)))
          set(0)
          const proxy = { v: 0 }
          // Marked as counted only once it finishes, so an interrupted count simply runs again.
          const count = gsap.to(proxy, {
            v: 1,
            duration: 1.2,
            ease: 'power2.out',
            paused: true,
            onUpdate: () => set(proxy.v),
            onComplete: () => {
              set(1)
              session.set(COUNTED_KEY, '1')
            },
          })
          ScrollTrigger.create({
            trigger: root.current.querySelector('.highlights'),
            scroller,
            start: 'top 92%',
            once: true,
            onEnter: () => count.delay(0.25).play(),
          })
          // Never leave zeros on screen if the count cannot run (frames stalled, trigger missed):
          // check on the wall clock, and only finish early what is actually visible.
          const box = root.current.querySelector('.highlights')
          const check = setInterval(() => {
            const r = box.getBoundingClientRect()
            const view = scroller.getBoundingClientRect()
            const visible = r.top < view.bottom && r.bottom > view.top
            if (visible && count.progress() < 1 && performance.now() - (box.__seenAt ??= performance.now()) > 2200) count.progress(1)
            if (count.progress() === 1) clearInterval(check)
          }, 400)
          offs.push(() => clearInterval(check))
          offs.push(() => set(1))
        }
        return () => offs.forEach((f) => f())
      })
    },
    { scope: root },
  )

  return (
    <div className="section section--about" ref={root}>
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          About
        </h1>
      </header>

      <div className="about">
        <figure className="portrait">
          <img
            className="about__portrait-img"
            src={profile.portrait.src}
            width={profile.portrait.width}
            height={profile.portrait.height}
            alt="Portrait of Yra Climaco, smiling, wearing glasses and a pinstripe jacket."
          />
          <figcaption>
            {profile.name}
            <span>{profile.location}</span>
          </figcaption>
        </figure>
        <div className="about__copy">
          {about.paragraphs.map((t, i) => (
            <p key={t} className={i === 0 ? 'about__lead' : undefined}>
              {t}
            </p>
          ))}
          <p className="about__more">
            See my <Link to="/skills">Skills</Link>, or what I do <Link to="/beyond-data">Beyond Data</Link>.
          </p>
        </div>
      </div>

      <ul className="highlights" aria-label="Highlights">
        {highlights.map((h) => (
          <Highlight key={h.id} h={h} />
        ))}
      </ul>

      <section className="block" aria-labelledby="facts-title">
        <h2 id="facts-title" className="section__h2">
          Education and certification
        </h2>
        <dl className="facts">
          <div className="fact">
            <dt>Degree</dt>
            <dd>
              <strong>{profile.education.school}</strong>
              <span>{profile.education.degree}</span>
              <span className="muted">{profile.education.expected}</span>
            </dd>
          </div>
          <div className="fact">
            <dt>Certification</dt>
            <dd>
              <strong>{certification.name}</strong>
              <span className="muted">
                {certification.issuer}
                <span aria-hidden="true"> · </span>
                {certification.date}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="block" aria-labelledby="involve-title">
        <h2 id="involve-title" className="section__h2">
          Campus involvement
        </h2>
        <ul className="involve">
          {involvement.map((x) => (
            <li className="involve__item" key={x.id}>
              <h3 className="involve__title">{x.title}</h3>
              {x.meta && <p className="involve__meta">{x.meta}</p>}
              <p className="involve__text">{x.text}</p>
              <Link className="involve__link" to={x.link.to}>
                {x.link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
