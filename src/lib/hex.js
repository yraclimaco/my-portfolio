// Pointy-top hexagon geometry (axial coordinates).
export const SQRT3 = Math.sqrt(3)

export function hexToPixel(q, r, s) {
  return { x: s * SQRT3 * (q + r / 2), y: s * 1.5 * r }
}

export function hexDistance(q, r) {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2
}

const f = (n) => Math.round(n * 100) / 100

// A hexagon of circumradius `size` with softly rounded corners.
export function roundedHexPath(size, radius) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90)
    return [size * Math.cos(a), size * Math.sin(a)]
  })
  const t = Math.min(radius / size, 0.45)
  let d = ''
  pts.forEach((p, i) => {
    const prev = pts[(i + 5) % 6]
    const next = pts[(i + 1) % 6]
    const a = [p[0] + (prev[0] - p[0]) * t, p[1] + (prev[1] - p[1]) * t]
    const b = [p[0] + (next[0] - p[0]) * t, p[1] + (next[1] - p[1]) * t]
    d += `${i === 0 ? 'M' : 'L'}${f(a[0])} ${f(a[1])}Q${f(p[0])} ${f(p[1])} ${f(b[0])} ${f(b[1])}`
  })
  return `${d}Z`
}

// Is (px, py) inside a pointy-top hexagon of circumradius s centred at (cx, cy)?
export function pointInHex(px, py, cx, cy, s) {
  const dx = Math.abs(px - cx) / s
  const dy = Math.abs(py - cy) / s
  if (dx > SQRT3 / 2 || dy > 1) return false
  return dy <= 1 - dx / SQRT3
}

// Small deterministic hash for organic variation (no randomness between renders).
export function hash(q, r) {
  let h = (q * 374761393 + r * 668265263) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
