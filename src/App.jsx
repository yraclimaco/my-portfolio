import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import Intro from './components/Intro'
import Hero from './components/Hero'
import { Cursor, Nav } from './components/Chrome'
import { About, Contact, Experience, Hobbies, Projects, Skills } from './components/Sections'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const skipIntro =
  new URLSearchParams(window.location.search).get('intro') === '0' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const root = useRef(null)
  const lenisRef = useRef(null)
  const [showIntro, setShowIntro] = useState(!skipIntro)
  const [revealed, setRevealed] = useState(skipIntro)

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1 })
    lenisRef.current = lenis
    if (!skipIntro) lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const nav = document.querySelector('.nav')
    let last = 0
    lenis.on('scroll', ({ scroll }) => {
      gsap.to(nav, { yPercent: scroll > last && scroll > 200 ? -120 : 0, duration: 0.4, overwrite: 'auto' })
      last = scroll
    })

    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]')
      if (!a) return
      const target = a.getAttribute('href')
      if (target.length > 1 && document.querySelector(target)) {
        e.preventDefault()
        lenis.scrollTo(target, { offset: 0 })
      } else if (target === '#top') {
        e.preventDefault()
        lenis.scrollTo(0)
      }
    }
    document.addEventListener('click', onClick)
    document.fonts.ready.then(() => ScrollTrigger.refresh())

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  useGSAP(
    () => {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      document.querySelectorAll('.btn, .contact-email').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect()
          gsap.to(el, {
            x: (e.clientX - r.left - r.width / 2) * 0.3,
            y: (e.clientY - r.top - r.height / 2) * 0.4,
            duration: 0.4,
            ease: 'power3.out',
          })
        })
        el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' }))
      })
    },
    { scope: root }
  )

  const reveal = () => {
    setRevealed(true)
    lenisRef.current?.start()
    window.scrollTo(0, 0)
  }

  return (
    <div ref={root}>
      <Cursor />
      {showIntro && <Intro onReveal={reveal} onDone={() => setShowIntro(false)} />}
      <Nav />
      <main>
        <Hero play={revealed} />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Hobbies />
        <Contact />
      </main>
    </div>
  )
}
