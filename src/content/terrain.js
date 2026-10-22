// Shared terrain look for the SVG board and the 3D box textures.
// Motifs are drawn for a hexagon of circumradius 100 and scaled per tile.

export const fills = {
  wheat: ['#fcd774', '#f1bb42'],
  hills: ['#f2ab90', '#df8267'],
  pasture: ['#d6eaa4', '#bddb88'],
  forest: ['#8fc67e', '#6aa862'],
  mountains: ['#ccd5de', '#acb8c6'],
  desert: ['#fcf2da', '#f2e4c0'],
  sea: ['#bde6e2', '#93d2d0'],
  sea2: ['#b5e1de', '#8acbca'],
}

export const glyphInk = {
  sea: { color: '#fdfbf4', opacity: 0.5 },
  forest: { color: '#4d8a52', opacity: 0.55 },
  wheat: { color: '#b98621', opacity: 0.5 },
  hills: { color: '#b4553d', opacity: 0.45 },
  pasture: { color: '#fffdf6', opacity: 0.9 },
  mountains: { color: '#76879a', opacity: 0.55 },
  desert: { color: '#d8bf8c', opacity: 0.6 },
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
  mountains: [
    { d: 'M-54 36L-26-12c1.2-2 3.6-2 4.8 0L8 36z' },
    { d: 'M-8 42L24-32c1.2-2.4 3.6-2.4 4.8 0L60 42z' },
    { d: 'M14-6L24-32c1.2-2.4 3.6-2.4 4.8 0L38-6L31-10L26-4L21-10z', color: '#fdf8ee', opacity: 0.9 },
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
