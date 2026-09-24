import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { profile } from '../data'

const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }

const REELS = [
  ['🍕', '🥐', '🍩', '🥟', '🍣'],
  ['🍛', '🍩', '🍕', '🥐', '🌮'],
  ['🥟', '🍣', '🥐', '🍕', '🍜'],
]

const BELTS = ['#2F6BFF', '#7C3AED', '#8B5A2B', '#141414']

function Die({ tone }) {
  return (
    <div className={`die die--${tone}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="pip" />
      ))}
    </div>
  )
}

export default function Intro({ onReveal, onDone }) {
  const root = useRef(null)
  const tlRef = useRef(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const cap = q('.intro-caption span')[0]
      const dice = q('.die')
      const reels = q('.reel')
      const fills = q('.belt-fill')
      const cards = q('.pcard')
      const chosen = cards[2]
      const others = cards.filter((c) => c !== chosen)

      const setFace = (die, n) =>
        die.querySelectorAll('.pip').forEach((p, i) => {
          p.style.opacity = PIPS[n].includes(i) ? 1 : 0
        })
      const say = (tl, text, at) =>
        tl
          .call(() => { cap.textContent = text }, null, at)
          .fromTo(cap, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }, at)

      gsap.set(q('.beat'), { autoAlpha: 0 })
      gsap.set(root.current, { clipPath: 'circle(150% at 50% 50%)' })
      gsap.set(q('.cards'), { transformOrigin: '50% 50%' })
      gsap.set(cards, { transformOrigin: '50% 135%' })
      dice.forEach((d) => setFace(d, 1))

      const tl = gsap.timeline({ onComplete: onDone })
      tlRef.current = tl

      // 1. BOARD GAMES — dice roll
      const roll = { t: 0, last: -1 }
      say(tl, 'Roll the dice.', 0.3)
      tl.set(q('.beat-dice'), { autoAlpha: 1 }, 0.3)
        .fromTo(
          dice,
          { y: -420, rotation: -540, opacity: 0 },
          { y: 0, rotation: (i) => [12, -9][i], opacity: 1, duration: 0.9, ease: 'bounce.out', stagger: 0.12 },
          0.3
        )
        .to(
          roll,
          {
            t: 1,
            duration: 0.95,
            ease: 'none',
            onUpdate() {
              const step = Math.floor(roll.t * 13)
              if (step !== roll.last) {
                roll.last = step
                dice.forEach((d) => setFace(d, 1 + Math.floor(Math.random() * 6)))
              }
            },
          },
          0.3
        )
        .call(() => { setFace(dice[0], 4); setFace(dice[1], 3) }, null, 1.3)
        .to(dice, { scale: 1.12, yoyo: true, repeat: 1, duration: 0.12, stagger: 0.05 }, 1.3)
        .to(q('.beat-dice'), { autoAlpha: 0, scale: 0.85, duration: 0.25 }, 1.7)

      // 2. FOOD — slot reels that land on different dishes
      say(tl, 'Taste something new.', 1.8)
      tl.set(q('.beat-food'), { autoAlpha: 1 }, 1.8)
      reels.forEach((reel, i) => {
        const n = reel.children.length
        tl.fromTo(
          reel,
          { yPercent: 0 },
          { yPercent: (-(n - 1) / n) * 100, duration: 0.9 + i * 0.28, ease: 'power3.inOut' },
          1.85
        )
      })
      tl.fromTo(q('.reel-window'), { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'back.out(2)' }, 1.8)
        .to(q('.reel-window'), { scale: 1.08, yoyo: true, repeat: 1, duration: 0.14, stagger: 0.06 }, 3.35)
        .to(q('.beat-food'), { autoAlpha: 0, scale: 0.85, duration: 0.25 }, 3.85)

      // 3. BJJ — belt progression
      say(tl, 'Tighten the belt.', 3.95)
      tl.set(q('.beat-belt'), { autoAlpha: 1 }, 3.95)
        .fromTo(q('.belt-band'), { scaleX: 0, svgOrigin: '200 85' }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, 3.95)
        .fromTo(q('.belt-knot'), { scale: 0, svgOrigin: '200 85' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 4.25)
        .fromTo(
          q('.belt-tail'),
          { rotation: (i) => (i ? 35 : -35), svgOrigin: '200 104', opacity: 0 },
          { rotation: 0, opacity: 1, duration: 0.9, ease: 'elastic.out(1,0.4)' },
          4.35
        )
      BELTS.forEach((c, i) => tl.to(fills, { fill: c, duration: 0.15 }, 4.55 + i * 0.22))
      tl.fromTo(q('.belt-stripe'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 5.5)
        .to(q('.belt-svg'), { scale: 1.06, yoyo: true, repeat: 1, duration: 0.15 }, 5.65)
        .to(q('.beat-belt'), { autoAlpha: 0, scale: 0.85, duration: 0.25 }, 6.05)

      // 4. CARD MAGIC — shuffle, fan, pick, flip to reveal the name
      say(tl, 'Pick a card.', 6.15)
      tl.set(q('.beat-cards'), { autoAlpha: 1 }, 6.15)
        .fromTo(cards, { y: 260, opacity: 0, rotation: 0 }, { y: (i) => -i * 2, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 6.15)
        .to(cards, { x: (i) => (i % 2 ? -80 : 80), duration: 0.16, stagger: 0.03, yoyo: true, repeat: 3, ease: 'power2.inOut' }, 6.75)
        .to(cards, { x: 0, y: 0, rotation: (i) => (i - 2) * 15, xPercent: (i) => (i - 2) * 42, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.03 }, 7.7)
        .to(others, { opacity: 0.4, duration: 0.3 }, 8.5)
        .to(chosen, { y: -70, duration: 0.35, ease: 'power2.out', zIndex: 10 }, 8.5)
        .to(chosen, { rotation: 0, xPercent: 0, y: -10, scale: 1.75, duration: 0.5, ease: 'power3.inOut' }, 8.85)
        .to(others, { opacity: 0, duration: 0.3 }, 8.85)
        .to(q('.pcard-inner')[2], { rotationY: 180, duration: 0.7, ease: 'power3.inOut' }, 8.95)
        .call(onReveal, null, 10.15)
        .to(root.current, { clipPath: 'circle(0% at 50% 50%)', duration: 0.85, ease: 'power3.inOut' }, 10.05)
        .to(q('.intro-caption, .intro-skip, .intro-progress'), { opacity: 0, duration: 0.2 }, 9.9)

      tl.eventCallback('onUpdate', () => {
        const bar = q('.intro-progress i')[0]
        if (bar) bar.style.transform = `scaleX(${tl.progress()})`
      })
      tl.timeScale(1.25)
    },
    { scope: root }
  )

  const skip = () => tlRef.current && tlRef.current.timeScale(6)

  return (
    <div className="intro" ref={root} aria-hidden="true">
      <div className="intro-glow intro-glow--a" />
      <div className="intro-glow intro-glow--b" />

      <button className="intro-skip" onClick={skip} data-hover>
        Skip intro
      </button>

      <div className="intro-stage">
        <div className="beat beat-dice">
          <Die tone="cream" />
          <Die tone="coral" />
        </div>

        <div className="beat beat-food">
          {REELS.map((items, i) => (
            <div className="reel-window" key={i}>
              <div className="reel">
                {items.map((e) => (
                  <span key={e}>{e}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="beat beat-belt">
          <svg className="belt-svg" viewBox="0 0 400 200" role="img">
            <g stroke="#0E1224" strokeWidth="3" strokeLinejoin="round">
              <path className="belt-tail belt-fill" fill="#F4F4F4" d="M188 104 L158 182 L186 192 L206 106 Z" />
              <path className="belt-tail belt-fill" fill="#F4F4F4" d="M194 106 L214 192 L242 182 L212 104 Z" />
              <rect className="belt-band belt-fill" fill="#F4F4F4" x="30" y="70" width="340" height="30" />
              <rect className="belt-stripe" fill="#E5252A" x="304" y="70" width="28" height="30" />
              <rect className="belt-knot belt-fill" fill="#F4F4F4" x="178" y="62" width="44" height="46" rx="6" />
            </g>
          </svg>
        </div>

        <div className="beat beat-cards">
          <div className="cards">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="pcard" key={i}>
                <div className="pcard-inner">
                  <div className="pcard-face pcard-back" />
                  <div className="pcard-face pcard-front">
                    <span className="corner corner--tl">A<br />♥</span>
                    <span className="pcard-name">
                      {profile.firstName}
                      <br />
                      {profile.name.split(' ')[1]}
                    </span>
                    <span className="corner corner--br">A<br />♥</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="intro-caption">
        <span>&nbsp;</span>
      </p>
      <div className="intro-progress">
        <i />
      </div>
    </div>
  )
}
