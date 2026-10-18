import { useState } from 'react'
import { Link } from 'react-router-dom'
import { about, certification, interests, interestsLine, skills } from '../content/about'
import { profile } from '../content/profile'
import { usePageMeta } from '../lib/usePageMeta'

function InterestDeck() {
  const [drawn, setDrawn] = useState(-1)
  const card = drawn >= 0 ? interests[drawn] : null
  const done = drawn === interests.length - 1

  return (
    <div className="deck">
      <div className="deck__table">
        <div className="deck__pile" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className={`deck__card${card ? ' is-drawn' : ''}`} aria-live="polite">
          {card ? (
            <div className="deck__face" key={drawn}>
              <span className="deck__suit" aria-hidden="true">
                {card.suit}
              </span>
              <p className="deck__title">{card.title}</p>
              <p className="deck__note">
                {card.note}
                {card.link && (
                  <>
                    {' '}
                    <Link to={card.link}>Open the case study</Link>
                  </>
                )}
              </p>
              <span className="deck__count">
                Card {drawn + 1} of {interests.length}
              </span>
            </div>
          ) : (
            <p className="deck__placeholder">Four cards. Draw one!</p>
          )}
        </div>
      </div>
      <button type="button" className="btn btn--soft" onClick={() => setDrawn((d) => (done ? -1 : d + 1))}>
        {done ? 'Shuffle the deck' : drawn < 0 ? 'Draw a card' : 'Draw another'}
      </button>
    </div>
  )
}

export default function About() {
  usePageMeta('About', 'About Yra Climaco: Data Science at UC San Diego, skills, and interests.')
  return (
    <div className="section">
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          About
        </h1>
      </header>

      <div className="about">
        <figure className="portrait">
          <img src={profile.portrait.src} width={profile.portrait.width} height={profile.portrait.height} alt="Portrait of Yra Climaco, smiling, wearing glasses and a pinstripe jacket." />
          <figcaption>
            {profile.name}
            <span>{profile.location}</span>
          </figcaption>
        </figure>
        <div className="about__copy">
          <p className="about__lead">{about.lead}</p>
          {about.paragraphs.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <div className="about__facts">
            <section className="note note--sage">
              <h2 className="note__h">Education</h2>
              <p className="note__big">{profile.education.school}</p>
              <p>{profile.education.degree}</p>
              <p className="muted">
                GPA {profile.education.gpa} · {profile.education.expected}
              </p>
            </section>
            <section className="note note--butter">
              <h2 className="note__h">Certification</h2>
              <p className="note__big">{certification.name}</p>
              <p className="muted">
                {certification.issuer} · {certification.date}
              </p>
            </section>
          </div>
        </div>
      </div>

      <section className="skills" aria-labelledby="skills-title">
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

      <section className="interests" aria-labelledby="interests-title">
        <div>
          <h2 id="interests-title" className="section__h2">
            Off the board
          </h2>
          <p>{interestsLine}</p>
          <p className="muted">There’s a little deck here if you’d like the longer version.</p>
        </div>
        <InterestDeck />
      </section>
    </div>
  )
}
