// The 3D game box for the intro. Vanilla three.js, loaded on demand.
//
// Ownership of animated properties (so tweens never fight):
//   GSAP     lid position/rotation, the camera rig, the overlay opacity
//   ticker   the tilt group (pointer tilt) and the hover group (lid hover lift)
import {
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RepeatWrapping,
  Scene,
  Shape,
  ShadowMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'
import { islandTiles } from '../content/board'
import { fills } from '../content/terrain'
import { SQRT3 } from '../lib/hex'
import { drawBoard, drawContactShadow, drawLid, drawPaper, drawTileTop } from './textures'

// World units: one unit is the board's hex size, so the miniature is the real board at scale.
const BASE = { w: 17, d: 12, h: 2.4, wall: 0.22 }
const LID = { w: 17.34, d: 12.34, h: 1.3, top: 0.24, wall: 0.17 }
const CORNER = 0.16
const INSERT_Y = 1.36 // the board insert sits high in the box, as if on top of the contents
const TILE = { r: 0.93, round: 0.22, depth: 0.08, bevel: 0.025 }
const TILE_TOP = INSERT_Y + TILE.depth + TILE.bevel * 2
const LID_CLOSED_Y = BASE.h + 0.02 - LID.h + LID.top // lid group origin: the bottom of its walls
const FOV = 28

const INTRO_VIEW = { yaw: 0.44, pitch: 0.7 }
const INTRO_VIEW_PORTRAIT = { yaw: 0.34, pitch: 0.84 }

async function fontsReady() {
  if (!document.fonts?.load) return
  const fam = '"Manrope Variable"'
  await Promise.race([
    Promise.all([document.fonts.load(`700 64px ${fam}`), document.fonts.load(`600 32px ${fam}`)]),
    new Promise((r) => setTimeout(r, 1500)),
  ])
}

function roundedRect(w, d, r) {
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
function wallRing(w, d, wall, h, r) {
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
function hexShape(size, radius) {
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
const tileUV = (R) => ({
  generateTopUV(_g, v, a, b, c) {
    return [a, b, c].map((i) => new Vector2(v[i * 3] / (2 * R) + 0.5, v[i * 3 + 1] / (2 * R) + 0.5))
  },
  generateSideWallUV() {
    return [new Vector2(), new Vector2(), new Vector2(), new Vector2()]
  },
})

// Turned-wood robber, following the outline of the 2D piece (40 x 64 drawing units).
function robberGeometry(height) {
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

export async function createBoxScene({ container, reduced, getHandoff, onFirstFrame, onContextLost }) {
  await fontsReady()

  // Portrait screens get the box turned upright (with a portrait lid layout), so it can be
  // shown large; a landscape box could never be wider than its short side allows.
  const start = container.getBoundingClientRect()
  const portrait = start.width / Math.max(start.height, 1) < 0.8
  const BOX = portrait ? { ...BASE, w: BASE.d, d: BASE.w } : BASE
  const COVER = portrait ? { ...LID, w: LID.d, d: LID.w } : LID

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  const coarse = window.matchMedia('(pointer: coarse)').matches
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  container.appendChild(canvas)

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.5, 200)
  const textures = []
  const tex = (source, { repeat = false, aniso = 1 } = {}) => {
    const t = new CanvasTexture(source)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = Math.min(aniso, renderer.capabilities.getMaxAnisotropy())
    if (repeat) t.wrapS = t.wrapT = RepeatWrapping
    textures.push(t)
    return t
  }

  // ---------- Light: a soft overhead key with gentle fill, so prints read true to colour.
  // Upward faces receive hemisphere + key = PI, which reproduces the board's exact colours.
  scene.add(new HemisphereLight(0xffffff, 0xcbbd9f, 1.4))
  const key = new DirectionalLight(0xfff7ea, 2.0)
  key.position.set(-7, 22, 9)
  key.castShadow = true
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048)
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 4, far: 60 })
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.03
  key.shadow.radius = 3
  scene.add(key)

  // ---------- Groups
  const tilt = new Group() // pointer tilt (ticker)
  scene.add(tilt)

  // ---------- Table shadows
  const contact = new Mesh(
    new PlaneGeometry(BOX.w / 0.62, BOX.d / 0.62),
    new MeshBasicMaterial({ map: tex(drawContactShadow()), transparent: true, opacity: 0.32, depthWrite: false, color: 0xffffff }),
  )
  contact.material.map.colorSpace = SRGBColorSpace
  contact.rotation.x = -Math.PI / 2
  contact.position.y = 0.005
  contact.renderOrder = -1
  tilt.add(contact)

  const tableShadow = new Mesh(new PlaneGeometry(80, 80), new ShadowMaterial({ opacity: 0.12, color: new Color('#3b2c1f'), depthWrite: false }))
  tableShadow.rotation.x = -Math.PI / 2
  tableShadow.receiveShadow = true
  tilt.add(tableShadow)

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
  baseFloor.receiveShadow = true
  base.add(baseFloor)
  tilt.add(base)

  // ---------- Miniature board inside: sea and shore printed, land tiles raised.
  const insW = BOX.w - BOX.wall * 2 - 0.04
  const insD = BOX.d - BOX.wall * 2 - 0.04
  const ppu = 2048 / Math.max(insW, insD)
  const boardCanvas = document.createElement('canvas')
  boardCanvas.width = Math.round(insW * ppu)
  boardCanvas.height = Math.round(insD * ppu)
  drawBoard(boardCanvas.getContext('2d'), boardCanvas.width, boardCanvas.height, boardCanvas.width / 2, boardCanvas.height / 2, ppu, {
    withLand: false,
  })
  const insert = new Mesh(
    new PlaneGeometry(insW, insD),
    new MeshLambertMaterial({ map: tex(boardCanvas, { aniso: 8 }) }),
  )
  insert.rotation.x = -Math.PI / 2
  insert.position.y = INSERT_Y
  insert.receiveShadow = true
  tilt.add(insert)
  // The stack under the board, so no gap shows around its edge.
  const stackH = INSERT_Y - 0.21
  const insertEdge = new Mesh(new RoundedBoxGeometry(insW, stackH, insD, 1, 0.02), kraftInside)
  insertEdge.position.y = 0.2 + stackH / 2
  tilt.add(insertEdge)

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
  const tileTopMats = new Map()
  const sideMats = new Map()
  const board = new Group()
  for (const t of islandTiles()) {
    const k = `${t.terrain}${t.dest ? ':d' : ''}`
    if (!tileTopMats.has(k)) tileTopMats.set(k, new MeshLambertMaterial({ map: tex(drawTileTop(t.terrain, t.dest), { aniso: 4 }) }))
    if (!sideMats.has(t.terrain)) sideMats.set(t.terrain, new MeshLambertMaterial({ color: new Color(fills[t.terrain][1]).multiplyScalar(0.86) }))
    const m = new Mesh(tileGeo, [tileTopMats.get(k), sideMats.get(t.terrain)])
    m.position.set(SQRT3 * (t.q + t.r / 2), INSERT_Y + TILE.bevel, 1.5 * t.r)
    m.castShadow = m.receiveShadow = true
    board.add(m)
  }
  tilt.add(board)

  const robber = new Mesh(robberGeometry(0.68), new MeshStandardMaterial({ color: '#6a4c38', roughness: 0.62, metalness: 0 }))
  robber.position.set(0, TILE_TOP, 0.22)
  robber.castShadow = true
  tilt.add(robber)

  // ---------- Lid: a printed top over a shallow wall ring.
  const sage = new MeshStandardMaterial({ color: '#4f6f52', roughness: 0.82, metalness: 0 })
  const lidInside = new MeshStandardMaterial({ color: '#e9dcc2', roughness: 0.95, metalness: 0 })
  const lidArt = tex(drawLid(portrait ? Math.round((2048 * COVER.w) / COVER.d) : 2048, portrait ? 2048 : Math.round((2048 * COVER.d) / COVER.w)), { aniso: 16 })
  const print = new MeshStandardMaterial({ map: lidArt, roughness: 0.78, metalness: 0 })
  const hover = new Group() // hover lift (ticker)
  const lid = new Group() // opening (GSAP)
  lid.position.y = LID_CLOSED_Y
  const lidWalls = new Mesh(wallRing(COVER.w, COVER.d, LID.wall, LID.h - LID.top + 0.02, CORNER + 0.02), [lidInside, sage])
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z.
  const lidTop = new Mesh(new RoundedBoxGeometry(COVER.w, LID.top, COVER.d, 4, 0.1), [sage, sage, print, lidInside, sage, sage])
  lidTop.position.y = LID.h - LID.top / 2
  for (const m of [lidWalls, lidTop]) {
    m.castShadow = true
    m.receiveShadow = true
    lid.add(m)
  }
  hover.add(lid)
  tilt.add(hover)

  // ---------- Camera rig: yaw / pitch / distance around a target. GSAP tweens this object.
  const view = portrait ? INTRO_VIEW_PORTRAIT : INTRO_VIEW
  const rig = { ...view, dist: 50, tx: 0, ty: 1.2, tz: 0 }
  const applyRig = () => {
    const cp = Math.cos(rig.pitch)
    camera.position.set(
      rig.tx + rig.dist * Math.sin(rig.yaw) * cp,
      rig.ty + rig.dist * Math.sin(rig.pitch),
      rig.tz + rig.dist * Math.cos(rig.yaw) * cp,
    )
    camera.rotation.set(-rig.pitch, rig.yaw, 0, 'YXZ')
    camera.updateMatrixWorld()
  }

  let W = 1
  let H = 1
  const v = new Vector3()
  const right = new Vector3()
  const up = new Vector3()

  // Place the camera (for a given yaw/pitch) so `points` fill the pixel rectangle `rect`.
  const fit = (target, points, rect, contain = true) => {
    const saved = { ...rig }
    Object.assign(rig, target)
    for (let i = 0; i < 10; i++) {
      applyRig()
      let x0 = Infinity
      let x1 = -Infinity
      let y0 = Infinity
      let y1 = -Infinity
      for (const p of points) {
        v.copy(p).project(camera)
        const px = ((v.x + 1) / 2) * W
        const py = ((1 - v.y) / 2) * H
        x0 = Math.min(x0, px)
        x1 = Math.max(x1, px)
        y0 = Math.min(y0, py)
        y1 = Math.max(y1, py)
      }
      const kx = (x1 - x0) / rect.w
      const ky = (y1 - y0) / rect.h
      rig.dist *= contain ? Math.max(kx, ky) : (kx + ky) / 2
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
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0, LID_CLOSED_Y + LID.h]) {
    boxCorners.push(new Vector3((sx * COVER.w) / 2, y, (sz * COVER.d) / 2))
  }
  const tiles = islandTiles()
  const islandPoints = tiles.map((t) => new Vector3(SQRT3 * (t.q + t.r / 2), TILE_TOP, 1.5 * t.r))

  // Where the box sits on screen: the space above the action buttons.
  let introPose = null
  const layoutIntro = () => {
    const bottom = container.dataset.reserveBottom ? Number(container.dataset.reserveBottom) : H * 0.22
    const top = container.dataset.reserveTop ? Number(container.dataset.reserveTop) : 56
    const padX = Math.max(W * 0.06, 16)
    const rect = { x: padX, y: top, w: W - padX * 2, h: Math.max(H - top - bottom, H * 0.35) }
    // Do not let the box get absurdly large on very wide screens.
    const maxW = Math.min(rect.w, 860)
    rect.x += (rect.w - maxW) / 2
    rect.w = maxW
    introPose = fit({ ...view, ty: 1.2 }, boxCorners, rect)
  }

  // The camera pose that lines the miniature up with the full-screen board underneath.
  const handoffPose = () => {
    const h = getHandoff?.()
    let rect
    if (h) {
      const xs = tiles.map((t) => h.x + h.s * SQRT3 * (t.q + t.r / 2))
      const ys = tiles.map((t) => h.y + h.s * 1.5 * t.r)
      rect = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
    } else {
      const size = Math.min(W, H) * 0.6
      rect = { x: (W - size) / 2, y: (H - size) / 2, w: size, h: size }
    }
    return fit({ yaw: 0, pitch: Math.PI / 2 - 0.0001, ty: TILE_TOP }, islandPoints, rect, false)
  }

  // ---------- Pointer tilt and hover
  const ray = new Raycaster()
  const ndc = new Vector2()
  const tiltTarget = { x: 0, y: 0 }
  let hoverTarget = 0
  let interactive = true
  let dirty = true
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const hitBox = (clientX, clientY) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    return ray.intersectObjects([lid, base], true).length > 0
  }

  const onMove = (e) => {
    if (!interactive) return
    if (!reduced && finePointer) {
      tiltTarget.x = (e.clientX / W - 0.5) * 2
      tiltTarget.y = (e.clientY / H - 0.5) * 2
    }
    const over = hitBox(e.clientX, e.clientY)
    canvas.style.cursor = over ? 'pointer' : ''
    hoverTarget = over && !reduced ? 1 : 0
    dirty = true
  }
  const onLeave = () => {
    tiltTarget.x = tiltTarget.y = 0
    hoverTarget = 0
    dirty = true
  }
  let onBoxClick = null
  let down = null
  const onDown = (e) => (down = { x: e.clientX, y: e.clientY })
  const onUp = (e) => {
    if (!interactive || !down) return
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8
    down = null
    if (!moved && hitBox(e.clientX, e.clientY)) onBoxClick?.()
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)

  const onLost = (e) => {
    e.preventDefault()
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', onLost)

  // ---------- Render loop (GSAP's ticker: one rAF for tweens and frames; idles when nothing moves)
  let active = null // the running open timeline
  let firstFrame = false
  const tick = () => {
    const ease = interactive ? 0.09 : 0.22
    const tx = tiltTarget.x * 0.07
    const ty = tiltTarget.y * 0.035
    const dyaw = tx - tilt.rotation.y
    const dpitch = ty - tilt.rotation.x
    const dhover = hoverTarget * 0.14 - hover.position.y
    const moving = Math.abs(dyaw) > 1e-4 || Math.abs(dpitch) > 1e-4 || Math.abs(dhover) > 1e-4
    if (moving) {
      tilt.rotation.y += dyaw * ease
      tilt.rotation.x += dpitch * ease
      hover.position.y += dhover * 0.16
    }
    if (!moving && !active && !dirty) return
    dirty = false
    if (active) applyRig()
    renderer.render(scene, camera)
    if (!firstFrame) {
      firstFrame = true
      onFirstFrame?.()
    }
  }

  const resize = () => {
    const r = container.getBoundingClientRect()
    W = Math.max(1, Math.round(r.width))
    H = Math.max(1, Math.round(r.height))
    renderer.setSize(W, H, false)
    camera.aspect = W / H
    camera.updateProjectionMatrix()
    if (!active) {
      layoutIntro()
      Object.assign(rig, introPose)
      applyRig()
    }
    dirty = true
    if (reduced) tick()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()
  gsap.ticker.add(tick)

  // ---------- Opening: lid lifts with a little weight, camera eases down onto the board,
  // and the overlay fades as the miniature lines up with the real board. ~1.35s.
  const open = ({ fadeEl, onDone }) => {
    if (active) {
      active.progress(1)
      return
    }
    interactive = false
    canvas.style.cursor = ''
    tiltTarget.x = tiltTarget.y = 0
    hoverTarget = 0
    const to = handoffPose()
    // Distance is tweened in log space so the zoom reads as steady rather than rushing at the end.
    const zoom = { log: (v) => (v === undefined ? Math.log(rig.dist) : (rig.dist = Math.exp(v))) }
    active = gsap.timeline({
      onComplete: () => {
        onDone?.()
      },
    })
    active
      // Break the seal: a short, slow rise as the lid grips the base.
      .to(lid.position, { y: LID_CLOSED_Y + 0.32, duration: 0.24, ease: 'power1.inOut' }, 0)
      .to(lid.rotation, { x: -0.035, duration: 0.24, ease: 'power1.inOut' }, 0)
      // Then it comes free and is lifted up and away, tipping back.
      // It ends well above and behind the camera's final position, clear of every viewport.
      .to(lid.position, { y: LID_CLOSED_Y + 28, z: -13, duration: 0.7, ease: 'power2.in' }, 0.24)
      .to(lid.rotation, { x: -0.75, duration: 0.7, ease: 'power2.in' }, 0.24)
      // The camera swings round and tips down while it closes in.
      .to(rig, { yaw: to.yaw, pitch: to.pitch, tx: to.tx, ty: to.ty, tz: to.tz, duration: 0.98, ease: 'power2.inOut' }, 0.3)
      .to(zoom, { log: Math.log(to.dist), duration: 0.98, ease: 'power1.inOut' }, 0.3)
    if (fadeEl) active.to(fadeEl, { opacity: 0, duration: 0.32, ease: 'power1.in' }, 1.02)
  }

  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    active?.kill()
    active = null
    gsap.ticker.remove(tick)
    ro.disconnect()
    window.removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointerup', onUp)
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
    dispose,
    // Dev-only hook for stepping through the opening in slow (software) renderers.
    debug: import.meta.env.DEV
      ? {
          seek(t) {
            active?.pause().seek(t)
            applyRig()
            renderer.render(scene, camera)
          },
        }
      : undefined,
    setOnBoxClick: (fn) => (onBoxClick = fn),
    relayout: () => resize(),
  }
}
