// The whole 3D world: a game box on a dark table that opens onto the board you then play on.
// One scene, one camera, one set of materials from the closed box to the interactive board.
//
// Ownership of animated properties (so nothing fights):
//   GSAP     lid, camera rig, environment mix, interior light, tiles, robber, intro overlay opacity
//   ticker   pointer tilt + hover lift (intro only), dust mote drift (intro only)
//   drift    (atmosphere.js) wind trails and leaves, board only, GSAP-driven and paused behind content
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  RepeatWrapping,
  Scene,
  ShadowMaterial,
  SpotLight,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'
import { HOME, destinations, islandTiles } from '../content/board'
import { fills } from '../content/terrain'
import { SQRT3, pointInHex } from '../lib/hex'
import { buildDetails, createDrift } from './atmosphere'
import { drawBoard, drawContactShadow, drawLid, drawPaper, drawSoftDot, drawTileTop } from './textures'
import { fontsReady, hexShape, robberGeometry, tileUV, wallRing } from './geometry'

// World units: one unit is one hex size. The box is roomy, so once the camera is down at the
// board its walls sit outside the frame and the sea around the island fills the view.
const BASE = { w: 24, d: 17, h: 2.8, wall: 0.26 }
const LID = { w: 24.4, d: 17.4, h: 1.5, top: 0.28, wall: 0.2 }
const CORNER = 0.2
const INSERT_Y = 1.6
const TILE = { r: 0.93, round: 0.15, depth: 0.08, bevel: 0.025 }
const TILE_BASE_Y = INSERT_Y + TILE.bevel
const TILE_TOP = INSERT_Y + TILE.depth + TILE.bevel * 2
const LID_CLOSED_Y = BASE.h + 0.02 - LID.h + LID.top
const FOV = 28
const SUNK = 0.15 // tiles wait just below the sea until the box opens
const ROBBER_H = 0.68
const ROBBER_SUNK_Y = TILE_TOP - ROBBER_H - 0.25 // fully below the sea while the box is shut

const INTRO_VIEW = { yaw: 0.44, pitch: 0.7 }
const INTRO_VIEW_PORTRAIT = { yaw: 0.34, pitch: 0.84 }
// A clear, comfortably angled overview: labels stay upright and the far row stays readable.
const BOARD_PITCH = 0.98
const BOARD_PITCH_PORTRAIT = 1.06

// The robber rests low in a destination hex (towards the camera), clear of the label above it.
const REST_DROP = 0.56
const HOME_REST = 0.22
const LABEL_RAISE = 0.42
const LABEL_SPREAD = 1.22

const ENV = {
  intro: { c: '#4b4433', m: '#1f2d2a', e: '#0f1817', sky: '#7f9893', ground: '#2b2a22', hemi: 0.42, key: 0.5, pool: 2.5 },
  board: { c: '#e4f4f1', m: '#cdebe7', e: '#b4dcd8', sky: '#fffdf8', ground: '#d8d0bc', hemi: 1.4, key: 2.0, pool: 0 },
}

const tiles = islandTiles()
const tileXZ = (t) => ({ x: SQRT3 * (t.q + t.r / 2), z: 1.5 * t.r })
const destTile = Object.fromEntries(tiles.filter((t) => t.dest).map((t) => [t.dest, t]))

export function restOf(id) {
  const t = destTile[id]
  if (!t) return { x: 0, z: HOME_REST }
  const p = tileXZ(t)
  return { x: p.x, z: p.z + REST_DROP }
}

// Small seeded random, so the motes sit in the same places on every visit.
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

export async function createWorld({
  container,
  bgEl,
  reduced,
  opened,
  robberAt,
  getLabel,
  getReserve,
  onFirstFrame,
  onContextLost,
  onBoxClick,
  onTileClick,
  onDrop,
}) {
  await fontsReady()

  const start = container.getBoundingClientRect()
  const portrait = start.width / Math.max(start.height, 1) < 0.8
  const small = Math.min(start.width, start.height) < 600 || window.matchMedia('(pointer: coarse)').matches
  const BOX = portrait ? { ...BASE, w: BASE.d, d: BASE.w } : BASE
  const COVER = portrait ? { ...LID, w: LID.d, d: LID.w } : LID

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  container.appendChild(canvas)

  const scene = new Scene()
  scene.fog = new Fog(ENV.board.m, 400, 800)
  const camera = new PerspectiveCamera(FOV, 1, 0.5, 260)
  const textures = []
  const tex = (source, { repeat = false, aniso = 1, color = true } = {}) => {
    const t = new CanvasTexture(source)
    if (color) t.colorSpace = SRGBColorSpace
    t.anisotropy = Math.min(aniso, renderer.capabilities.getMaxAnisotropy())
    if (repeat) t.wrapS = t.wrapT = RepeatWrapping
    textures.push(t)
    return t
  }

  // ---------- Lights. On the board, hemisphere + key on upward faces = PI, so prints read true.
  const hemi = new HemisphereLight(ENV.intro.sky, ENV.intro.ground, ENV.intro.hemi)
  scene.add(hemi)
  const key = new DirectionalLight(0xfff6e6, ENV.intro.key) // soft daylight, a touch warm
  key.position.set(-9, 26, 11)
  key.castShadow = true
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048)
  Object.assign(key.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 4, far: 70 })
  key.shadow.bias = -0.0004
  key.shadow.radius = 4 // softer, more diffuse shadow edges where the renderer supports it
  key.shadow.normalBias = 0.03
  scene.add(key)
  // The warm pool the box sits in.
  const pool = new SpotLight(0xffd8a3, ENV.intro.pool, 0, 0.5, 0.95, 0)
  pool.position.set(2, 30, 8)
  pool.target.position.set(0, 0, 0)
  scene.add(pool, pool.target)
  // Lamplight from inside the box, glimpsed as the lid comes off.
  const glow = new PointLight(0xffc98a, 0, 16, 2)
  glow.position.set(0, INSERT_Y + 1.05, 0) // under the lid, so it only shows once the lid lifts
  scene.add(glow)

  const tilt = new Group() // pointer tilt (ticker)
  scene.add(tilt)
  // Everything on the table rides in this group, so the box can drop into place on arrival.
  // GSAP owns it; it rests at the origin whenever the board is in play.
  const slide = new Group()
  tilt.add(slide)
  let slideTl = null
  const settleSlide = () => {
    slideTl?.progress(1)
    slideTl = null
    slide.position.set(0, 0, 0)
    slide.rotation.set(0, 0, 0)
    groundShadows(0)
  }
  // While the box is in the air its shadows stay on the table: smaller and fainter the higher it is.
  // (Called from the arrival timeline's onUpdate, so GSAP stays the only owner.)
  let groundShadows = () => {}

  // ---------- Table shadows
  const contact = new Mesh(
    new PlaneGeometry(BOX.w / 0.62, BOX.d / 0.62),
    new MeshBasicMaterial({ map: tex(drawContactShadow()), transparent: true, opacity: 0.5, depthWrite: false }),
  )
  contact.rotation.x = -Math.PI / 2
  contact.position.y = 0.005
  contact.renderOrder = -1
  slide.add(contact)
  const tableShadow = new Mesh(new PlaneGeometry(90, 90), new ShadowMaterial({ opacity: 0.16, color: new Color('#120d08'), depthWrite: false }))
  tableShadow.rotation.x = -Math.PI / 2
  tableShadow.receiveShadow = true
  slide.add(tableShadow)

  groundShadows = (height) => {
    const t = Math.min(1, Math.max(0, height / 16))
    contact.position.y = 0.005 - height
    tableShadow.position.y = -height
    contact.scale.setScalar(1 + t * 0.35)
    contact.material.opacity = (0.5 - 0.2 * env.value) * (1 - t * 0.85)
    // The lamp's cast shadow would land far to one side of a box high in the air; it only firms
    // up in the last moments of the fall, so the soft shadow beneath reads as the landing spot.
    tableShadow.material.opacity = 0.16 * Math.max(0, 1 - t * 3)
  }

  // ---------- Base
  const kraft = new MeshStandardMaterial({ map: tex(drawPaper('#efe3cb'), { repeat: true }), roughness: 0.92, metalness: 0 })
  kraft.map.repeat.set(3, 3)
  const kraftInside = new MeshStandardMaterial({ map: tex(drawPaper('#e6d7ba'), { repeat: true }), roughness: 0.95, metalness: 0 })
  const base = new Group()
  const baseWalls = new Mesh(wallRing(BOX.w, BOX.d, BOX.wall, BOX.h, CORNER), [kraftInside, kraft])
  baseWalls.castShadow = baseWalls.receiveShadow = true
  base.add(baseWalls)
  const baseFloor = new Mesh(new RoundedBoxGeometry(BOX.w - 0.02, 0.2, BOX.d - 0.02, 2, 0.08), kraft)
  baseFloor.position.y = 0.1
  base.add(baseFloor)
  slide.add(base)

  // ---------- The board: sea and shore printed on the insert, land tiles raised.
  const insW = BOX.w - BOX.wall * 2 - 0.04
  const insD = BOX.d - BOX.wall * 2 - 0.04
  const ppu = (small ? 1536 : 2560) / Math.max(insW, insD)
  const boardCanvas = document.createElement('canvas')
  boardCanvas.width = Math.round(insW * ppu)
  boardCanvas.height = Math.round(insD * ppu)
  drawBoard(boardCanvas.getContext('2d'), boardCanvas.width, boardCanvas.height, boardCanvas.width / 2, boardCanvas.height / 2, ppu, {
    withLand: false,
  })
  const insert = new Mesh(new PlaneGeometry(insW, insD), new MeshLambertMaterial({ map: tex(boardCanvas, { aniso: 8 }) }))
  insert.rotation.x = -Math.PI / 2
  insert.position.y = INSERT_Y
  insert.receiveShadow = true
  slide.add(insert)
  const stackH = INSERT_Y - 0.21
  const insertEdge = new Mesh(new RoundedBoxGeometry(insW, stackH, insD, 1, 0.02), kraftInside)
  insertEdge.position.y = 0.2 + stackH / 2
  slide.add(insertEdge)

  const tileGeo = new ExtrudeGeometry(hexShape(TILE.r - TILE.bevel, TILE.round), {
    depth: TILE.depth,
    bevelEnabled: true,
    bevelThickness: TILE.bevel,
    bevelSize: TILE.bevel,
    bevelSegments: 2,
    curveSegments: 5,
    UVGenerator: tileUV(TILE.r),
  })
  tileGeo.rotateX(-Math.PI / 2)
  const topMats = new Map()
  const sideMats = new Map()
  const tileMeshes = []
  const destMeshes = {}
  for (const t of tiles) {
    // Destinations carry a faint printed motif; the outer ring has 3D scenery instead, so those
    // tiles stay plain rather than drawing the same thing twice.
    const motif = t.dest ? 'quiet' : t.d === 2 ? 'none' : 'full'
    const k = `${t.terrain}:${motif}`
    if (!topMats.has(k)) topMats.set(k, new MeshLambertMaterial({ map: tex(drawTileTop(t.terrain, motif), { aniso: 4 }) }))
    if (!sideMats.has(t.terrain)) sideMats.set(t.terrain, new MeshLambertMaterial({ color: new Color(fills[t.terrain][1]).multiplyScalar(0.86) }))
    const m = new Mesh(tileGeo, [topMats.get(k), sideMats.get(t.terrain)])
    const p = tileXZ(t)
    m.position.set(p.x, TILE_BASE_Y - (opened ? 0 : SUNK), p.z)
    m.castShadow = m.receiveShadow = true
    m.userData = { tile: t }
    if (t.dest) destMeshes[t.dest] = m
    tileMeshes.push(m)
    slide.add(m)
  }

  // Soft terrain details on the outer ring. They ride on their tiles and grow in as the island rises.
  const softDot = tex(drawSoftDot(64, 0.15), { color: false })
  const details = buildDetails({ tiles, tileMeshes, localTop: TILE.depth + TILE.bevel, startScale: opened ? 1 : 0.001, shadowMap: softDot })

  // ---------- Robber: root (board position) > lift (pickup, tilt and wobble, pivoting on its base).
  const robberRoot = new Group()
  const lift = new Group()
  const robber = new Mesh(robberGeometry(ROBBER_H), new MeshStandardMaterial({ color: '#a9adb0', roughness: 0.66, metalness: 0 }))
  robber.castShadow = true
  lift.add(robber)
  const blob = new Mesh(
    new PlaneGeometry(0.62, 0.62),
    new MeshBasicMaterial({ map: softDot, color: '#2b1c10', transparent: true, opacity: 0.38, depthWrite: false }),
  )
  blob.rotation.x = -Math.PI / 2
  blob.position.y = 0.004
  robberRoot.add(blob, lift)
  const rest0 = restOf(robberAt)
  robberRoot.position.set(rest0.x, opened ? TILE_TOP : ROBBER_SUNK_Y, rest0.z)
  slide.add(robberRoot)

  // ---------- Lid
  const sage = new MeshStandardMaterial({ color: '#4f6f52', roughness: 0.82, metalness: 0 })
  const lidInside = new MeshStandardMaterial({ color: '#e9dcc2', roughness: 0.95, metalness: 0 })
  const lidArt = tex(drawLid(portrait ? Math.round((2048 * COVER.w) / COVER.d) : 2048, portrait ? 2048 : Math.round((2048 * COVER.d) / COVER.w)), {
    aniso: 16,
  })
  const print = new MeshStandardMaterial({ map: lidArt, roughness: 0.78, metalness: 0 })
  const hover = new Group() // hover lift (ticker)
  const lid = new Group() // opening (GSAP)
  lid.position.y = LID_CLOSED_Y
  const lidWalls = new Mesh(wallRing(COVER.w, COVER.d, LID.wall, LID.h - LID.top + 0.02, CORNER + 0.02), [lidInside, sage])
  const lidTop = new Mesh(new RoundedBoxGeometry(COVER.w, LID.top, COVER.d, 4, 0.1), [sage, sage, print, lidInside, sage, sage])
  lidTop.position.y = LID.h - LID.top / 2
  for (const m of [lidWalls, lidTop]) {
    m.castShadow = m.receiveShadow = true
    lid.add(m)
  }
  hover.add(lid)
  slide.add(hover)
  if (opened) lid.visible = false

  // ---------- Dust motes: very few, very slow, kept low around the box and away from the title.
  const MOTES = reduced ? 0 : small ? 12 : 26
  const rand = rng(11)
  const moteBase = new Float32Array(MOTES * 3)
  const motePhase = new Float32Array(MOTES)
  for (let i = 0; i < MOTES; i++) {
    const a = rand() * Math.PI * 2
    const r = 0.45 + rand() * 0.55
    moteBase[i * 3] = Math.cos(a) * r * BOX.w * 0.85
    moteBase[i * 3 + 1] = 0.6 + rand() * 3.6
    // Far-side motes would drift up behind the title on screen, so keep them close.
    const z = Math.sin(a) * r * BOX.d * 0.85
    moteBase[i * 3 + 2] = z < 0 ? z * 0.35 : z
    motePhase[i] = rand() * Math.PI * 2
  }
  const moteGeo = new BufferGeometry()
  moteGeo.setAttribute('position', new BufferAttribute(moteBase.slice(), 3))
  const motes = new Points(
    moteGeo,
    new PointsMaterial({
      map: tex(drawSoftDot(32, 0.3), { color: false }),
      color: '#ffe1b0',
      size: small ? 0.2 : 0.16,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: AdditiveBlending,
      fog: false,
    }),
  )
  motes.visible = !opened && MOTES > 0
  scene.add(motes)

  // ---------- Drift: a few wind trails and leaves over the board (never under reduced motion).
  const drift = reduced ? null : createDrift({ parent: slide, makeTexture: tex, small, baseY: TILE_TOP, swayers: details.map((h) => h.pivot), water: { y: INSERT_Y + 0.004, w: insW, d: insD } })

  // ---------- Environment mix: 0 = quiet intro table, 1 = calm board. One setter, one owner (GSAP).
  const cA = new Color()
  const cB = new Color()
  const css = (a, b, t) => `#${cA.set(a).lerp(cB.set(b), t).getHexString()}`
  let fogNear = 60
  let fogFar = 140
  const env = { value: 0 }
  const applyEnv = (t) => {
    env.value = t
    const I = ENV.intro
    const B = ENV.board
    hemi.intensity = I.hemi + (B.hemi - I.hemi) * t
    hemi.color.set(I.sky).lerp(cB.set(B.sky), t)
    hemi.groundColor.set(I.ground).lerp(cB.set(B.ground), t)
    key.intensity = I.key + (B.key - I.key) * t
    key.shadow.intensity = 1 - 0.32 * t // gentler shadows once the board is in daylight
    pool.intensity = I.pool + (B.pool - I.pool) * t
    scene.fog.near = 400 + (fogNear - 400) * t
    scene.fog.far = 800 + (fogFar - 800) * t
    motes.material.opacity = 0.5 * Math.max(0, 1 - t * 1.8)
    contact.material.opacity = 0.5 - 0.2 * t
  }
  // The table's darkness lifts a little later than the lights, once the board fills most of
  // the frame, so the passage reads as warm lamplight then daylight rather than a grey fade.
  const bg = { value: 0 }
  const applyBg = (t) => {
    bg.value = t
    if (!bgEl) return
    const I = ENV.intro
    const B = ENV.board
    bgEl.style.setProperty('--bg-c', css(I.c, B.c, t))
    bgEl.style.setProperty('--bg-m', css(I.m, B.m, t))
    bgEl.style.setProperty('--bg-e', css(I.e, B.e, t))
  }
  const envProxy = {
    mix: (v) => (v === undefined ? env.value : applyEnv(v)),
    bg: (v) => (v === undefined ? bg.value : applyBg(v)),
  }

  // ---------- Camera rig: yaw / pitch / distance around a target. GSAP tweens it.
  const introView = portrait ? INTRO_VIEW_PORTRAIT : INTRO_VIEW
  const rig = { ...introView, dist: 60, tx: 0, ty: 1.2, tz: 0 }
  const applyRig = () => {
    const cp = Math.cos(rig.pitch)
    camera.position.set(rig.tx + rig.dist * Math.sin(rig.yaw) * cp, rig.ty + rig.dist * Math.sin(rig.pitch), rig.tz + rig.dist * Math.cos(rig.yaw) * cp)
    camera.rotation.set(-rig.pitch, rig.yaw, 0, 'YXZ')
    camera.updateMatrixWorld()
  }
  const zoom = { log: (v) => (v === undefined ? Math.log(rig.dist) : (rig.dist = Math.exp(v))) }

  let W = 1
  let H = 1
  const v = new Vector3()
  const right = new Vector3()
  const up = new Vector3()
  const toScreen = (p) => {
    v.copy(p).project(camera)
    return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H }
  }

  // Place the camera (for a given yaw/pitch) so `points` fit inside the pixel rectangle `rect`.
  const fit = (target, points, rect) => {
    const saved = { ...rig }
    Object.assign(rig, target)
    for (let i = 0; i < 12; i++) {
      applyRig()
      let x0 = Infinity
      let x1 = -Infinity
      let y0 = Infinity
      let y1 = -Infinity
      for (const p of points) {
        const s = toScreen(p)
        x0 = Math.min(x0, s.x)
        x1 = Math.max(x1, s.x)
        y0 = Math.min(y0, s.y)
        y1 = Math.max(y1, s.y)
      }
      rig.dist *= Math.max((x1 - x0) / rect.w, (y1 - y0) / rect.h)
      const dx = rect.x + rect.w / 2 - (x0 + x1) / 2
      const dy = rect.y + rect.h / 2 - (y0 + y1) / 2
      const wpp = (2 * rig.dist * Math.tan((FOV * Math.PI) / 360)) / H
      right.setFromMatrixColumn(camera.matrixWorld, 0)
      up.setFromMatrixColumn(camera.matrixWorld, 1)
      rig.tx -= (right.x * dx - up.x * dy) * wpp
      rig.ty -= (right.y * dx - up.y * dy) * wpp
      rig.tz -= (right.z * dx - up.z * dy) * wpp
    }
    const out = { yaw: rig.yaw, pitch: rig.pitch, dist: rig.dist, tx: rig.tx, ty: rig.ty, tz: rig.tz }
    Object.assign(rig, saved)
    return out
  }

  const boxCorners = []
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, LID_CLOSED_Y + LID.h]) boxCorners.push(new Vector3((sx * COVER.w) / 2, y, (sz * COVER.d) / 2))
  // Framing hulls: the whole island, or (on phones) the destinations ring with a generous margin,
  // letting the outer ring run off the sides so the destinations stay large.
  const hull = (maxRing, radius) => {
    const pts = []
    for (const t of tiles) {
      if (t.d > maxRing) continue
      const p = tileXZ(t)
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 90)
        pts.push(new Vector3(p.x + Math.cos(a) * radius, TILE_TOP, p.z + Math.sin(a) * radius))
      }
    }
    return pts
  }
  const islandHull = hull(2, 1.02)
  const innerHull = hull(1, 1.8)

  const introPose = () => {
    const { top, bottom } = getReserve?.() ?? { top: H * 0.2, bottom: H * 0.2 }
    const padX = Math.max(W * 0.06, 16)
    const rect = { x: padX, y: top, w: W - padX * 2, h: Math.max(H - top - bottom, H * 0.3) }
    const maxW = Math.min(rect.w, 780)
    rect.x += (rect.w - maxW) / 2
    rect.w = maxW
    return fit({ ...introView, ty: 1.2 }, boxCorners, rect)
  }

  const boardPose = () => {
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 60
    const narrow = W < 600
    const top = headerH + (narrow ? 4 : 16)
    const bottom = narrow ? 16 : 28
    const padX = narrow ? 0 : Math.max(W * 0.05, 24)
    const rect = { x: padX, y: top, w: W - padX * 2, h: H - top - bottom }
    const pose = fit({ yaw: 0, pitch: portrait ? BOARD_PITCH_PORTRAIT : BOARD_PITCH, ty: TILE_TOP }, narrow ? innerHull : islandHull, rect)
    // Distance haze only begins well beyond the island, so the sea stays clean.
    fogNear = pose.dist * 2.2
    fogFar = pose.dist * 5
    return pose
  }

  const placePool = () => {
    if (!bgEl) return
    const s = toScreen(v.set(0, 1.2, 0))
    bgEl.style.setProperty('--pool-x', `${Math.round(s.x)}px`)
    bgEl.style.setProperty('--pool-y', `${Math.round(s.y)}px`)
  }

  // ---------- Labels: crisp HTML anchored to the 3D destinations.
  const anchor = new Vector3()
  const updateLabels = () => {
    for (const d of destinations) {
      const el = getLabel?.(d.id)
      if (!el) continue
      const p = tileXZ(destTile[d.id])
      // Top and bottom row labels lean a little outward, so neighbouring labels never touch.
      const x = Math.abs(p.z) > 1 ? p.x * LABEL_SPREAD : p.x
      const s = toScreen(anchor.set(x, TILE_TOP + destMeshes[d.id].position.y - TILE_BASE_Y, p.z - LABEL_RAISE))
      el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
    }
  }

  // ---------- Phases and the render loop
  let phase = opened ? 'board' : 'intro'
  let active = null // the opening timeline
  let paused = false
  let dirty = true
  let busyUntil = 0 // keep drawing while board tweens run
  let firstFrame = false
  const keepDrawing = (seconds) => (busyUntil = Math.max(busyUntil, performance.now() + seconds * 1000 + 60))

  const tiltTarget = { x: 0, y: 0 }
  let hoverTarget = 0
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const moteAttr = moteGeo.getAttribute('position')
  let lastDecor = 0
  const decorGap = small ? 1000 / 24 : 1000 / 36

  const render = () => {
    renderer.render(scene, camera)
    updateLabels()
    if (!firstFrame) {
      firstFrame = true
      onFirstFrame?.()
    }
  }

  const tick = (time) => {
    // Behind the content only finishing moves are drawn (e.g. the robber travelling to the
    // chosen destination); everything else waits.
    if (paused && performance.now() >= busyUntil) return
    const now = performance.now()
    let draw = dirty || active !== null || now < busyUntil
    // Wind and leaves redraw at a relaxed rate; the shadow map is reused for those frames.
    let decorOnly = false
    if (drift?.running && phase === 'board' && drift.consumeDirty() && now - lastDecor >= decorGap) {
      lastDecor = now
      decorOnly = !draw
      draw = true
    }
    if (phase !== 'board') {
      const ease = phase === 'intro' ? 0.09 : 0.22
      const dyaw = tiltTarget.x * 0.07 - tilt.rotation.y
      const dpitch = tiltTarget.y * 0.035 - tilt.rotation.x
      const dhover = hoverTarget * 0.14 - hover.position.y
      if (Math.abs(dyaw) > 1e-4 || Math.abs(dpitch) > 1e-4 || Math.abs(dhover) > 1e-4) {
        tilt.rotation.y += dyaw * ease
        tilt.rotation.x += dpitch * ease
        hover.position.y += dhover * 0.16
        draw = true
      }
      if (motes.visible && !reduced) {
        for (let i = 0; i < MOTES; i++) {
          const ph = motePhase[i]
          moteAttr.array[i * 3] = moteBase[i * 3] + Math.sin(time * 0.11 + ph) * 0.5
          moteAttr.array[i * 3 + 1] = moteBase[i * 3 + 1] + Math.sin(time * 0.17 + ph * 1.7) * 0.35
          moteAttr.array[i * 3 + 2] = moteBase[i * 3 + 2] + Math.cos(time * 0.09 + ph) * 0.5
        }
        moteAttr.needsUpdate = true
        draw = true
      }
    }
    if (!draw) return
    dirty = false
    if (active) applyRig()
    renderer.shadowMap.autoUpdate = !decorOnly
    render()
    renderer.shadowMap.autoUpdate = true
  }

  const resize = () => {
    const r = container.getBoundingClientRect()
    W = Math.max(1, Math.round(r.width))
    H = Math.max(1, Math.round(r.height))
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    if (!active) {
      Object.assign(rig, phase === 'board' ? boardPose() : introPose())
      applyRig()
      if (phase === 'board') {
        applyEnv(1)
        applyBg(1)
      }
      else placePool()
    }
    dirty = true
    if (reduced || paused) {
      const was = paused
      paused = false
      tick(gsap.ticker.time)
      paused = was
    }
  }

  // ---------- The board's state at rest (also used to skip the opening).
  const settleBoard = () => {
    settleSlide()
    phase = 'board'
    lid.visible = false
    motes.visible = false
    tilt.rotation.set(0, 0, 0)
    hover.position.y = 0
    glow.intensity = 0
    for (const m of tileMeshes) {
      gsap.killTweensOf(m.position)
      m.position.y = TILE_BASE_Y
    }
    for (const h of details) {
      gsap.killTweensOf(h.holder.scale)
      h.holder.scale.setScalar(1)
    }
    drift?.show(!paused)
    gsap.killTweensOf(robberRoot.position)
    robberRoot.position.y = TILE_TOP
    Object.assign(rig, boardPose())
    applyRig()
    applyEnv(1)
    applyBg(1)
    canvas.style.cursor = ''
    dirty = true
  }

  // ---------- Opening: the lid lifts with a little weight, the interior glows, the island rises
  // out of the sea, and the camera travels down into an angled overview while the table's
  // darkness gives way to the board's calm daylight. About 1.35s, all on one timeline.
  const open = ({ fadeEls = [], onDone } = {}) => {
    if (active && phase === 'opening') {
      active.progress(1)
      return
    }
    if (phase === 'board') {
      onDone?.()
      return
    }
    // Opening again while the box is still closing: pick up from wherever everything is.
    if (active) {
      active.kill()
      active = null
    }
    settleSlide()
    const fromClosed = lid.position.y < LID_CLOSED_Y + 0.5
    lid.visible = true
    phase = 'opening'
    canvas.style.cursor = ''
    tiltTarget.x = tiltTarget.y = 0
    hoverTarget = 0
    const to = boardPose()
    const done = () => {
      active = null
      settleBoard()
      onDone?.()
    }
    active = gsap.timeline({ onComplete: done })
    // The intro's words step aside as the lid lifts (they are UI, not a scene fade).
    if (fadeEls.length) active.to(fadeEls, { opacity: 0, y: -6, duration: 0.32, ease: 'power1.out' }, 0)
    // Break the seal, then lift it up and away, tipping back, well clear of the final view.
    if (fromClosed) {
      active
        .to(lid.position, { y: LID_CLOSED_Y + 0.34, duration: 0.24, ease: 'power1.inOut' }, 0)
        .to(lid.rotation, { x: -0.035, duration: 0.24, ease: 'power1.inOut' }, 0)
    }
    active
      .to(lid.position, { y: LID_CLOSED_Y + 34, z: -16, duration: 0.7, ease: 'power2.in' }, 0.24)
      .to(lid.rotation, { x: -0.75, duration: 0.7, ease: 'power2.in' }, 0.24)
      // Warm light from inside, strongest just as the board is revealed.
      .to(glow, { intensity: 4, duration: 0.42, ease: 'power2.out' }, 0.18)
      .to(glow, { intensity: 0, duration: 0.6, ease: 'power1.in' }, 0.7)
      // The camera travels in: the board grows in the frame and the walls slip past the edges.
      .to(rig, { yaw: to.yaw, pitch: to.pitch, tx: to.tx, ty: to.ty, tz: to.tz, duration: 1.0, ease: 'power2.inOut' }, 0.3)
      .to(zoom, { log: Math.log(to.dist), duration: 1.0, ease: 'power1.inOut' }, 0.3)
      // Dark table to calm daylight, carried by the lights rather than a fade.
      .to(envProxy, { mix: 1, duration: 1.0, ease: 'power1.inOut' }, 0.25)
      .to(envProxy, { bg: 1, duration: 0.85, ease: 'power2.in' }, 0.45)
    // The island rises out of the sea from the centre outwards; the robber pops up last.
    for (const m of tileMeshes) {
      active.to(m.position, { y: TILE_BASE_Y, duration: 0.42, ease: 'back.out(1.6)' }, 0.42 + m.userData.tile.d * 0.09)
    }
    // Trees, hills and wheat settle in just after the tile beneath them.
    for (const h of details) {
      active.to(h.holder.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(1.7)' }, 0.62 + h.d * 0.09)
    }
    active.to(robberRoot.position, { y: TILE_TOP, duration: 0.36, ease: 'back.out(2)' }, 0.92)
  }

  // ---------- The closed box at rest (the intro, and where Home returns to).
  const settleIntro = () => {
    settleSlide()
    phase = 'intro'
    lid.visible = true
    gsap.killTweensOf([lid.position, lid.rotation])
    lid.position.set(0, LID_CLOSED_Y, 0)
    lid.rotation.set(0, 0, 0)
    glow.intensity = 0
    // Under the shut lid the island goes back below the sea, ready to rise again on the next opening.
    for (const m of tileMeshes) {
      gsap.killTweensOf(m.position)
      m.position.y = TILE_BASE_Y - SUNK
    }
    for (const h of details) {
      gsap.killTweensOf(h.holder.scale)
      h.holder.scale.setScalar(0.001)
    }
    drift?.hide()
    robberTl?.kill()
    gsap.killTweensOf(robberRoot.position)
    const p = restOf(robberAtNow)
    robberRoot.position.set(p.x, ROBBER_SUNK_Y, p.z)
    lift.position.set(0, 0, 0)
    lift.rotation.set(0, 0, 0)
    lift.scale.set(1, 1, 1)
    motes.visible = MOTES > 0
    Object.assign(rig, introPose())
    applyRig()
    applyEnv(0)
    applyBg(0)
    placePool()
    dirty = true
  }

  // ---------- Home: the opening in reverse. The camera pulls back out of the board until it sits
  // inside the box again, the table's darkness and warm pool return, and the lid comes back down
  // and settles. About 1.3s, overlapping stages, on one timeline.
  const close = ({ delay = 0, fadeEls = [], onDone } = {}) => {
    if (phase === 'intro' || phase === 'closing') {
      onDone?.()
      return
    }
    if (active) {
      active.kill() // interrupting an opening: reverse from wherever it got to
      active = null
    }
    settleSlide()
    drift?.hide()
    finish(false)
    setHot(null)
    setLabelState('data-target', [])
    clearTimeout(pulseTimer)
    robberTl?.progress(1)
    if (phase === 'board') {
      // The lid waits where the opening left it: high above and behind the camera.
      lid.position.set(0, LID_CLOSED_Y + 34, -16)
      lid.rotation.set(-0.75, 0, 0)
    }
    lid.visible = true
    motes.visible = MOTES > 0
    phase = 'closing'
    canvas.style.cursor = ''
    const to = introPose()
    active = gsap.timeline({
      delay,
      onComplete: () => {
        active = null
        settleIntro()
        onDone?.()
      },
    })
    active
      .to(rig, { yaw: to.yaw, pitch: to.pitch, tx: to.tx, ty: to.ty, tz: to.tz, duration: 1.0, ease: 'power2.inOut' }, 0)
      .to(zoom, { log: Math.log(to.dist), duration: 1.0, ease: 'power1.inOut' }, 0)
      .to(envProxy, { bg: 0, duration: 0.8, ease: 'power2.out' }, 0)
      .to(envProxy, { mix: 0, duration: 1.0, ease: 'power1.inOut' }, 0.12)
      // A last glimpse of lamplight inside as the lid comes down over it.
      .to(glow, { intensity: 3, duration: 0.35, ease: 'power2.out' }, 0.45)
      .to(glow, { intensity: 0, duration: 0.3, ease: 'power1.in' }, 0.9)
      .to(lid.position, { y: LID_CLOSED_Y + 0.3, z: 0, duration: 0.78, ease: 'power2.out' }, 0.32)
      .to(lid.rotation, { x: -0.03, duration: 0.78, ease: 'power2.out' }, 0.32)
      // ...and settles onto the base.
      .to(lid.position, { y: LID_CLOSED_Y, duration: 0.2, ease: 'power1.inOut' }, 1.1)
      .to(lid.rotation, { x: 0, duration: 0.2, ease: 'power1.inOut' }, 1.1)
    if (fadeEls.length) active.fromTo(fadeEls, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power1.out' }, 1.0)
  }

  // Immediate state changes (reduced motion, deep links, interrupted navigation).
  const toBoard = () => {
    if (active && phase === 'opening') return void active.progress(1)
    if (active) {
      active.kill()
      active = null
    }
    if (phase !== 'board') settleBoard()
  }
  const toIntro = () => {
    if (active && phase === 'closing') return void active.progress(1)
    if (active) {
      active.kill()
      active = null
    }
    if (phase !== 'intro') settleIntro()
  }

  // ---------- Robber motion
  let robberTl = null
  const robberTimeline = () => {
    robberTl?.kill()
    robberTl = gsap.timeline()
    return robberTl
  }
  const blobMat = blob.material
  // Held in the hand: lifted, a touch larger, tilted, with a wider, softer shadow.
  const pickUp = (tl, at = 0, d = 0.14) =>
    tl
      .to(lift.position, { y: 0.28, duration: d, ease: 'power2.out' }, at)
      .to(lift.rotation, { z: 0.061, duration: d, ease: 'power2.out' }, at)
      .to(lift.scale, { x: 1.06, y: 1.06, z: 1.06, duration: d, ease: 'power2.out' }, at)
      .to(blob.scale, { x: 1.45, y: 1.45, duration: d, ease: 'power2.out' }, at)
      .to(blobMat, { opacity: 0.18, duration: d, ease: 'power2.out' }, at)
  // Set down like wood on a tabletop: a short drop, the shadow tightening, then a small wobble
  // pivoting on the base that loses energy fast.
  const setDown = (tl, at = 0) =>
    tl
      .to(lift.position, { y: 0, duration: 0.13, ease: 'power2.in' }, at)
      .to(lift.scale, { x: 1, y: 1, z: 1, duration: 0.13, ease: 'power2.in' }, at)
      .to(blob.scale, { x: 1, y: 1, duration: 0.13, ease: 'power2.in' }, at)
      .to(blobMat, { opacity: 0.38, duration: 0.13, ease: 'power2.in' }, at)
      .to(
        lift.rotation,
        {
          keyframes: [
            { z: -0.049, duration: 0.06 },
            { z: 0.026, duration: 0.07 },
            { z: -0.0096, duration: 0.07 },
            { z: 0, duration: 0.07 },
          ],
          easeEach: 'sine.inOut',
        },
        at + 0.1,
      )
  const placeRobber = (id) => {
    robberTl?.kill()
    const p = restOf(id)
    robberRoot.position.set(p.x, TILE_TOP, p.z)
    lift.position.set(0, 0, 0)
    lift.rotation.set(0, 0, 0)
    lift.scale.set(1, 1, 1)
    blob.scale.set(1, 1, 1)
    blobMat.opacity = 0.38
    dirty = true
  }
  let robberAtNow = robberAt
  let settlingTo = null
  const setRobber = (id, travel) => {
    robberAtNow = id
    if (settlingTo === id) {
      settlingTo = null
      return
    }
    if (phase !== 'board' || !travel || reduced) {
      if (phase === 'board') placeRobber(id)
      else {
        const p = restOf(id)
        robberRoot.position.x = p.x
        robberRoot.position.z = p.z
      }
      return
    }
    const p = restOf(id)
    const tl = robberTimeline()
    pickUp(tl, 0, 0.12)
    tl.to(robberRoot.position, { x: p.x, z: p.z, duration: 0.3, ease: 'power2.inOut' }, 0.04)
    setDown(tl, 0.3)
    keepDrawing(tl.duration())
  }

  // ---------- Pointer: the box in the intro; robber, tiles and labels on the board.
  const ray = new Raycaster()
  const ndc = new Vector2()
  const surface = new Plane(new Vector3(0, 1, 0), -TILE_TOP)
  const hitPoint = new Vector3()
  const aim = (e) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
  }
  // The robber is picked in screen space: distance from the pointer to its projected base-to-head
  // segment. Exact at any camera angle, with extra room for fingers.
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const pb = new Vector3()
  const overRobber = (e) => {
    const r = canvas.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    const a = toScreen(pb.set(robberRoot.position.x, robberRoot.position.y + lift.position.y, robberRoot.position.z))
    const b = toScreen(pb.set(robberRoot.position.x, robberRoot.position.y + lift.position.y + ROBBER_H, robberRoot.position.z))
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    const t = Math.max(0, Math.min(1, ((px - a.x) * (b.x - a.x) + (py - a.y) * (b.y - a.y)) / Math.max(len * len, 1e-6)))
    const d = Math.hypot(px - (a.x + (b.x - a.x) * t), py - (a.y + (b.y - a.y) * t))
    return d <= Math.max(len * 0.42, 14) + (coarse ? 10 : 2)
  }
  const boardPoint = (e) => {
    aim(e)
    return ray.ray.intersectPlane(surface, hitPoint) ? { x: hitPoint.x, z: hitPoint.z } : null
  }
  const destUnder = (x, z) => {
    for (const d of destinations) {
      const p = tileXZ(destTile[d.id])
      if (pointInHex(x, z, p.x, p.z, 0.98)) return d.id
    }
    return null
  }
  const setLabelState = (attr, ids) => {
    for (const d of destinations) {
      const el = getLabel?.(d.id)
      if (!el) continue
      if (ids === true || (Array.isArray(ids) && ids.includes(d.id))) el.setAttribute(attr, '')
      else el.removeAttribute(attr)
    }
  }
  let hot = null
  const setHot = (id) => {
    if (id === hot) return
    if (hot) gsap.to(destMeshes[hot].position, { y: TILE_BASE_Y, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
    if (id) gsap.to(destMeshes[id].position, { y: TILE_BASE_Y + 0.07, duration: 0.2, ease: 'power2.out', overwrite: 'auto' })
    hot = id
    setLabelState('data-hot', id ? [id] : [])
    keepDrawing(0.22)
  }

  let drag = null
  let press = null
  let pulseTimer = null

  const onMove = (e) => {
    if (paused) return
    if (phase === 'intro') {
      if (!reduced && finePointer) {
        tiltTarget.x = (e.clientX / W - 0.5) * 2
        tiltTarget.y = (e.clientY / H - 0.5) * 2
      }
      if (e.target !== canvas) return
      aim(e)
      const over = ray.intersectObjects([lid, base], true).length > 0
      canvas.style.cursor = over ? 'pointer' : ''
      hoverTarget = over && !reduced ? 1 : 0
      return
    }
    if (phase !== 'board') return
    if (drag && e.pointerId === drag.id) {
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) drag.moved = true
      const b = boardPoint(e)
      if (!b) return
      const x = b.x - drag.offX
      const z = b.z - drag.offZ
      gsap.set(robberRoot.position, { x, z })
      dirty = true
      setHot(drag.moved ? destUnder(x, z) : null)
      return
    }
    if (e.target !== canvas) return
    aim(e)
    if (overRobber(e)) {
      canvas.style.cursor = 'grab'
      setHot(null)
      return
    }
    const t = ray.intersectObjects(Object.values(destMeshes))[0]
    const id = t?.object.userData.tile.dest ?? null
    canvas.style.cursor = id ? 'pointer' : ''
    setHot(id)
  }

  const onDown = (e) => {
    if (paused || (e.pointerType === 'mouse' && e.button !== 0)) return
    if (phase === 'intro') {
      press = { x: e.clientX, y: e.clientY }
      return
    }
    if (phase !== 'board') return
    aim(e)
    if (overRobber(e)) {
      e.preventDefault()
      canvas.setPointerCapture(e.pointerId)
      const b = boardPoint(e) ?? { x: robberRoot.position.x, z: robberRoot.position.z }
      drag = { id: e.pointerId, offX: b.x - robberRoot.position.x, offZ: b.z - robberRoot.position.z, sx: e.clientX, sy: e.clientY, moved: false }
      canvas.style.cursor = 'grabbing'
      setLabelState('data-target', true)
      if (reduced) robberTl?.kill()
      else {
        const tl = robberTimeline()
        pickUp(tl, 0, 0.14)
        keepDrawing(0.2)
      }
      return
    }
    const t = ray.intersectObjects(Object.values(destMeshes))[0]
    press = t ? { x: e.clientX, y: e.clientY, dest: t.object.userData.tile.dest } : null
  }

  const finish = (commit) => {
    const d = drag
    if (!d) return
    drag = null
    canvas.style.cursor = ''
    setLabelState('data-target', [])
    const target = commit && d.moved ? hot : null
    setHot(null)
    if (target) {
      settlingTo = target === robberAtNow ? null : target
      if (reduced) placeRobber(target)
      else {
        const p = restOf(target)
        const tl = robberTimeline()
        tl.to(robberRoot.position, { x: p.x, z: p.z, duration: 0.16, ease: 'power2.out' }, 0)
        setDown(tl, 0.06)
        keepDrawing(tl.duration())
      }
      robberAtNow = target
      onDrop?.(target)
    } else if (d.moved) {
      // Not a destination: glide back to where it was resting.
      if (reduced) placeRobber(robberAtNow)
      else {
        const p = restOf(robberAtNow)
        const tl = robberTimeline()
        tl.to(robberRoot.position, { x: p.x, z: p.z, duration: 0.36, ease: 'power2.out' }, 0)
          .to(lift.position, { y: 0, duration: 0.32, ease: 'power2.out' }, 0)
          .to(lift.rotation, { z: 0, duration: 0.32, ease: 'power2.out' }, 0)
          .to(lift.scale, { x: 1, y: 1, z: 1, duration: 0.32, ease: 'power2.out' }, 0)
          .to(blob.scale, { x: 1, y: 1, duration: 0.32, ease: 'power2.out' }, 0)
          .to(blobMat, { opacity: 0.38, duration: 0.32, ease: 'power2.out' }, 0)
        keepDrawing(tl.duration())
      }
    } else {
      // A tap on the robber: set it down and point out where it can go.
      if (reduced) placeRobber(robberAtNow)
      else {
        const tl = robberTimeline()
        setDown(tl, 0)
        keepDrawing(tl.duration())
      }
      setLabelState('data-target', true)
      clearTimeout(pulseTimer)
      pulseTimer = setTimeout(() => setLabelState('data-target', []), 1100)
    }
  }

  const onUp = (e) => {
    if (drag) {
      if (e.pointerId === drag.id) finish(true)
      return
    }
    const p = press
    press = null
    if (!p || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) return
    if (phase === 'intro') {
      aim(e)
      if (ray.intersectObjects([lid, base], true).length) onBoxClick?.()
    } else if (phase === 'board' && p.dest) onTileClick?.(p.dest)
  }
  const onCancel = () => finish(false)
  const onLeave = () => {
    tiltTarget.x = tiltTarget.y = 0
    hoverTarget = 0
    if (!drag) setHot(null)
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)
  canvas.addEventListener('lostpointercapture', onCancel)
  const onLost = (e) => {
    e.preventDefault()
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  // ---------- Start
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()
  if (opened) settleBoard()
  else {
    applyEnv(0)
    applyBg(0)
  }
  gsap.ticker.add(tick)

  // ---------- Arrival: the box drops onto the table from above, lands with a soft bounce and a
  // little rock, and the lid jolts on impact. Skipped for reduced motion.
  if (!opened && !reduced) {
    const H0 = 16
    slide.position.set(0, H0, 0)
    slide.rotation.set(0.12, 0.16, -0.08)
    groundShadows(H0)
    const LAND = 0.62
    slideTl = gsap
      .timeline({ delay: 0.35, onUpdate: () => groundShadows(slide.position.y), onComplete: () => (slideTl = null) })
      // Falling: gravity accelerates it; it straightens most of the way on the way down.
      .to(slide.position, { y: 0, duration: LAND, ease: 'power2.in' }, 0)
      .to(slide.rotation, { x: 0.02, y: 0.03, z: -0.012, duration: LAND, ease: 'power1.in' }, 0)
      // Landing: a short bounce that loses most of its energy.
      .to(slide.position, {
        keyframes: [
          { y: 0.34, duration: 0.15, ease: 'power2.out' },
          { y: 0, duration: 0.15, ease: 'power2.in' },
          { y: 0.07, duration: 0.08, ease: 'power2.out' },
          { y: 0, duration: 0.08, ease: 'power2.in' },
        ],
      }, LAND)
      // ...and a little rock on its base as it settles flat.
      .to(slide.rotation, {
        keyframes: [
          { x: -0.022, z: 0.016, y: 0.012, duration: 0.16, ease: 'sine.out' },
          { x: 0.01, z: -0.007, y: 0, duration: 0.16, ease: 'sine.inOut' },
          { x: 0, z: 0, duration: 0.18, ease: 'sine.inOut' },
        ],
      }, LAND)
      // The lid carries on for a moment as the base stops, then drops back into place.
      .to(lid.position, { y: LID_CLOSED_Y + 0.16, duration: 0.1, ease: 'power2.out' }, LAND)
      .to(lid.position, { y: LID_CLOSED_Y, duration: 0.2, ease: 'bounce.out' }, LAND + 0.1)
    keepDrawing(slideTl.totalDuration() + 0.2)
    // If frames stall, still end with the box in place.
    setTimeout(() => slideTl?.progress(1), 4000)
  }
  tick(gsap.ticker.time)

  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    active?.kill()
    robberTl?.kill()
    slideTl?.kill()
    clearTimeout(pulseTimer)
    drift?.dispose()
    gsap.killTweensOf([...details.map((h) => h.holder.scale), ...tileMeshes.map((m) => m.position), robberRoot.position, lift.position, lift.rotation, lift.scale, blob.scale, blobMat])
    gsap.ticker.remove(tick)
    ro.disconnect()
    window.removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onCancel)
    canvas.removeEventListener('lostpointercapture', onCancel)
    canvas.removeEventListener('webglcontextlost', onLost)
    const mats = new Set()
    const geos = new Set()
    scene.traverse((o) => {
      if (o.geometry) geos.add(o.geometry)
      if (o.material) [].concat(o.material).forEach((m) => mats.add(m))
    })
    geos.forEach((g) => g.dispose())
    mats.forEach((m) => m.dispose())
    textures.forEach((t) => t.dispose())
    key.shadow.map?.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }

  return {
    open,
    close,
    toBoard,
    toIntro,
    // Skip whatever is happening to its end state.
    skip: () => {
      if (active) active.progress(1)
      else if (phase === 'intro') settleBoard()
    },
    setRobber,
    setPaused: (p) => {
      paused = p
      if (!p) dirty = true
      if (p) finish(false)
      if (phase === 'board') {
        if (p) drift?.pause()
        else drift?.resume()
      }
    },
    relayout: () => resize(),
    dispose,
    get phase() {
      return phase
    },
    // Dev-only hook for stepping through the opening in slow (software) renderers.
    debug: import.meta.env.DEV
      ? {
          seek(t) {
            active?.pause().seek(t)
            applyRig()
            render()
          },
          home: HOME,
          drift,
          draw: () => render(),
          slide(t) {
            slideTl?.pause().seek(t)
            render()
          },
          // Screen positions for tests: the robber's body, and a destination's resting spot.
          robber: () => toScreen(v.set(robberRoot.position.x, robberRoot.position.y + 0.3, robberRoot.position.z)),
          rest: (id) => {
            const p = restOf(id)
            return toScreen(v.set(p.x, TILE_TOP + 0.3, p.z))
          },
          tile: (id) => {
            const p = tileXZ(destTile[id])
            return toScreen(v.set(p.x, TILE_TOP, p.z + 0.2))
          },
          pick: (x, y) => {
            aim({ clientX: x, clientY: y })
            return { robber: overRobber({ clientX: x, clientY: y }), board: boardPoint({ clientX: x, clientY: y }), rect: canvas.getBoundingClientRect().toJSON(), W, H }
          },
          state: () => ({ phase, rig: { ...rig }, robber: robberRoot.position.toArray().map((n) => +n.toFixed(3)), lift: lift.position.y }),
        }
      : undefined,
  }
}
