import { useId } from 'react'

// A small turned-wood robber: rounded head, smooth tapered body, softly rounded base.
// Matte walnut with a faint grain. Drawn in a 40×64 box with the base on the bottom edge.
export default function Robber({ className = '', height = 56 }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} width={height * 0.625} height={height} viewBox="0 0 40 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`rb-body-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a50" />
          <stop offset="0.4" stopColor="#6a4c38" />
          <stop offset="1" stopColor="#47321f" />
        </linearGradient>
        <radialGradient id={`rb-head-${id}`} cx="0.36" cy="0.32" r="0.74">
          <stop offset="0" stopColor="#9b7a5d" />
          <stop offset="0.55" stopColor="#6a4c38" />
          <stop offset="1" stopColor="#45301f" />
        </radialGradient>
        <linearGradient id={`rb-base-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#6f5139" />
          <stop offset="0.5" stopColor="#56402c" />
          <stop offset="1" stopColor="#3a2919" />
        </linearGradient>
      </defs>
      <path
        d="M15.4 20.5C14.6 26 12.6 31.5 10.6 37.4 8.4 44 7.4 49.5 7.6 54h24.8c.2-4.5-.8-10-3-16.6-2-5.9-4-11.4-4.8-16.9z"
        fill={`url(#rb-body-${id})`}
      />
      {/* faint wood grain */}
      <g fill="none" stroke="#2e1f13" strokeOpacity="0.16" strokeWidth="0.7" strokeLinecap="round">
        <path d="M17.6 24c-.8 6-2.6 12.4-4.2 18.6-.9 3.6-1.4 7-1.5 10.2" />
        <path d="M21.6 23.6c.4 6.4 1.9 12.6 3.4 18.6.8 3.4 1.2 6.8 1.3 10" />
        <path d="M19.6 30c-.3 7-.6 14.6-.4 22.4" />
      </g>
      <ellipse cx="20" cy="20.6" rx="6.4" ry="2.1" fill="#3f2b1c" />
      <circle cx="20" cy="11.4" r="8.6" fill={`url(#rb-head-${id})`} />
      <path d="M14.6 7.2c1.4-1.6 3.4-2.4 5.4-2.4" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M6.4 53.2h27.2c1.6 0 2.9 1.3 2.9 2.9v1.6c0 2.4-1.9 4.3-4.3 4.3H7.8c-2.4 0-4.3-1.9-4.3-4.3v-1.6c0-1.6 1.3-2.9 2.9-2.9z" fill={`url(#rb-base-${id})`} />
      <path d="M7 55.2h26" stroke="#fff" strokeOpacity="0.1" strokeWidth="0.8" />
    </svg>
  )
}
