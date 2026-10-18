// Geometry helpers for the 3D world: box walls, rounded hex tiles, the turned robber.
import { ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from 'three'

export async function fontsReady() {
  if (!document.fonts?.load) return
  const fam = '"Manrope Variable"'
  await Promise.race([
    Promise.all([document.fonts.load(`700 64px ${fam}`), document.fonts.load(`600 32px ${fam}`)]),
    new Promise((r) => setTimeout(r, 1500)),
  ])
}

export function roundedRect(w, d, r) {
  const s = new Shape()
  const x = -w / 2
  const y = -d / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + d - r)
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  s.lineTo(x + r, y + d)
  s.quadraticCurveTo(x, y + d, x, y + d - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

// A rectangular wall ring (rounded corners), standing on y = 0, of height h.
export function wallRing(w, d, wall, h, r) {
  const shape = roundedRect(w, d, r)
  shape.holes.push(roundedRect(w - wall * 2, d - wall * 2, Math.max(r - wall, 0.02)))
  const g = new ExtrudeGeometry(shape, {
    depth: h - 0.04,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 6,
  })
  g.rotateX(-Math.PI / 2)
  g.translate(0, 0.02, 0)
  return g
}

// The board's rounded hexagon (same construction as lib/hex roundedHexPath), y up.
export function hexShape(size, radius) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90)
    return [size * Math.cos(a), -size * Math.sin(a)]
  })
  const t = Math.min(radius / size, 0.45)
  const s = new Shape()
  pts.forEach((p, i) => {
    const prev = pts[(i + 5) % 6]
    const next = pts[(i + 1) % 6]
    const a = [p[0] + (prev[0] - p[0]) * t, p[1] + (prev[1] - p[1]) * t]
    const b = [p[0] + (next[0] - p[0]) * t, p[1] + (next[1] - p[1]) * t]
    if (i === 0) s.moveTo(a[0], a[1])
    else s.lineTo(a[0], a[1])
    s.quadraticCurveTo(p[0], p[1], b[0], b[1])
  })
  s.closePath()
  return s
}

// Tile tops map the texture square onto the hex (circumradius R maps to half the texture).
export const tileUV = (R) => ({
  generateTopUV(_g, v, a, b, c) {
    return [a, b, c].map((i) => new Vector2(v[i * 3] / (2 * R) + 0.5, v[i * 3 + 1] / (2 * R) + 0.5))
  },
  generateSideWallUV() {
    return [new Vector2(), new Vector2(), new Vector2(), new Vector2()]
  },
})

// Turned-wood robber, following the outline of the 2D piece (40 x 64 drawing units).
export function robberGeometry(height) {
  const pts = [
    [0, 62], [13.6, 62], [15.7, 61.2], [16.5, 59.6], [16.5, 56.6], [15.6, 54.7], [12.4, 54],
    [12.1, 49], [11.2, 44], [9.4, 37.4], [7.4, 31], [5.6, 25], [4.7, 21.6], [6.3, 21.2], [6.4, 20.4], [5.4, 19.7],
  ]
  for (let a = -62; a <= 90; a += 8) {
    const rad = (a * Math.PI) / 180
    pts.push([8.6 * Math.cos(rad), 11.4 - 8.6 * Math.sin(rad)])
  }
  pts.push([0, 2.8])
  const k = height / 59.2
  return new LatheGeometry(
    pts.map(([r, y]) => new Vector2(Math.max(r, 0) * k, (62 - y) * k)),
    40,
  )
}
