// Day and night. The choice lives on <html data-theme>, so CSS tokens and the 3D scene read one
// source. An explicit choice is remembered; until then the system setting decides (and is followed).
import { useSyncExternalStore } from 'react'

const KEY = 'theme'
const listeners = new Set()
let fadeTimer = 0

export const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

const stored = () => {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function apply(next, { fade }) {
  const root = document.documentElement
  if (fade) {
    root.classList.add('theme-fade')
    clearTimeout(fadeTimer)
    fadeTimer = setTimeout(() => root.classList.remove('theme-fade'), 900)
  }
  root.dataset.theme = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#152433' : '#F7F0E3')
  listeners.forEach((f) => f(next))
}

// An explicit switch by the visitor: applied now and remembered.
export function setTheme(next, { fade = true } = {}) {
  if (next === getTheme()) return
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Storage may be unavailable (private windows); the choice still applies for this visit.
  }
  apply(next, { fade })
}

// With no saved choice, follow the system setting as it changes.
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!stored()) apply(e.matches ? 'dark' : 'light', { fade: true })
  })
}

const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const useTheme = () => useSyncExternalStore(subscribe, getTheme, () => 'light')
