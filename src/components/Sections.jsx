import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Marquee, SectionLabel } from './Chrome'
import { certification, experience, focusAreas, hobbies, profile, projects, skills, stats } from '../data'

gsap.registerPlugin(ScrollTrigger)

function CountUp({ to, decimals = 0, suffix = '' }) {
  const el = useRef(null)
  useGSAP(() => {
    const o = { v: 0 }
    ScrollTrigger.create({
      trigger: el.current,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(o, {
          v: to,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.current.textContent = o.v.toLocaleString('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }) + suffix
          },
        }),
    })
  })
  return <span ref={el}>0{suffix}</span>
}

export function About() {
  return (
    <section className="about" id="about">
      <SectionLabel n={1}>About</SectionLabel>
      <div className="about-grid">
        <div className="portrait" data-reveal>
          {profile.portrait ? (
            <img src={profile.portrait} alt={profile.name} />
          ) : (
            <div className="portrait-ph">{profile.initials}</div>
          )}
          <div className="portrait-badge">
            {profile.location}
            <br />
            UCSD · {profile.grad}
          </div>
        </div>
        <div className="about-copy">
          <h2 data-reveal>Passionate about the products people love to use.</h2>
          <p data-reveal>
            I’m a Data Science student at {profile.school} ({profile.degree.replace('B.S. ', 'B.S., ')}) aiming
            for product analytics at B2C consumer tech. My dream is to help turn raw data into product insights
            that move decisions at consumer tech companies — or any company building products worth caring about.
          </p>
          <div className="focus" data-reveal>
            {focusAreas.map((f) => <span key={f}>{f}</span>)}
          </div>
          <div className="about-links" data-reveal>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
          <p data-reveal>
            Projects like a pro League of Legends outcome analysis and a YouTube viral-trend predictor come
            straight from that curiosity about engagement, retention, and what keeps audiences hooked. Away from
            the laptop, you’ll find me training Brazilian Jiu-Jitsu, playing board games, practicing card magic,
            or hunting down the next new thing to eat.
          </p>
          <div className="stats" data-reveal>
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <b><CountUp {...s} /></b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Experience() {
  const root = useRef(null)
  useGSAP(
    () => {
      gsap.to('.tl-fill', {
        height: '100%',
        ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 70%', scrub: 0.6 },
      })
    },
    { scope: root }
  )
  return (
    <section className="experience" id="experience" ref={root}>
      <SectionLabel n={2}>Experience</SectionLabel>
      <h2 className="section-title" data-reveal>Where I’ve been putting data to work.</h2>
      <div className="timeline">
        <div className="tl-line"><div className="tl-fill" /></div>
        {experience.map((e) => (
          <article className="tl-item" key={e.role} data-reveal>
            <div className="tl-dot" />
            <div className="tl-date">{e.date}</div>
            <div className="tl-card">
              <h3>{e.role}</h3>
              <p className="tl-org">{e.org} · {e.place}</p>
              <ul>
                {e.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
              <div className="tags">{e.tags.map((t) => <span key={t}>{t}</span>)}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Projects() {
  const root = useRef(null)
  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.project')
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        gsap.fromTo(card, { scale: 1, filter: 'brightness(1)' }, {
          scale: 0.94,
          filter: 'brightness(0.82)',
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 20%', scrub: true },
        })
      })
    },
    { scope: root }
  )
  return (
    <section className="projects" id="projects" ref={root}>
      <SectionLabel n={3}>Projects</SectionLabel>
      <h2 className="section-title" data-reveal>Things I’ve built and measured.</h2>
      <div className="project-stack">
        {projects.map((p, i) => (
          <article className={`project project--${p.color}`} key={p.title} style={{ '--i': i }}>
            <div className="project-main">
              <p className="project-date"><span className="lens">{p.lens}</span>{p.date}</p>
              <h3>{p.title}</h3>
              <p className="project-sub">{p.subtitle}</p>
              <ul>{p.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
              <div className="project-links">
                {p.links.map((l, i) => (
                  <a
                    key={l.url}
                    className={`btn ${i === 0 ? 'btn-dark' : 'btn-outline-light'}`}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </div>
            <div className="project-metric">
              <b>{p.metric}</b>
              <span>{p.metricLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Skills() {
  return (
    <section className="skills" id="skills">
      <SectionLabel n={4}>Skills</SectionLabel>
      <h2 className="section-title" data-reveal>Tools I reach for.</h2>
      <div className="skills-grid">
        {skills.map((s, i) => (
          <div className="skill-card" key={s.title} data-reveal style={{ '--tilt': `${[-2, 2, -1.5, 2.5, -2.5][i % 5]}deg` }}>
            <h3>{s.title}</h3>
            <div className="pills">{s.items.map((it) => <span key={it}>{it}</span>)}</div>
          </div>
        ))}
        <div className="skill-card skill-card--cert" data-reveal>
          <h3>Certification</h3>
          <p className="cert-name">{certification.name}</p>
          <p className="cert-meta">{certification.issuer} · {certification.date}</p>
        </div>
      </div>
      <div className="skills-marquee">
        <Marquee items={['Python', 'SQL', 'Pandas', 'Scikit-learn', 'Plotly', 'PostgreSQL', 'GCP', 'AWS']} />
      </div>
    </section>
  )
}

export function Hobbies() {
  const root = useRef(null)
  useGSAP(
    () => {
      const track = root.current.querySelector('.hobbies-track')
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
      gsap.utils.toArray('.hobby-card').forEach((card) => {
        const emoji = card.querySelector('.hobby-emoji')
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          gsap.to(card, { rotateY: px * 10, rotateX: -py * 10, transformPerspective: 700, duration: 0.5 })
          gsap.to(emoji, { x: px * 24, y: py * 24, duration: 0.5 })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6 })
          gsap.to(emoji, { x: 0, y: 0, duration: 0.6 })
        })
      })
    },
    { scope: root }
  )
  return (
    <section className="hobbies" id="hobbies" ref={root}>
      <div className="hobbies-pin">
        <SectionLabel n={5}>Beyond the screen</SectionLabel>
        <div className="hobbies-track">
          <div className="hobby-intro">
            <h2>Off the clock.</h2>
            <p>Four things that keep me sharp, curious, and a little unpredictable. →</p>
          </div>
          {hobbies.map((h) => (
            <div className="hobby-card" key={h.title} style={{ '--c': h.color }}>
              <span className="hobby-emoji">{h.emoji}</span>
              <h3>{h.title}</h3>
              <p>{h.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="contact" id="contact">
      <SectionLabel n={6} light>Contact</SectionLabel>
      <h2 className="contact-title" data-reveal>
        Let’s talk<br />products.
      </h2>
      <p className="contact-note" data-reveal>
        Always up for a conversation about product analytics, gaming, streaming, and what makes a product stick.
      </p>
      <a className="contact-email" href={`mailto:${profile.email}`} data-reveal>{profile.email}</a>
      <div className="contact-actions" data-reveal>
        <a className="btn btn-light" href={profile.resume} target="_blank" rel="noreferrer">Download résumé ↓</a>
      </div>
      <div className="contact-links" data-reveal>
        <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
      <footer className="footer">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Built with React, GSAP &amp; a well-shuffled deck.</span>
      </footer>
    </section>
  )
}
