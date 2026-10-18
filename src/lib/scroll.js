// Scroll-linked motion for the content panel. Everything here is bound to the panel's own
// scrolling element (never the window), runs once per element, and is skipped entirely for
// reduced motion, so content is always readable without it.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

export const MOTION_OK = '(prefers-reduced-motion: no-preference)'
export const FINE_POINTER = '(hover: hover) and (pointer: fine)'

export const panelScroller = (el) => el?.closest('[data-panel-scroll]') ?? null

// Reveal elements once as they scroll into view: a short rise and fade. Elements already in view
// play straight away (after `delay`, so they follow the panel's own entrance rather than fight it).
export function revealOnce(targets, scroller, { y = 14, duration = 0.5, stagger = 0.06, start = 'top 92%', delay = 0.12 } = {}) {
  const els = gsap.utils.toArray(targets)
  if (!els.length || !scroller) return () => {}
  ScrollTrigger.batch(els, {
    scroller,
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration, stagger, ease: 'power2.out', delay, overwrite: true, clearProps: 'transform' }),
  })
  gsap.set(els, { opacity: 0, y })
  // Safety net on the wall clock (not GSAP's clock, which slows down on a struggling device):
  // whatever is on screen after a moment is shown, so content never stays hidden.
  const timer = setTimeout(() => {
    const box = scroller.getBoundingClientRect()
    els.forEach((el) => {
      const r = el.getBoundingClientRect()
      if (Number(gsap.getProperty(el, 'opacity')) < 1 && r.top < box.bottom && r.bottom > box.top) gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' })
    })
  }, 1600)
  return () => clearTimeout(timer)
}

// For entrances that play straight away (not on scroll): if animation frames stall (a hidden
// tab, a struggling device), jump the timeline to its end on the wall clock so nothing stays hidden.
export function finishIfStalled(timeline, ms = 1600) {
  const t = setTimeout(() => timeline.progress(1), ms)
  return () => clearTimeout(t)
}

// Measurements change after the panel finishes growing in, and when images or fonts arrive.
// Refresh then, and only for triggers inside this view.
export function refreshWhenSettled(root) {
  const refresh = () => ScrollTrigger.refresh()
  const timers = [setTimeout(refresh, 650)]
  const imgs = [...root.querySelectorAll('img')].filter((img) => !img.complete)
  imgs.forEach((img) => img.addEventListener('load', refresh, { once: true }))
  document.fonts?.ready.then(refresh)
  return () => {
    timers.forEach(clearTimeout)
    imgs.forEach((img) => img.removeEventListener('load', refresh))
  }
}

// Dev only: lets automated checks count live triggers (no duplicates after reopening a section).
if (import.meta.env.DEV) window.__ST = ScrollTrigger

// Jump to an anchor inside the content panel (e.g. /experience#ds3): scroll the panel itself,
// smoothly unless reduced motion asks otherwise, then put focus on the target's heading.
export function scrollToAnchor(id, { smooth = true } = {}) {
  const target = id && document.getElementById(id)
  const area = target?.closest('[data-panel-scroll]')
  if (!target || !area) return false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = target.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop - 16
  area.scrollTo({ top, behavior: smooth && !reduced ? 'smooth' : 'auto' })
  const heading = target.matches('h2, h3') ? target : target.querySelector('h2, h3')
  if (heading) {
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  }
  return true
}

// On arriving at a page with an anchor: jump once the surface has opened, then check again a moment
// later in case images or fonts moved things, and correct if needed. Returns a cleanup.
export function arriveAtAnchor(id) {
  if (!id) return () => {}
  const first = setTimeout(() => scrollToAnchor(id), 420)
  const again = setTimeout(() => {
    const target = document.getElementById(id)
    const area = target?.closest('[data-panel-scroll]')
    if (!target || !area) return
    const off = target.getBoundingClientRect().top - area.getBoundingClientRect().top
    const atBottom = area.scrollTop >= area.scrollHeight - area.clientHeight - 2
    if (Math.abs(off - 16) > 24 && !atBottom) scrollToAnchor(id, { smooth: false })
  }, 1200)
  return () => {
    clearTimeout(first)
    clearTimeout(again)
  }
}
