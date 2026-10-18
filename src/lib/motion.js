import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(query).matches
}

function subscribe(callback) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
