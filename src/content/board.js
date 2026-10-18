// The board: a hex island with six destinations on the tiles around a central desert,
// where the robber starts (as in the game that inspired it).

// Axial directions for the six hexes around the centre.
export const DIRS = { E: [1, 0], NE: [1, -1], NW: [0, -1], W: [-1, 0], SW: [-1, 1], SE: [0, 1] }

// Listed in navigation order, which is also the keyboard order on the board.
// The id doubles as the route segment (except Projects, which keeps the id 'work').
export const destinations = [
  { id: 'work', label: 'Projects', to: '/projects', at: 'NW', terrain: 'wheat' },
  { id: 'experience', label: 'Experience', to: '/experience', at: 'NE', terrain: 'hills' },
  { id: 'skills', label: 'Skills', to: '/skills', at: 'E', terrain: 'orchard' },
  { id: 'about', label: 'About', to: '/about', at: 'SW', terrain: 'pasture' },
  { id: 'beyond-data', label: 'Beyond Data', to: '/beyond-data', at: 'W', terrain: 'forest' },
  { id: 'contact', label: 'Contact', to: '/contact', at: 'SE', terrain: 'forest' },
]

export const HOME = 'home'

// Ring one is all destinations; ring two runs clockwise from due east.
export const ringOneTerrain = {}
export const ringTwoTerrain = [
  'pasture', 'wheat', 'forest', 'hills', 'orchard', 'pasture',
  'wheat', 'forest', 'orchard', 'hills', 'pasture', 'wheat',
]

const dirKey = Object.fromEntries(Object.entries(DIRS).map(([k, [q, r]]) => [`${q},${r}`, k]))

// The 19 land hexes (rings 0 to 2) with their terrain. Shared by the board and the 3D box,
// so the miniature inside the box matches the full board exactly.
export function islandTiles() {
  const tiles = []
  const ring2 = []
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      const d = (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2
      if (d > 2) continue
      const t = { q, r, d }
      if (d === 0) t.terrain = 'desert'
      else if (d === 1) {
        const key = dirKey[`${q},${r}`]
        const dest = destinations.find((x) => x.at === key)
        t.dest = dest?.id
        t.terrain = dest?.terrain ?? ringOneTerrain[key]
      } else ring2.push(t)
      tiles.push(t)
    }
  }
  // Ring two, clockwise (on screen) from due east.
  const angle = (t) => Math.atan2(1.5 * t.r, Math.sqrt(3) * (t.q + t.r / 2))
  ring2.sort((a, b) => angle(a) - angle(b)).forEach((t, i) => (t.terrain = ringTwoTerrain[i % ringTwoTerrain.length]))
  return tiles
}

export const sections = ['work', 'experience', 'skills', 'about', 'beyond-data', 'contact']

export function sectionFor(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return null
  const [, first, second, third] = path.split('/')
  // Projects live at /projects (older /work links redirect there).
  if ((first === 'projects' || first === 'work') && !third) return 'work'
  if (sections.includes(first) && !second) return first
  return 'notfound'
}

export const destinationFor = (section) => destinations.find((d) => d.id === section) ?? null
