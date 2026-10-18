// The robber, after the classic wooden Catan robber: a round ball head with a small groove under
// it, an egg-shaped body that swells below the shoulders and narrows to a waist, and a flared base
// with a ridge, all in light grey paint. One profile drives every version: the 3D piece is turned
// from it, and the flat outline (SVG and lid art) is the same profile mirrored.
// Coordinates sit in a 40 x 64 box, centred on x = 20, with the base on the bottom edge (y = 62).

export const ROBBER_HEAD = { cy: 15.4, r: 8.6 }
export const ROBBER_TOP = ROBBER_HEAD.cy - ROBBER_HEAD.r // 6.8

export const ROBBER_COLORS = {
  light: '#cfd2d4',
  mid: '#a9adb0',
  dark: '#7d8184',
}

// [radius, y] pairs from the centre of the base, up the side, to the crown.
export function robberProfile() {
  const pts = [
    [0, 62], [10.6, 62], [11.2, 61.4], [11.5, 58.6], [11.2, 57.4], [11.0, 55.5], [10.5, 52.6],
    [9.9, 50.6], [9.0, 49.8], [8.6, 49.2], // base flare, ridge, fillet into the waist
    [9.4, 47.2], [10.5, 44.5], [11.5, 41], [12.1, 37.5], [12.0, 33.5], [11.4, 30], [10.2, 27], [8.6, 25], [7.2, 23.6], // egg body
    [6.2, 22.8], // the groove under the head
  ]
  const { cy, r } = ROBBER_HEAD
  const start = (-Math.acos(6.2 / r) * 180) / Math.PI
  for (let a = Math.ceil(start); a <= 90; a += 6) {
    const rad = (a * Math.PI) / 180
    pts.push([r * Math.cos(rad), cy - r * Math.sin(rad)])
  }
  pts.push([0, ROBBER_TOP])
  return pts
}

// The flat outline: the profile mirrored about the centre line, as one closed SVG path.
export function robberOutline() {
  const side = robberProfile().filter(([r]) => r > 0)
  const right = side.map(([r, y]) => `${(20 + r).toFixed(2)} ${y.toFixed(2)}`)
  const left = [...side].reverse().map(([r, y]) => `${(20 - r).toFixed(2)} ${y.toFixed(2)}`)
  return `M20 62L${right.join('L')}L20 ${ROBBER_TOP}L${left.join('L')}Z`
}

export const ROBBER_OUTLINE = robberOutline()
// A faint line at the base's ridge and at the waist, for the flat versions.
export const ROBBER_DETAILS = 'M8.8 57.4h22.4M11.4 49.4h17.2'
