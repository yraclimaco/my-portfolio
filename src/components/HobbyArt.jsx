// Small, static illustrations for Beyond Data, drawn in the portfolio's palette. Decorative only.
const art = {
  // A tied belt.
  bjj: (
    <>
      <rect x="10" y="40" width="100" height="16" rx="5" fill="#3b3129" />
      <rect x="10" y="44" width="100" height="3" fill="#5a4a3e" />
      <path d="M52 56 40 92l12 3 10-30z" fill="#3b3129" />
      <path d="M68 56l14 36-12 3-10-30z" fill="#3b3129" />
      <rect x="78" y="80" width="14" height="10" rx="2" transform="rotate(-20 85 85)" fill="#9a5b41" />
      <rect x="50" y="36" width="20" height="24" rx="6" fill="#4a3d33" />
    </>
  ),
  // A meeple, a die, and a hex tile.
  games: (
    <>
      <path d="M20 86 46 71l26 15v30L46 131 20 116z" transform="translate(-6 -38) scale(.95)" fill="#f2d48a" />
      <path d="M58 92c-3 0-5-2-4-5l7-15c-6-2-9-6-9-11 0-6 5-11 12-11s12 5 12 11c0 5-3 9-9 11l7 15c1 3-1 5-4 5z" fill="#9a5b41" />
      <circle cx="64" cy="58" r="9" fill="#9a5b41" />
      <rect x="80" y="62" width="28" height="28" rx="6" fill="#fdf8ee" stroke="#4f6e51" strokeWidth="2.5" />
      <circle cx="88" cy="70" r="2.6" fill="#4f6e51" />
      <circle cx="94" cy="76" r="2.6" fill="#4f6e51" />
      <circle cx="100" cy="82" r="2.6" fill="#4f6e51" />
    </>
  ),
  // Three fanned playing cards.
  cards: (
    <>
      <rect x="34" y="26" width="40" height="58" rx="6" transform="rotate(-16 54 55)" fill="#fdf8ee" stroke="#d4927a" strokeWidth="2.5" />
      <rect x="40" y="22" width="40" height="58" rx="6" fill="#fdf8ee" stroke="#4f6e51" strokeWidth="2.5" />
      <rect x="46" y="26" width="40" height="58" rx="6" transform="rotate(16 66 55)" fill="#fdf8ee" stroke="#9a5b41" strokeWidth="2.5" />
      <path d="M66 44c-5 6-11 9-11 14a5 5 0 0 0 9 3l-2 6h8l-2-6a5 5 0 0 0 9-3c0-5-6-8-11-14z" transform="rotate(16 66 55)" fill="#9a5b41" />
    </>
  ),
  // A bowl with chopsticks and a little steam.
  food: (
    <>
      <path d="M22 60h76c0 20-17 34-38 34S22 80 22 60z" fill="#d4927a" />
      <path d="M22 60h76" stroke="#9a5b41" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 50c16-4 28-4 34 0" stroke="#f2d48a" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M70 18 92 56M80 16 96 54" stroke="#6a4c38" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M40 40c-4-6 4-10 0-16M54 38c-4-6 4-10 0-16" stroke="#8fae8d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </>
  ),
}

export default function HobbyArt({ kind, className = '' }) {
  return (
    <svg className={`hobby-art ${className}`} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      {art[kind]}
    </svg>
  )
}
