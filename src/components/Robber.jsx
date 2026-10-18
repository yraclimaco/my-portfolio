import { useId } from 'react'
import { ROBBER_COLORS as C, ROBBER_DETAILS, ROBBER_HEAD as H, ROBBER_OUTLINE } from '../lib/robberShape'

// The robber as a flat piece: the classic wooden Catan robber in light grey paint.
// Drawn in a 40 x 64 box with the base on the bottom edge.
export default function Robber({ className = '', height = 56 }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} width={height * 0.625} height={height} viewBox="0 0 40 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`rb-body-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={C.light} />
          <stop offset="0.42" stopColor={C.mid} />
          <stop offset="1" stopColor={C.dark} />
        </linearGradient>
      </defs>
      {/* A fine darker edge keeps the light grey piece crisp at small sizes and on pale backgrounds. */}
      <path d={ROBBER_OUTLINE} fill={`url(#rb-body-${id})`} stroke="#6f7376" strokeWidth="1.1" strokeLinejoin="round" />
      <path d={ROBBER_DETAILS} stroke="#5f6366" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />
      {/* the groove under the head, and a soft highlight on the ball */}
      <path d="M13.9 22.9h12.2" stroke="#5f6366" strokeOpacity="0.4" strokeWidth="0.9" strokeLinecap="round" />
      <path d={`M15.2 ${H.cy - 4.2}c1.2-1.6 3-2.4 4.8-2.4`} stroke="#fff" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}
