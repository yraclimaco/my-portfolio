import { experience } from '../content/experience'
import { certification } from '../content/about'
import { profile } from '../content/profile'
import { usePageMeta } from '../lib/usePageMeta'

export default function Experience() {
  usePageMeta('Experience', 'Experience of Yra Climaco: i4NS, Data Science Student Society, and the Center for Community Energy.')
  return (
    <div className="section">
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Experience
        </h1>
        <p className="section__lead">Research, mentoring, and data engineering, most recent first.</p>
      </header>

      <div className="split">
        <ol className="track">
          {experience.map((job) => (
            <li className={`track__stop${job.current ? ' is-current' : ''}`} key={job.id}>
              <span className="track__marker" aria-hidden="true" />
              <div className="track__body">
                <p className="track__dates">
                  {job.dates}
                  {job.current && <span className="tag">Current</span>}
                </p>
                <h2 className="track__role">{job.role}</h2>
                <p className="track__org">
                  {job.org}
                  <span aria-hidden="true"> · </span>
                  {job.place}
                </p>
                <p className="track__summary">{job.summary}</p>
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

        <aside className="side-notes">
          <section className="note note--sage" aria-labelledby="edu-title">
            <h2 id="edu-title" className="note__h">
              Education
            </h2>
            <p className="note__big">{profile.education.school}</p>
            <p>{profile.education.degree}</p>
            <p className="muted">
              GPA {profile.education.gpa}
              <span aria-hidden="true"> · </span>
              {profile.education.expected}
            </p>
          </section>
          <section className="note note--butter" aria-labelledby="cert-title">
            <h2 id="cert-title" className="note__h">
              Certification
            </h2>
            <p className="note__big">{certification.name}</p>
            <p className="muted">
              {certification.issuer} · {certification.date}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
