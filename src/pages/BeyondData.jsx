import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import HobbyArt from '../components/HobbyArt'
import Lightbox from '../components/Lightbox'
import { Glyph } from '../components/ui'
import { beyondIntro, interests as content } from '../content/beyond'
import { MOTION_OK, gsap, panelScroller, refreshWhenSettled, revealOnce, arriveAtAnchor, scrollToAnchor, useGSAP } from '../lib/scroll'
import { usePageMeta } from '../lib/usePageMeta'

// Dev only: /beyond-data?photos=demo fills in sample photos (from existing site images) to check
// the layouts with one and several photos. Stripped from production builds.
function withDemoPhotos(list) {
  if (!import.meta.env.DEV || new URLSearchParams(window.location.search).get('photos') !== 'demo') return list
  const sample = [
    { src: '/work/surfcast/thumb.webp', alt: 'Sample photo one', caption: 'Sample caption for the first photo.', width: 960, height: 540 },
    { src: '/portrait.jpg', alt: 'Sample photo two', caption: 'A second sample photo.', width: 427, height: 380 },
    { src: '/work/lol/thumb.webp', alt: 'Sample photo three', width: 960, height: 540 },
    { src: '/work/adcc/thumb.webp', alt: 'Sample photo four', caption: 'A fourth, to show the overflow count.', width: 718, height: 404 },
  ]
  return list.map((it, i) => ({ ...it, photos: i === 0 ? sample : i === 1 ? sample.slice(1, 2) : it.photos }))
}

const paragraphs = (story) => (Array.isArray(story) ? story : story ? [story] : [])

function HobbyLink({ link }) {
  const external = /^https?:/.test(link.to)
  return external ? (
    <a className="hobby__link" href={link.to} target="_blank" rel="noopener">
      {link.label} <Glyph name="external" size={14} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <Link className="hobby__link" to={link.to}>
      {link.label} <Glyph name="arrow" size={14} />
    </Link>
  )
}

// Photos: one shows large; several show the first large and the next ones as a strip. Each opens
// the larger view. Without photos, the hobby's illustration fills the space instead.
function Photos({ item, onOpen }) {
  const [first, ...rest] = item.photos
  const shown = rest.slice(0, 3)
  const more = rest.length - shown.length
  return (
    <div className={`hobby__photos${rest.length ? ' has-strip' : ''}`}>
      <figure className="hobby__photo">
        <button type="button" className="hobby__photo-btn" onClick={() => onOpen(0)}>
          <img
            src={first.src}
            alt={first.alt}
            width={first.width}
            height={first.height}
            style={{ aspectRatio: first.width && first.height ? `${first.width} / ${first.height}` : undefined, objectPosition: first.position }}
            loading="lazy"
            decoding="async"
          />
          <span className="sr-only">Open larger view</span>
        </button>
        {first.caption && <figcaption>{first.caption}</figcaption>}
      </figure>
      {shown.length > 0 && (
        <ul className="hobby__strip" aria-label="More photos">
          {shown.map((p, i) => (
            <li key={p.src}>
              <button type="button" className="hobby__thumb" onClick={() => onOpen(i + 1)}>
                <img src={p.src} alt={p.alt} width={p.width} height={p.height} style={{ objectPosition: p.position }} loading="lazy" decoding="async" />
                {i === shown.length - 1 && more > 0 && (
                  <span className="hobby__more" aria-hidden="true">
                    +{more}
                  </span>
                )}
                <span className="sr-only">Open larger view{i === shown.length - 1 && more > 0 ? `, ${more} more` : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Hobby({ item }) {
  const [viewing, setViewing] = useState(null)
  const close = useCallback(() => setViewing(null), [])
  const hasPhotos = item.photos?.length > 0
  return (
    <section className={`hobby hobby--${item.id}${hasPhotos ? ' has-photos' : ''}`} id={item.id} aria-labelledby={`${item.id}-title`}>
      <div className="hobby__media">{hasPhotos ? <Photos item={item} onOpen={setViewing} /> : <HobbyArt kind={item.accent} className="hobby__art" />}</div>
      <div className="hobby__text">
        <h2 className="hobby__title" id={`${item.id}-title`} tabIndex={-1}>
          {item.title}
        </h2>
        <p className="hobby__summary">{item.summary}</p>
        {paragraphs(item.story).map((t) => (
          <p className="hobby__story" key={t}>
            {t}
          </p>
        ))}
        {item.links?.length > 0 && (
          <p className="hobby__links">
            {item.links.map((l) => (
              <HobbyLink key={l.to} link={l} />
            ))}
          </p>
        )}
      </div>
      {viewing !== null && <Lightbox photos={item.photos} index={viewing} onIndex={setViewing} onClose={close} title={item.title} />}
    </section>
  )
}

export default function BeyondData() {
  usePageMeta('Beyond Data', 'Beyond Data: the hobbies and interests of Yra Climaco.')
  const root = useRef(null)
  const location = useLocation()
  const [interests] = useState(() => withDemoPhotos(content))

  // Arriving at /beyond-data#bjj: go to that interest once the surface has opened.
  useEffect(() => {
    return arriveAtAnchor(location.hash.slice(1))
  }, [location.hash])

  // One motion style for every hobby: the picture settles into place, the words follow.
  useGSAP(
    () => {
      const scroller = panelScroller(root.current)
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const offs = [
          revealOnce('.beyond-nav', scroller, { y: 8 }),
          revealOnce('.hobby__media', scroller, { y: 20, stagger: 0.08 }),
          revealOnce('.hobby__text', scroller, { y: 12, stagger: 0.08, delay: 0.2 }),
          refreshWhenSettled(root.current),
        ]
        return () => offs.forEach((f) => f())
      })
    },
    { scope: root },
  )

  return (
    <div className="section section--beyond" ref={root}>
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Beyond Data
        </h1>
        <p className="section__lead">{beyondIntro}</p>
      </header>

      <nav className="beyond-nav" aria-label="Interests">
        {interests.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            onClick={(e) => {
              e.preventDefault()
              scrollToAnchor(it.id)
            }}
          >
            <HobbyArt kind={it.accent} className="beyond-nav__art" />
            {it.title}
          </a>
        ))}
      </nav>

      <div className="scrapbook">
        {interests.map((it) => (
          <Hobby key={it.id} item={it} />
        ))}
      </div>
    </div>
  )
}
