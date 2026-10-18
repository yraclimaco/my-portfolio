// Canvas artwork for the 3D box: the printed lid, the miniature board, and the tile tops.
// Everything is drawn with the same fills and motifs as the SVG board.
import { islandTiles } from '../content/board'
import { DEST_GLYPH_OPACITY, fills, glyphFor, glyphInk, glyphs } from '../content/terrain'
import { profile } from '../content/profile'
import { SQRT3, hash, hexDistance, roundedHexPath } from '../lib/hex'
import { ROBBER_COLORS, ROBBER_OUTLINE } from '../lib/robberShape'

const FONT = '"Manrope Variable", "Segoe UI", system-ui, sans-serif'
const glyphPaths = Object.fromEntries(
  Object.entries(glyphs).map(([k, shapes]) => [k, shapes.map((sh) => ({ ...sh, path: new Path2D(sh.d) }))]),
)

export function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function radial(ctx, x, y, size, [inner, outer]) {
  // Matches the SVG radialGradient (cx 0.42, cy 0.36, r 0.78 of the bounding box).
  const gx = x - size * 0.08 * SQRT3
  const gy = y - size * 0.28
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, size * 1.46)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  return g
}

function drawGlyph(ctx, terrain, x, y, s, opacity) {
  const name = glyphFor(terrain)
  const ink = glyphInk[name]
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s / 100, s / 100)
  ctx.lineCap = 'round'
  for (const sh of glyphPaths[name]) {
    ctx.globalAlpha = (opacity ?? ink.opacity) * (sh.opacity ?? 1)
    if (sh.stroke) {
      ctx.strokeStyle = sh.color ?? ink.color
      ctx.lineWidth = sh.stroke
      ctx.stroke(sh.path)
    } else {
      ctx.fillStyle = sh.color ?? ink.color
      ctx.fill(sh.path)
    }
  }
  ctx.restore()
}

function hexAt(ctx, path, x, y, fill) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = fill
  ctx.fill(path)
  ctx.restore()
}

// A paper-like grain, tiled. Very low contrast so print stays matte rather than noisy.
function grain(ctx, w, h, alpha) {
  const n = makeCanvas(160, 160)
  const nctx = n.getContext('2d')
  const img = nctx.createImageData(160, 160)
  let seed = 7
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647
    const v = (seed / 2147483647) * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  nctx.putImageData(img, 0, 0)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = ctx.createPattern(n, 'repeat')
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

// The board as seen from above, centred at (cx, cy) with hex size s (px).
// `withLand` false leaves the land out (the 3D tiles sit there instead).
export function drawBoard(ctx, w, h, cx, cy, s, { withLand = true, background = '#aecbce' } = {}) {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, w, h)
  const sea = new Path2D(roundedHexPath(s * 0.95, s * 0.26))
  const land = new Path2D(roundedHexPath(s * 0.93, s * 0.22))
  const shore = new Path2D(roundedHexPath(s * 1.09, s * 0.36))
  const N = Math.ceil(Math.max(w, h) / (1.5 * s)) + 2
  const pos = (q, r) => [cx + s * SQRT3 * (q + r / 2), cy + s * 1.5 * r]

  for (let q = -N; q <= N; q++) {
    for (let r = -N; r <= N; r++) {
      if (hexDistance(q, r) <= 2) continue
      const [x, y] = pos(q, r)
      if (x < -s * 2 || x > w + s * 2 || y < -s * 2 || y > h + s * 2) continue
      const terrain = hash(q, r) > 0.5 ? 'sea' : 'sea2'
      hexAt(ctx, sea, x, y, radial(ctx, x, y, s * 0.95, fills[terrain]))
      if (hash(q + 7, r - 3) > 0.62) drawGlyph(ctx, terrain, x, y, s)
    }
  }

  const tiles = islandTiles()
  ctx.save()
  ctx.shadowColor = 'rgb(31 58 60 / 0.22)'
  ctx.shadowBlur = s * 0.28
  ctx.shadowOffsetY = s * 0.06
  for (const t of tiles) {
    const [x, y] = pos(t.q, t.r)
    hexAt(ctx, shore, x, y, '#f3e7cc')
  }
  ctx.restore()

  if (!withLand) return
  for (const t of tiles) {
    const [x, y] = pos(t.q, t.r)
    hexAt(ctx, land, x, y, radial(ctx, x, y, s * 0.93, fills[t.terrain]))
    drawGlyph(ctx, t.terrain, x, y, s, t.dest ? DEST_GLYPH_OPACITY : undefined)
  }
}

// One tile top, filling a square canvas. The hex circumradius maps to half the canvas.
export function drawTileTop(terrain, dest, size = 256) {
  const c = makeCanvas(size, size)
  const ctx = c.getContext('2d')
  const r = size / 2
  ctx.fillStyle = radial(ctx, r, r, r, fills[terrain])
  ctx.fillRect(0, 0, size, size)
  // Motifs are drawn for the board's hex size, which is the tile radius / 0.93.
  drawGlyph(ctx, terrain, r, r, r / 0.93, dest ? DEST_GLYPH_OPACITY : undefined)
  return c
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// The printed lid. Aspect matches the lid top (width / depth).
export function drawLid(w, h) {
  const c = makeCanvas(w, h)
  const ctx = c.getContext('2d')
  const u = w / 100 // one percent of the lid width

  const bg = ctx.createLinearGradient(0, 0, w * 0.4, h * 1.1)
  bg.addColorStop(0, '#567858')
  bg.addColorStop(0.55, '#4f6f52')
  bg.addColorStop(1, '#46654b')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  const glow = ctx.createRadialGradient(w * 0.22, h * 0.2, 0, w * 0.22, h * 0.2, w * 0.6)
  glow.addColorStop(0, 'rgb(255 255 255 / 0.07)')
  glow.addColorStop(1, 'rgb(255 255 255 / 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // Inset border, like a printed frame.
  ctx.save()
  ctx.strokeStyle = 'rgb(253 248 238 / 0.38)'
  ctx.lineWidth = u * 0.32
  ctx.setLineDash([u * 1.1, u * 0.9])
  roundRect(ctx, u * 3.4, u * 3.4, w - u * 6.8, h - u * 6.8, u * 2.4)
  ctx.stroke()
  ctx.restore()

  // Landscape: art on the left, title on the right. Portrait: art above, title centred below.
  const portrait = h > w
  const L = portrait
    ? { ax: w * 0.5, ay: u * 49, as: u * 5.6, tx: w * 0.5, align: 'center', maxW: u * 84, k: 1.45, y0: u * 92.6, oneLine: true }
    : { ax: w * 0.27, ay: h * 0.5, as: u * 3.6, tx: w * 0.53, align: 'left', maxW: w * 0.39, k: 1, y0: h * 0.365, oneLine: false }

  // Artwork: the island in a sea medallion.
  const { ax, ay, as } = L
  ctx.beginPath()
  ctx.arc(ax, ay, as * 4.9, 0, Math.PI * 2)
  ctx.fillStyle = 'rgb(196 219 220 / 0.2)'
  ctx.fill()
  ctx.save()
  ctx.beginPath()
  ctx.arc(ax, ay, as * 4.55, 0, Math.PI * 2)
  ctx.clip()
  drawBoard(ctx, w, h, ax, ay, as, { background: '#a9c7ca' })
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.arc(ax, ay, as * 4.55, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgb(253 248 238 / 0.55)'
  ctx.lineWidth = u * 0.35
  ctx.stroke()
  ctx.restore()
  drawRobber(ctx, ax, ay + as * 0.25, as * 0.95)

  // Title block.
  const { tx, k, y0 } = L
  const at = (n) => y0 + u * n * k
  // Shrinks a line until it fits the title column.
  const line = (text, weight, size, x, y, color) => {
    let px = size * k
    ctx.font = `${weight} ${px}px ${FONT}`
    while (ctx.measureText(text).width > L.maxW && px > size * k * 0.6) {
      px *= 0.96
      ctx.font = `${weight} ${px}px ${FONT}`
    }
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
  }
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = L.align
  line('A portfolio in six destinations', 600, u * 2.15, tx, y0, '#fbf0d2')

  const nx = portrait ? tx : tx - u * 0.3
  ctx.save()
  ctx.letterSpacing = `${-u * 0.12 * k}px`
  if (L.oneLine) {
    line(profile.name, 700, u * 7.4, nx, at(7.6), '#fdf8ee')
  } else {
    const [first, ...rest] = profile.name.split(' ')
    line(first, 700, u * 7.4, nx, at(8.4), '#fdf8ee')
    line(rest.join(' '), 700, u * 7.4, nx, at(15.6), '#fdf8ee')
  }
  ctx.restore()

  const shift = L.oneLine ? -7.2 : 0
  line(profile.focus, 600, u * 2.6, tx, at(20.6 + shift), '#fdf8ee')

  grain(ctx, w, h, 0.09)
  return c
}

// A flat robber silhouette for the lid art (base centred at x, y).
function drawRobber(ctx, x, y, s) {
  ctx.save()
  ctx.translate(x - s * 0.5, y - s * 1.6)
  const k = s / 40
  ctx.scale(k, k)
  ctx.fillStyle = 'rgb(20 20 24 / 0.25)'
  ctx.beginPath()
  ctx.ellipse(20, 62, 15, 3.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = ROBBER_COLORS.mid
  ctx.fill(new Path2D(ROBBER_OUTLINE))
  ctx.restore()
}

// Contact shadow for under the box: a wide soft falloff plus a tight dark core.
// The core rectangle spans the middle 62% of the texture.
export function drawContactShadow(size = 512) {
  const c = makeCanvas(size, size)
  const ctx = c.getContext('2d')
  ctx.fillStyle = 'rgb(48 40 32)'
  ctx.filter = `blur(${size * 0.055}px)`
  ctx.globalAlpha = 0.5
  roundRect(ctx, size * 0.17, size * 0.18, size * 0.66, size * 0.66, size * 0.08)
  ctx.fill()
  ctx.filter = `blur(${size * 0.012}px)`
  ctx.globalAlpha = 0.8
  roundRect(ctx, size * 0.19, size * 0.19, size * 0.62, size * 0.62, size * 0.03)
  ctx.fill()
  return c
}

// Plain kraft-paper colour with grain, for the inside of the box and the base walls.
export function drawPaper(color, size = 256, alpha = 0.12) {
  const c = makeCanvas(size, size)
  const ctx = c.getContext('2d')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)
  grain(ctx, size, size, alpha)
  return c
}

// A soft round falloff (white, alpha only), used for dust motes and the robber's contact shadow.
export function drawSoftDot(size = 64, hardness = 0.25) {
  const c = makeCanvas(size, size)
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgb(255 255 255 / 1)')
  g.addColorStop(hardness, 'rgb(255 255 255 / 0.8)')
  g.addColorStop(1, 'rgb(255 255 255 / 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return c
}
