// A little life for the board: soft terrain details standing on the outer tiles, and a very
// light drift of wind trails and leaves above the island.
//
// Ownership: the details ride on their tile meshes (so they rise with the island) and are only
// scaled by the opening timeline in world.js. Trails and leaves are driven here by GSAP and are
// paused whenever content covers the board. Nothing here moves under reduced motion.
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import gsap from 'gsap'
import { hash } from '../lib/hex'

function rng(seed) {
  let s = Math.max(1, Math.floor(seed) % 2147483647)
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const tmpM = new Matrix4()
const tmpQ = new Quaternion()
const tmpE = new Euler()
const tmpP = new Vector3()
const tmpS = new Vector3()

// A geometry placed with a matrix and painted, ready to merge. Colour is shaded softly from base
// to top (a little darker below, a little lighter above), or banded by height for layered clay and
// stone, the way a hand-painted miniature would be.
function part(geo, color, x, y, z, { sx = 1, sy = 1, sz = 1, tiltX = 0, tiltZ = 0, rotY = 0, shade = 0.18, bands = null } = {}) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone()
  tmpM.compose(tmpP.set(x, y, z), tmpQ.setFromEuler(tmpE.set(tiltX, rotY, tiltZ)), tmpS.set(sx, sy, sz))
  g.applyMatrix4(tmpM)
  g.deleteAttribute('uv')
  const pos = g.getAttribute('position')
  const n = pos.count
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < n; i++) {
    lo = Math.min(lo, pos.getY(i))
    hi = Math.max(hi, pos.getY(i))
  }
  const span = Math.max(hi - lo, 1e-5)
  const base = new Color(color)
  const bandCols = bands?.map(([max, c]) => [max, new Color(c)])
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const t = (pos.getY(i) - lo) / span
    const c = bandCols ? (bandCols.find(([max]) => t <= max) ?? bandCols[bandCols.length - 1])[1] : base
    const k = 1 - shade * (1 - t) + shade * 0.18 * t
    arr[i * 3] = c.r * k
    arr[i * 3 + 1] = c.g * k
    arr[i * 3 + 2] = c.b * k
  }
  g.setAttribute('color', new BufferAttribute(arr, 3))
  return g
}

// A flat, soft patch under a piece of scenery, so everything sits on its tile.
const patch = new PlaneGeometry(1, 1).rotateX(-Math.PI / 2)
function decal(x, z, r) {
  const g = patch.clone()
  tmpM.compose(tmpP.set(x, 0.004, z), tmpQ.identity(), tmpS.set(r * 2, 1, r * 2))
  g.applyMatrix4(tmpM)
  return g
}

const ball = new SphereGeometry(1, 10, 7)
const cone5 = new ConeGeometry(1, 1, 5, 1, true)
const box = new BoxGeometry(1, 1, 1)
const rock = new IcosahedronGeometry(1, 0)
const thin = new CylinderGeometry(1, 1, 1, 5)
// A brick with softly rounded edges (the bevel is relative, so it stays small once scaled).
const brickGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.14)

const lathe = (profile, seg) => new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), seg)

// A trunk with a little flare at the foot.
const trunkGeo = lathe([[0.95, 0], [0.7, 0.1], [0.52, 0.36], [0.46, 1]], 7)
// One tier of foliage: a skirt with a soft rim that narrows to a rounded tip.
const tierGeo = lathe([[1, 0], [0.97, 0.07], [0.8, 0.3], [0.54, 0.6], [0.26, 0.86], [0.07, 0.98], [0, 1]], 9)

// A low, rounded rocky peak: gently domed with an uneven base, so no two read as copies.
function peakGeo(seed) {
  const g = lathe([[1, 0], [0.94, 0.12], [0.8, 0.32], [0.62, 0.55], [0.42, 0.76], [0.22, 0.92], [0.08, 0.99], [0, 1]], 8)
  const pos = g.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const a = Math.atan2(z, x)
    const k = 1 + 0.13 * Math.sin(a * 3 + seed) + 0.06 * Math.sin(a * 5 + seed * 2)
    pos.setXYZ(i, x * k, pos.getY(i) * (1 + 0.06 * Math.sin(a * 2 + seed)), z * k)
  }
  return g
}
const peaks = [peakGeo(1.1), peakGeo(2.7), peakGeo(4.3)]

// Warm, matte, sunny colours.
const PALETTE = {
  trunk: '#b98e6a',
  pine: ['#4f9c50', '#5dab5b', '#6fbb69'],
  bricks: ['#c9583e', '#d2654a', '#bf5039', '#d86f53'],
  ridge: '#eab03a',
  stalk: '#e9c055',
  ear: '#f6cf55',
  wool: '#fffbf0',
  woolShade: '#f1ead8',
  face: '#6a5748',
  grass: ['#8fcb6c', '#a3d87c'],
  stone: ['#a1aebd', '#adb9c7', '#95a3b3'],
  snow: '#f4f7fa',
  boulder: '#b9c3cf',
}

const pick = (list, rand) => list[Math.floor(rand() * list.length)]

// ---------- Keeping things on their own tile

// A pointy-top hex of circumradius 0.93 has an inradius of about 0.805. `fits` is true when a disc
// of radius r at (x, z) sits inside it with `pad` to spare.
const INRADIUS = 0.805
const PAD = 0.075
const EDGES = [-60, 0, 60, 120, 180, 240].map((d) => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)])
const fits = (x, z, r) => EDGES.every(([nx, nz]) => x * nx + z * nz + r + PAD <= INRADIUS)
// From the board camera, height shows as a shift towards the back of the tile, so the top of a
// piece is checked too, at the place it appears to stand.
const LEAN = 0.66
const fitsFromCamera = (x, z, r, h) => fits(x, z, r) && fits(x, z - h * LEAN, r * 0.6)

// ---------- Pieces

// A layered pine: a flared trunk and stacked, softly curved tiers, lighter towards the top.
function pine(c, x, z, H, R, tiers = 3) {
  const trunkH = H * 0.22
  c.solid.push(part(trunkGeo, PALETTE.trunk, x, 0, z, { sx: R * 0.2, sy: trunkH, sz: R * 0.2, shade: 0.1 }))
  const vary = 0.96 + c.rand() * 0.08
  for (let k = 0; k < tiers; k++) {
    const r = R * (1 - k * (tiers === 3 ? 0.27 : 0.32))
    const h = H * (tiers === 3 ? 0.4 : 0.5)
    const col = new Color(PALETTE.pine[k + (3 - tiers)]).multiplyScalar(vary).getStyle()
    c.sway.push(part(tierGeo, col, x, trunkH * 0.7 + k * H * (tiers === 3 ? 0.23 : 0.28), z, { sx: r, sy: h, sz: r, rotY: k * 0.5, shade: 0.2 }))
  }
  c.shadow(x + 0.02, z + 0.02, R * 1.5)
}

function sheep(c, x, z, ang) {
  const K = 1.2
  const cs = Math.cos(ang)
  const sn = Math.sin(ang)
  const at = (f, s) => [x + cs * f * K - sn * s * K, z + sn * f * K + cs * s * K]
  const [hx, hz] = at(0.072, 0)
  c.solid.push(part(ball, PALETTE.wool, x, 0.056 * K, z, { sx: 0.07 * K, sy: 0.052 * K, sz: 0.052 * K, rotY: -ang, shade: 0.12 }))
  const [fx, fz] = at(-0.01, 0)
  c.solid.push(part(ball, PALETTE.woolShade, fx, 0.082 * K, fz, { sx: 0.044 * K, sy: 0.03 * K, sz: 0.04 * K, rotY: -ang, shade: 0.06 }))
  c.solid.push(part(ball, PALETTE.face, hx, 0.064 * K, hz, { sx: 0.028 * K, sy: 0.028 * K, sz: 0.024 * K, rotY: -ang, shade: 0.06 }))
  for (const side of [-1, 1]) {
    const [ex, ez] = at(0.062, side * 0.022)
    c.solid.push(part(ball, PALETTE.face, ex, 0.075 * K, ez, { sx: 0.014 * K, sy: 0.008 * K, sz: 0.01 * K, rotY: -ang + side * 0.5, shade: 0 }))
  }
  for (const [f, s] of [[0.03, 0.02], [0.03, -0.02], [-0.03, 0.02], [-0.03, -0.02]]) {
    const [lx, lz] = at(f, s)
    c.solid.push(part(thin, PALETTE.face, lx, 0.015 * K, lz, { sx: 0.007 * K, sy: 0.03 * K, sz: 0.007 * K, shade: 0 }))
  }
  c.shadow(x, z, 0.085 * K)
}

// Two tidy furrows with three small, evenly spaced clusters of wheat on each.
function wheatRows(c, cx, cz) {
  const a = c.rand() * Math.PI
  const ux = Math.cos(a)
  const uz = Math.sin(a)
  const px = -uz
  const pz = ux
  for (const row of [-1, 1]) {
    const rx = cx + px * row * 0.085
    const rz = cz + pz * row * 0.085
    c.solid.push(part(box, PALETTE.ridge, rx, 0.011, rz, { sx: 0.5, sy: 0.022, sz: 0.05, rotY: -a, shade: 0.08 }))
    for (let i = -1; i <= 1; i++) {
      const bx = rx + ux * i * 0.17
      const bz = rz + uz * i * 0.17
      for (let s = 0; s < 5; s++) {
        const t = (s / 5) * Math.PI * 2
        const x = bx + Math.cos(t) * 0.019
        const z = bz + Math.sin(t) * 0.019
        const h = 0.17 + (s % 2) * 0.012
        const lx = Math.cos(t) * 0.1
        const lz = Math.sin(t) * 0.1
        c.sway.push(part(thin, PALETTE.stalk, x, h / 2, z, { sx: 0.0045, sy: h, sz: 0.0045, tiltZ: -lx, tiltX: lz, shade: 0.1 }))
        c.sway.push(part(cone5, PALETTE.ear, x + lx * h * 0.5, h + 0.02, z + lz * h * 0.5, { sx: 0.012, sy: 0.054, sz: 0.012, tiltZ: -lx, tiltX: lz, shade: 0.06 }))
      }
    }
  }
  c.shadow(cx, cz, 0.3)
}

// A small stack of terracotta bricks: courses of two, each turned across the one below, with a
// little give in every brick so it feels laid by hand.
function brickStack(c, x, z, courses) {
  const L = 0.15
  const W = 0.072
  const H = 0.056
  const yaw = (c.rand() - 0.5) * 0.5
  for (let k = 0; k < courses; k++) {
    const turned = k % 2 === 1
    for (const side of [-1, 1]) {
      const off = side * (W / 2 + 0.002)
      const ox = turned ? off : 0
      const oz = turned ? 0 : off
      const jx = (c.rand() - 0.5) * 0.006
      const jz = (c.rand() - 0.5) * 0.006
      const cs = Math.cos(yaw)
      const sn = Math.sin(yaw)
      c.rounded.push(
        part(brickGeo, pick(PALETTE.bricks, c.rand), x + (ox + jx) * cs + (oz + jz) * sn, H / 2 + k * (H + 0.001), z - (ox + jx) * sn + (oz + jz) * cs, {
          sx: turned ? W : L,
          sy: H,
          sz: turned ? L : W,
          rotY: yaw + (c.rand() - 0.5) * 0.06,
          shade: 0.12,
        }),
      )
    }
  }
  c.shadow(x, z, 0.13)
}

// A single brick lying on its side nearby.
function looseBrick(c, x, z, yaw) {
  c.rounded.push(part(brickGeo, pick(PALETTE.bricks, c.rand), x, 0.028, z, { sx: 0.15, sy: 0.056, sz: 0.072, rotY: yaw, shade: 0.12 }))
  c.shadow(x, z, 0.09)
}

function peak(c, x, z, R, H, i, yaw) {
  const col = PALETTE.stone[i % PALETTE.stone.length]
  c.solid.push(
    part(peaks[i % peaks.length], col, x, 0, z, {
      sx: R,
      sy: H,
      sz: R,
      rotY: yaw,
      shade: 0.22,
      // Stone below with a small cream cap, blending where they meet.
      bands: [
        [0.78, col],
        [1, PALETTE.snow],
      ],
    }),
  )
  c.shadow(x + 0.02, z + 0.02, R * 1.2)
}

// Each recipe fills `solid` (still) and `sway` (leans a little in the breeze). `place` returns
// spots that keep each piece, and what it looks like from the board camera, inside the tile.
const recipes = {
  // Wood: pines.
  forest(c) {
    const trees = [
      [0.5, 3, 0.125],
      [0.4, 3, 0.115],
      [0.3, 2, 0.1],
    ]
    c.place(3, { r: 0.14, h: 0.5 }).forEach(([x, z], i) => pine(c, x, z, trees[i][0] * (0.95 + c.rand() * 0.1), trees[i][2], trees[i][1]))
  },
  // Brick: small, tidy stacks of terracotta bricks.
  hills(c) {
    const spots = c.place(3, { r: 0.14, h: 0.24 })
    const courses = [4, 3, 2]
    spots.forEach(([x, z], i) => brickStack(c, x, z, courses[i]))
    const [loose] = c.place(1, { r: 0.1, h: 0.06 })
    if (loose) looseBrick(c, loose[0], loose[1], c.rand() * 3)
  },
  // Wool: a few restrained grass tufts and sheep.
  pasture(c) {
    c.place(2, { r: 0.1, h: 0.12 }).forEach(([x, z]) => sheep(c, x, z, c.rand() * Math.PI * 2))
    for (const [x, z] of c.place(3, { r: 0.04, h: 0.05 })) {
      const col = pick(PALETTE.grass, c.rand)
      for (let b = -1; b <= 1; b++) {
        c.sway.push(part(cone5, col, x + b * 0.014, 0.024, z, { sx: 0.011, sy: 0.05, sz: 0.011, tiltZ: b * 0.28, shade: 0.12 }))
      }
    }
  },
  // Grain: tidy rows of wheat.
  wheat(c) {
    const [[x, z] = c.center] = c.place(1, { r: 0.27, h: 0.22 })
    wheatRows(c, x, z)
  },
  // Ore: three low, rounded peaks with small cream caps, and a couple of boulders.
  mountains(c) {
    const sizes = [
      [0.17, 0.26],
      [0.125, 0.19],
      [0.09, 0.13],
    ]
    sizes.forEach(([R, H], i) => {
      const [spot] = c.place(1, { r: R, h: H })
      if (spot) peak(c, spot[0], spot[1], R, H, i, c.rand() * 3)
    })
    for (const [x, z] of c.place(2, { r: 0.035, h: 0.03 })) {
      const r = 0.022 + c.rand() * 0.012
      c.solid.push(part(rock, PALETTE.boulder, x, r * 0.4, z, { sx: r, sy: r * 0.65, sz: r, rotY: c.rand() * 3, shade: 0.2 }))
    }
  },
}

// Details for the outer ring. Everything is placed inside its own tile, clear of the edges.
export function buildDetails({ tiles, tileMeshes, localTop, startScale, shadowMap }) {
  const holders = []
  const lit = new MeshLambertMaterial({ vertexColors: true, flatShading: true })
  const smoothLit = new MeshLambertMaterial({ vertexColors: true })
  const soft = new MeshBasicMaterial({ map: shadowMap, color: '#5c3d22', transparent: true, opacity: 0.3, depthWrite: false, fog: false })
  tiles.forEach((t, i) => {
    const recipe = recipes[t.terrain]
    if (t.dest || t.d < 2 || !recipe) return
    const rand = rng(hash(t.q * 31 + 5, t.r * 17 - 3) * 1e9 + 7)
    // Settled slightly towards the front of the tile, so tall pieces still stand inside it from the camera.
    const center = [0, 0.05]
    const taken = []
    const place = (n, { r, h }) => {
      const pts = []
      let guard = 0
      while (pts.length < n && guard++ < 240) {
        const a = rand() * Math.PI * 2
        const d = Math.sqrt(rand()) * 0.5
        const x = center[0] + Math.cos(a) * d
        const z = center[1] + Math.sin(a) * d
        if (fitsFromCamera(x, z, r, h) && taken.every(([px, pz, pr]) => Math.hypot(px - x, pz - z) > r + pr + 0.03)) {
          pts.push([x, z])
          taken.push([x, z, r])
        }
      }
      return pts
    }
    const solid = []
    const rounded = []
    const sway = []
    const decals = []
    recipe({ place, rand, solid, rounded, sway, center, shadow: (x, z, r) => decals.push(decal(x, z, r)) })
    const holder = new Group()
    holder.position.y = localTop
    holder.scale.setScalar(startScale)
    const make = (parts, material, cast) => {
      const geo = parts.length ? mergeGeometries(parts) : null
      if (!geo) return null
      const mesh = new Mesh(geo, material)
      mesh.castShadow = cast
      return mesh
    }
    const ground = make(decals, soft, false)
    if (ground) {
      ground.renderOrder = 1
      holder.add(ground)
    }
    const still = make(solid, lit, true)
    if (still) holder.add(still)
    // Smooth-shaded forms (the bricks) keep their softened edges.
    const smooth = make(rounded, smoothLit, true)
    if (smooth) holder.add(smooth)
    // The moving parts hang from a pivot at the foot of the group, so they lean as one.
    const pivot = new Group()
    const moving = make(sway, lit, true)
    if (moving) {
      pivot.add(moving)
      holder.add(pivot)
    }
    tileMeshes[i].add(holder)
    holders.push({ holder, pivot: moving ? pivot : null, d: t.d })
  })
  return holders
}

// ---------- Drift: wind trails and leaves

// A narrow soft-edged bump, used as an alpha map: the gust is the bump sliding along a ribbon.
function trailAlpha() {
  const w = 256
  const h = 16
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(w, h)
  for (let y = 0; y < h; y++) {
    const v = Math.abs((y + 0.5) / h - 0.5) * 2
    const side = Math.max(0, 1 - v * v * v)
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1)
      const s = Math.sin(Math.PI * u)
      const along = u < 0.02 || u > 0.98 ? 0 : s * s
      const a = Math.round(255 * along * side)
      const i = (y * w + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = a
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c
}

// A long, lazy S with a small curl at its end, in a local frame (x along, z across).
function trailPoints(len, amp, curl, seg = 56) {
  const pts = []
  const turn = 0.8
  const base = (t) => [(t - 0.5) * len, Math.sin(t * Math.PI * 1.7) * amp]
  const steps = Math.round(seg * turn)
  for (let i = 0; i <= steps; i++) pts.push(base((i / steps) * turn))
  const p0 = base(turn)
  const p1 = base(turn - 0.01)
  const tx = p0[0] - p1[0]
  const tz = p0[1] - p1[1]
  const tl = Math.hypot(tx, tz) || 1
  const nx = (-tz / tl) * curl
  const nz = (tx / tl) * curl
  const cx = p0[0] + nx
  const cz = p0[1] + nz
  const a0 = Math.atan2(p0[1] - cz, p0[0] - cx)
  const rest = seg - steps
  for (let i = 1; i <= rest; i++) {
    const s = i / rest
    const a = a0 + s * Math.PI * 1.55
    const r = curl * (1 - 0.45 * s)
    pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r])
  }
  return pts
}

function ribbon(points, width) {
  const n = points.length
  const pos = new Float32Array(n * 2 * 3)
  const uv = new Float32Array(n * 2 * 2)
  let total = 0
  const acc = [0]
  for (let i = 1; i < n; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
    acc.push(total)
  }
  for (let i = 0; i < n; i++) {
    const a = points[Math.max(0, i - 1)]
    const b = points[Math.min(n - 1, i + 1)]
    const tx = b[0] - a[0]
    const tz = b[1] - a[1]
    const tl = Math.hypot(tx, tz) || 1
    const sx = (-tz / tl) * width * 0.5
    const sz = (tx / tl) * width * 0.5
    const [x, z] = points[i]
    pos.set([x + sx, 0, z + sz, x - sx, 0, z - sz], i * 6)
    const u = acc[i] / total
    uv.set([u, 0, u, 1], i * 4)
  }
  const index = []
  for (let i = 0; i < n - 1; i++) {
    const k = i * 2
    index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(index)
  return g
}

function leafGeometry() {
  const s = new Shape()
  s.moveTo(0, -0.5)
  s.quadraticCurveTo(0.46, -0.12, 0, 0.5)
  s.quadraticCurveTo(-0.46, -0.12, 0, -0.5)
  return new ShapeGeometry(s, 4)
}

const LEAF_COLORS = ['#8fcf7a', '#f2cb66', '#f0a28a', '#7fbf72', '#f6dc86']

// Lanes keep the drift over the sea and the island's rim, clear of the six destinations.
const TRAIL_SPOTS = [
  { x: -1.5, z: -3.5, y: 0.95, rot: 0.04, len: 5.4 },
  { x: 2.2, z: 3.6, y: 0.8, rot: -0.05, len: 5.0 },
  { x: 3.2, z: -2.8, y: 0.85, rot: 0.1, len: 4.4 },
]
const LEAF_LANES = [
  { z: -3.5, y: 1.2 },
  { z: 3.6, y: 1.0 },
  { z: -2.7, y: 0.9 },
  { z: 2.8, y: 1.3 },
  { z: -3.9, y: 0.8 },
  { z: 3.3, y: 1.5 },
]

// The water: one soft shader on a single plane. Long, thin veins of light flow slowly in one
// direction, bending as they go, like sunlight moving across a calm surface; a very faint deeper
// tone drifts underneath. It thins out near the island so the shore stays clean.
const WATER_VERT = `
varying vec2 vW;
void main() {
  vW = position.xz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const WATER_FRAG = `
varying vec2 vW;
uniform float uTime;
uniform float uFade;
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// Thin, soft lines where a slowly moving noise field crosses its midpoint.
float veins(vec2 p, float t) {
  p.x -= t * 0.07;
  vec2 warp = vec2(noise(p * 0.7 + vec2(t * 0.03, 0.0)), noise(p * 0.7 + vec2(5.2, -t * 0.025)));
  p += (warp - 0.5) * 1.4;
  float n = noise(p * 1.35);
  return smoothstep(0.86, 0.995, 1.0 - abs(n * 2.0 - 1.0));
}
void main() {
  vec2 p = vec2(vW.x * 0.45, vW.y * 1.05);
  float light = veins(p, uTime) * 0.8 + veins(p * 1.8 + 3.1, uTime * 1.25 + 9.0) * 0.45;
  float deep = smoothstep(0.4, 0.8, noise(p * 0.3 + vec2(uTime * 0.012, 4.0))) * 0.07;
  float hexd = max(abs(vW.y), 0.866 * abs(vW.x) + 0.5 * abs(vW.y));
  float away = smoothstep(4.3, 5.6, hexd);
  float aLight = light * 0.2 * away * uFade;
  float aDeep = deep * uFade;
  float a = aLight + aDeep;
  vec3 col = (vec3(0.94, 1.0, 0.98) * aLight + vec3(0.12, 0.5, 0.56) * aDeep) / max(a, 0.0001);
  gl_FragColor = vec4(col, a);
}
`

export function createDrift({ parent, makeTexture, small, baseY, swayers = [], water }) {
  const group = new Group()
  group.position.y = baseY // heights below are measured up from the board's surface
  group.visible = false
  parent.add(group)

  // --- Water: one flowing surface (see WATER_FRAG), kept still when motion is off.
  const sea = new Group()
  sea.position.y = water.y
  sea.visible = false
  parent.add(sea)
  const waterMat = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 } },
    vertexShader: WATER_VERT,
    fragmentShader: WATER_FRAG,
    transparent: true,
    depthWrite: false,
    fog: false,
  })
  sea.add(new Mesh(new PlaneGeometry(water.w, water.d).rotateX(-Math.PI / 2), waterMat))

  const fade = { value: 0 }
  const applySea = () => (waterMat.uniforms.uFade.value = fade.value)
  let dirty = false
  const disposables = []

  // --- Trails
  const alpha = trailAlpha()
  const trailCount = small ? 2 : 3
  const trails = []
  for (let i = 0; i < trailCount; i++) {
    const spot = TRAIL_SPOTS[i]
    const geo = ribbon(trailPoints(spot.len, 0.32 + i * 0.06, 0.2 + i * 0.03), 0.045)
    const map = makeTexture(alpha, { color: false })
    map.repeat.set(1 / 0.5, 1)
    const mat = new MeshBasicMaterial({ color: '#ffffff', alphaMap: map, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide, fog: false })
    const mesh = new Mesh(geo, mat)
    mesh.renderOrder = 4
    mesh.position.set(spot.x, spot.y, spot.z)
    mesh.rotation.y = spot.rot
    group.add(mesh)
    trails.push({ mesh, map, mat, spot, t: 0 })
  }
  const BUMP = 0.5
  const applyTrail = (tr) => {
    const c = -BUMP / 2 + tr.t * (1 + BUMP)
    tr.map.offset.x = 0.5 - c / BUMP
    tr.mat.opacity = 0.75 * fade.value
    dirty = true
  }
  const trailTimelines = trails.map((tr, i) => {
    const tl = gsap.timeline({ repeat: -1, paused: true, delay: 2.5 + i * 5.5 })
    for (let k = 0; k < 4; k++) {
      tl.call(() => {
        const s = tr.spot
        tr.mesh.position.set(s.x + (Math.random() - 0.5) * 1.6, s.y + (Math.random() - 0.5) * 0.3, s.z + (Math.random() - 0.5) * 0.5)
        tr.mesh.rotation.y = s.rot + (Math.random() - 0.5) * 0.3
        tr.mesh.scale.set(0.85 + Math.random() * 0.3, 1, Math.random() > 0.5 ? 1 : -1)
        tr.t = 0
        applyTrail(tr)
      })
      tl.to(tr, { t: 1, duration: 6.5 + Math.random() * 3, ease: 'sine.inOut', onUpdate: () => applyTrail(tr) })
      tl.to({}, { duration: 8 + Math.random() * 9 })
    }
    return tl
  })

  // --- Leaves
  const leafCount = small ? 4 : 7
  const leafGeo = leafGeometry()
  const leafMat = new MeshLambertMaterial({ side: DoubleSide })
  const leaves = new InstancedMesh(leafGeo, leafMat, leafCount)
  leaves.frustumCulled = false
  const info = []
  const col = new Color()
  for (let i = 0; i < leafCount; i++) {
    const lane = LEAF_LANES[i % LEAF_LANES.length]
    info.push({
      z: lane.z + (Math.random() - 0.5) * 0.4,
      y: lane.y + Math.random() * 0.25,
      x0: -9.5,
      x1: 9.5,
      dur: 60 + Math.random() * 30,
      phase: Math.random(),
      sway: 0.25 + Math.random() * 0.3,
      swayF: 0.5 + Math.random() * 0.5,
      spin: 0.4 + Math.random() * 0.6,
      size: 0.17 + Math.random() * 0.07,
      drift: (Math.random() - 0.5) * 0.9,
    })
    leaves.setColorAt(i, col.set(LEAF_COLORS[i % LEAF_COLORS.length]))
  }
  group.add(leaves)
  const dummy = new Object3D()
  const clock = { time: 0 }
  const updateLeaves = () => {
    for (let i = 0; i < leafCount; i++) {
      const l = info[i]
      const u = (clock.time / l.dur + l.phase) % 1
      const env = Math.min(1, u / 0.07, (1 - u) / 0.07) // grows in and out at the ends of its lane
      const x = l.x0 + (l.x1 - l.x0) * u
      const tt = clock.time * l.swayF + i * 2.1
      dummy.position.set(x, l.y + Math.sin(tt * 1.3) * l.sway * 0.5, l.z + l.drift * (u - 0.5) + Math.sin(tt) * l.sway)
      dummy.rotation.set(-Math.PI / 2 + Math.sin(tt * 0.9) * 0.6, Math.sin(tt * 0.6) * 0.8, clock.time * 0.12 * l.spin + i)
      dummy.scale.setScalar(l.size * Math.max(0.0001, env) * (0.2 + 0.8 * fade.value))
      dummy.updateMatrix()
      leaves.setMatrixAt(i, dummy.matrix)
    }
    leaves.instanceMatrix.needsUpdate = true
    dirty = true
  }
  const clockTween = gsap.to(clock, { time: 1200, duration: 1200, ease: 'none', repeat: -1, paused: true, onUpdate: updateLeaves })
  clock.time = 80
  updateLeaves()

  // --- Breeze: the trees, wheat and flowers lean a hair, each on its own slow rhythm.
  const swayTweens = swayers.filter(Boolean).map((pivot, i) => {
    const tw = gsap.to(pivot.rotation, {
      z: 0.034 * (i % 2 ? 1 : -1),
      x: 0.018 * (i % 3 === 0 ? 1 : -1),
      duration: 3.3 + (i % 5) * 0.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      paused: true,
      onUpdate: () => (dirty = true),
    })
    tw.progress((i * 0.37) % 1)
    return tw
  })

  const flowTween = gsap.to(waterMat.uniforms.uTime, {
    value: 3600,
    duration: 3600,
    ease: 'none',
    repeat: -1,
    paused: true,
    onUpdate: () => (dirty = true),
  })

  let running = false
  const setRunning = (on) => {
    if (on === running) return
    running = on
    if (on) {
      trailTimelines.forEach((tl) => tl.play())
      swayTweens.forEach((tw) => tw.play())
      flowTween.play()
      clockTween.play()
    } else {
      trailTimelines.forEach((tl) => tl.pause())
      swayTweens.forEach((tw) => tw.pause())
      flowTween.pause()
      clockTween.pause()
    }
  }

  disposables.push(alpha)
  return {
    get running() {
      return running && group.visible
    },
    // True once per change, so the render loop draws only when something moved.
    consumeDirty() {
      const d = dirty
      dirty = false
      return d
    },
    // Show the drift and let it fade in; `play` false keeps it still (e.g. content is open).
    show(play) {
      group.visible = true
      sea.visible = true
      gsap.to(fade, {
        value: 1,
        duration: 2.2,
        ease: 'power1.inOut',
        overwrite: 'auto',
        onUpdate: () => {
          applySea()
          dirty = true
        },
      })
      setRunning(play)
    },
    hide() {
      setRunning(false)
      gsap.killTweensOf(fade)
      fade.value = 0
      applySea()
      group.visible = false
      sea.visible = false
    },
    // Dev-only: where things are right now.
    probe: () => ({
      clock: clock.time,
      water: [+waterMat.uniforms.uTime.value.toFixed(2), +waterMat.uniforms.uFade.value.toFixed(2)],
      fade: fade.value,
      leaves: info.map((l, i) => {
        leaves.getMatrixAt(i, tmpM)
        return tmpP.setFromMatrixPosition(tmpM).toArray().map((n) => +n.toFixed(2)).concat(+tmpS.setFromMatrixScale(tmpM).x.toFixed(3))
      }),
      trails: trails.map((t) => ({ t: +t.t.toFixed(2), op: +t.mat.opacity.toFixed(2), pos: t.mesh.position.toArray().map((n) => +n.toFixed(1)) })),
    }),
    // Dev-only: freeze at a given moment (leaf clock in seconds, every trail at progress t).
    scrub(time, t) {
      setRunning(false)
      fade.value = 1
      sea.visible = true
      applySea()
      clock.time = time
      updateLeaves()
      trails.forEach((tr) => {
        tr.t = t
        applyTrail(tr)
      })
    },
    pause: () => setRunning(false),
    resume: () => group.visible && setRunning(true),
    dispose() {
      trailTimelines.forEach((tl) => tl.kill())
      swayTweens.forEach((tw) => tw.kill())
      flowTween.kill()
      clockTween.kill()
      gsap.killTweensOf(fade)
    },
  }
}
