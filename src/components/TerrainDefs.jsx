import { fills, glyphs } from '../content/terrain'

// Shared SVG definitions for the board: soft terrain gradients and terrain motifs.
export default function TerrainDefs() {
  return (
    <defs>
      {Object.entries(fills).map(([name, [inner, outer]]) => (
        <radialGradient key={name} id={`fill-${name}`} cx="0.42" cy="0.36" r="0.78">
          <stop offset="0" stopColor={inner} />
          <stop offset="1" stopColor={outer} />
        </radialGradient>
      ))}

      <filter id="land-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="3" stdDeviation="4.5" floodColor="#3b3129" floodOpacity="0.14" />
      </filter>
      <filter id="shore-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#1f3a3c" floodOpacity="0.22" />
      </filter>

      {Object.entries(glyphs).map(([name, shapes]) => (
        <g key={name} id={`glyph-${name}`}>
          {shapes.map((sh, i) =>
            sh.stroke ? (
              <path key={i} d={sh.d} fill="none" stroke={sh.color ?? 'currentColor'} strokeWidth={sh.stroke} strokeLinecap="round" opacity={sh.opacity} />
            ) : (
              <path key={i} d={sh.d} fill={sh.color ?? 'currentColor'} opacity={sh.opacity} />
            ),
          )}
        </g>
      ))}
    </defs>
  )
}
