import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { about, certification, interests, interestsLine, skills } from '../content/about'
import { profile } from '../content/profile'
import { FINE_POINTER, MOTION_OK, finishIfStalled, gsap, panelScroller, refreshWhenSettled, revealOnce, useGSAP } from '../lib/scroll'
import { usePageMeta } from '../lib/usePageMeta'

// Each interest has an image area. Until a real photo is added (image + alt in content/about.js),
// it shows the card's suit as a small mark rather than an empty box.
function InterestCard({ item }) {
  return (
    <li className="icard">
      <div className="icard__media">
        {item.image ? (
          <img className="icard__photo" src={item.image} alt={item.alt} loading="lazy" decoding="async" />
        ) : (
          <span className="icard__mark" aria-hidden="true">
            {item.suit}
          </span>
        )}
      </div>
      <div className="icard__text">
        <h3 className="icard__title">{item.title}</h3>
        <p>
          {item.note}
          {item.link && (
            <>
              {' '}
              <Link to={item.link}>{item.linkLabel}</Link>
            </>
          )}
        </p>
      </div>
    </li>
  )
}

export default function About() {
  usePageMeta('About', 'About Yra Climaco: Data Science at UC San Diego, skills, and interests.')
  const root = useRef(null)

  useGSAP(
    () => {
      const scroller = panelScroller(root.current)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        // The introduction arrives as one group; the rest reveal in small groups as they scroll in.
        const intro = gsap
          .timeline({ delay: 0.15 })
          .from('.about__portrait-img', { y: 18, opacity: 0, duration: 0.7, ease: 'power3.out' })
          .from('.about__copy > *', { y: 12, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.05)
        const offs = [
          finishIfStalled(intro),
          revealOnce('.fact', scroller),
          revealOnce('.skills__group', scroller, { stagger: 0.05 }),
          revealOnce('.icard', scroller, { stagger: 0.07 }),
          refreshWhenSettled(root.current),
        ]
        return () => offs.forEach((f) => f())
      })
      // A small, tactile detail: interest cards tilt towards the pointer, the mark drifts a little.
      mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        const off = []
        gsap.utils.toArray('.icard', root.current).forEach((card) => {
          const media = card.querySelector('.icard__media')
          const rx = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power3.out' })
          const ry = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power3.out' })
          const mx = gsap.quickTo(media, 'x', { duration: 0.45, ease: 'power3.out' })
          const my = gsap.quickTo(media, 'y', { duration: 0.45, ease: 'power3.out' })
          const move = (e) => {
            const r = card.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width - 0.5
            const py = (e.clientY - r.top) / r.height - 0.5
            rx(-py * 6)
            ry(px * 8)
            mx(px * 6)
            my(py * 6)
          }
          const leave = () => {
            rx(0)
            ry(0)
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
        </div>
      </div>

      <section className="block" aria-labelledby="facts-title">
        <h2 id="facts-title" className="section__h2">
          Education
        </h2>
        <dl className="facts">
          <div className="fact">
            <dt>Degree</dt>
            <dd>
              <strong>{profile.education.school}</strong>
              <span>{profile.education.degree}</span>
              <span className="muted">
                GPA {profile.education.gpa}
                <span aria-hidden="true"> · </span>
                {profile.education.expected}
              </span>
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

      <section className="block" aria-labelledby="skills-title">
        <h2 id="skills-title" className="section__h2">
          Skills
        </h2>
        <div className="skills__grid">
          {skills.map((g) => (
            <div className="skills__group" key={g.group}>
              <h3>{g.group}</h3>
              <ul className="chips">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="block" aria-labelledby="interests-title">
        <h2 id="interests-title" className="section__h2">
          Off the board
        </h2>
        <p className="block__lead">{interestsLine}</p>
        <ul className="icards">
          {interests.map((i) => (
            <InterestCard key={i.title} item={i} />
          ))}
        </ul>
      </section>
    </div>
  )
}
