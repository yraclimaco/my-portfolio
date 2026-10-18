import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Glyph } from './ui'

// A larger view of a photo set. Arrow keys move between photos, Escape closes (without also
// closing the content panel behind it), Tab stays inside, and focus returns to what opened it.
export default function Lightbox({ photos, index, onIndex, onClose, title }) {
  const ref = useRef(null)
  const closeRef = useRef(null)
  const opener = useRef(document.activeElement)
  const photo = photos[index]
  const many = photos.length > 1

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      } else if (many && e.key === 'ArrowRight') {
        e.preventDefault()
        onIndex((index + 1) % photos.length)
      } else if (many && e.key === 'ArrowLeft') {
        e.preventDefault()
        onIndex((index - 1 + photos.length) % photos.length)
      } else if (e.key === 'Tab') {
        const items = [...ref.current.querySelectorAll('button')]
        const at = items.indexOf(document.activeElement)
        e.preventDefault()
        e.stopPropagation()
        items[(at + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus()
      }
    }
    // Capture phase, so this runs before the panel's own Escape and Tab handling.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [index, many, photos.length, onClose, onIndex])

  // Focus the viewer on open; restore focus to the photo that opened it on close.
  useEffect(() => {
    const returnTo = opener.current
    closeRef.current?.focus()
    return () => returnTo?.focus?.({ preventScroll: true })
  }, [])

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} photos`} ref={ref}>
      <div className="lightbox__scrim" onClick={onClose} aria-hidden="true" />
      <figure className="lightbox__figure">
        <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
        {(photo.caption || many) && (
          <figcaption>
            {photo.caption}
            {many && (
              <span className="lightbox__count">
                {index + 1} of {photos.length}
              </span>
            )}
          </figcaption>
        )}
      </figure>
      <div className="lightbox__controls">
        {many && (
          <button type="button" className="lightbox__btn" onClick={() => onIndex((index - 1 + photos.length) % photos.length)}>
            <Glyph name="back" size={18} />
            <span className="sr-only">Previous photo</span>
          </button>
        )}
        <button type="button" className="lightbox__btn lightbox__close" onClick={onClose} ref={closeRef}>
          <Glyph name="close" size={18} />
          <span>Close</span>
        </button>
        {many && (
          <button type="button" className="lightbox__btn" onClick={() => onIndex((index + 1) % photos.length)}>
            <Glyph name="arrow" size={18} />
            <span className="sr-only">Next photo</span>
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
