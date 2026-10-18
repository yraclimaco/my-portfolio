// Shared terrain look for the SVG board and the 3D box textures.
// Motifs are drawn for a hexagon of circumradius 100 and scaled per tile.

export const fills = {
  wheat: ['#f7dea0', '#ecc876'],
  hills: ['#e2aa91', '#d08d74'],
  pasture: ['#cddcb5', '#b3c899'],
  forest: ['#a6c2a2', '#88a986'],
  orchard: ['#f2cfb9', '#e3b398'],
  desert: ['#f9eed4', '#eddcb6'],
  sea: ['#c4dbdc', '#a9c7ca'],
  sea2: ['#bed7d9', '#a2c1c5'],
}

export const glyphInk = {
  sea: { color: '#fdfbf4', opacity: 0.5 },
  forest: { color: '#5f8461', opacity: 0.55 },
  wheat: { color: '#c79a45', opacity: 0.5 },
  hills: { color: '#a8634a', opacity: 0.45 },
  pasture: { color: '#fdfbf4', opacity: 0.85 },
  orchard: { color: '#c98d70', opacity: 0.6 },
  desert: { color: '#d4b783', opacity: 0.65 },
}
export const DEST_GLYPH_OPACITY = 0.3

const circle = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
const ellipse = (cx, cy, rx, ry) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`

// Each shape: { d, stroke?: width, opacity?, color? } (fill when no stroke).
export const glyphs = {
  forest: [
    { d: 'M-30 30c-2 0-3-1.6-2.2-3.4L-21-2c.8-1.9 3.5-1.9 4.3 0l11.2 28.6c.8 1.8-.4 3.4-2.3 3.4z' },
    { d: 'M-2 14c-2.2 0-3.4-1.8-2.4-3.8l13.8-31.6c.9-2 3.8-2 4.7 0L27.9 10.2c1 2-.3 3.8-2.4 3.8z' },
    { d: 'M14 42c-1.9 0-3-1.6-2.2-3.3l9.6-22.6c.8-1.8 3.3-1.8 4.1 0l9.6 22.6c.8 1.7-.4 3.3-2.2 3.3z' },
    { d: 'M-19.6 30v6M11.8 14v7M23.5 42v5', stroke: 2.6 },
  ],
  wheat: [
    { d: 'M-52 -14c17-7 35-7 52 0s35 7 52 0', stroke: 2.6 },
    { d: 'M-56 4c18-7 37-7 56 0s38 7 56 0', stroke: 2.6 },
    { d: 'M-50 22c17-7 33-7 50 0s33 7 50 0', stroke: 2.6 },
    { d: 'M-6 -38v22M-11 -33l5 4 5-4M-11 -26l5 4 5-4', stroke: 2.6 },
  ],
  hills: [
    { d: 'M-58 30c10-24 24-36 38-36s24 10 32 22', stroke: 2.8 },
    { d: 'M-8 34c10-28 24-42 36-42s22 12 30 30', stroke: 2.8 },
    { d: 'M-40 12h10M14 2h10', stroke: 2.8, opacity: 0.7 },
  ],
  pasture: [
    { d: 'M-36 -2c1-6 3-10 6-12M-30 -2c0-5 1-9 3-11M-24 -2c-1-5-3-8-5-10', stroke: 2.4 },
    { d: 'M18 26c1-6 3-10 6-12M24 26c0-5 1-9 3-11M30 26c-1-5-3-8-5-10', stroke: 2.4 },
    { d: ellipse(14, -18, 10, 7) },
    { d: circle(25, -21, 4) },
    { d: ellipse(-26, 26, 8, 5.6), opacity: 0.8 },
  ],
  orchard: [
    { d: circle(-22, -6, 15) },
    { d: circle(16, -18, 13) },
    { d: circle(22, 22, 12), opacity: 0.85 },
    { d: 'M-22 9v13M16-5v12M22 34v9', stroke: 3 },
    { d: circle(-27, -10, 2.4) + circle(-16, -2, 2.4) + circle(12, -22, 2.2) + circle(25, 19, 2.2), color: '#fdf8ee', opacity: 0.8 },
  ],
  desert: [
    { d: 'M-56 34c20-12 44-12 64 0', stroke: 2.4 },
    { d: 'M-10 46c18-10 38-10 56 0', stroke: 2.4 },
    { d: 'M14 -46c14-8 28-8 40 0', stroke: 2.4, opacity: 0.7 },
  ],
  sea: [
    { d: 'M-30 -6c6-6 12-6 18 0s12 6 18 0', stroke: 2.6 },
    { d: 'M2 18c6-6 12-6 18 0s12 6 18 0', stroke: 2.6, opacity: 0.8 },
  ],
}

export const glyphFor = (terrain) => (terrain === 'sea2' ? 'sea' : terrain)
