import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Marquee } from './Chrome'
import { heroMarquee, profile } from '../data'

export default function Hero({ play }) {
  const root = useRef(null)

  useGSAP(
    () => {
      gsap.set('.h-line > span', { yPercent: 110 })
      gsap.to('.blob-a', { y: 60, x: -30, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.blob-b', { y: -50, x: 40, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to('.blob-c', { y: 40, x: 30, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      const move = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        gsap.to('.blob-a', { xPercent: nx * 20, duration: 1.2, overwrite: 'auto' })
        gsap.to('.blob-b', { xPercent: nx * -25, duration: 1.4, overwrite: 'auto' })
      }
      window.addEventListener('mousemove', move)
      return () => window.removeEventListener('mousemove', move)
    },
    { scope: root }
  )

  useGSAP(
    () => {
      if (!play) return
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.to('.h-line > span', { yPercent: 0, duration: 1.1, stagger: 0.12 })
        .to('.h-fade', { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, '-=0.7')
    },
    { scope: root, dependencies: [play] }
  )

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-blob blob-a" />
      <div className="hero-blob blob-b" />
      <div className="hero-blob blob-c" />

      <div className="hero-inner">
        <p className="hero-eyebrow h-fade">Product analytics · Gaming, streaming &amp; entertainment</p>
        <h1 className="hero-title">
          <span className="h-line"><span>Hi, I’m {profile.firstName}.</span></span>
          <span className="h-line"><span>I turn raw data into</span></span>
          <span className="h-line"><span>product <em>insights</em>.</span></span>
        </h1>
        <p className="hero-sub h-fade">
          Data Science student at UC San Diego, passionate about B2C consumer tech. I build the models,
          pipelines, and experiments that show teams what players and viewers actually do — and what to
          build next.
        </p>
        <div className="hero-actions h-fade">
          <a href="#projects" className="btn btn-light">See my work</a>
          <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn-outline-light">Résumé ↗</a>
        </div>
        <div className="hero-social h-fade">
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </div>

      <div className="hero-marquee">
        <Marquee items={heroMarquee} outline />
      </div>
    </section>
  )
}
