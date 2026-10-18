// sessionStorage can throw (private mode, blocked storage); never let that break the site.
export const session = {
  get(key) {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      /* storage unavailable */
    }
  },
}

export const BOX_OPENED_KEY = 'yc:box-opened'
export const PIECE_KEY = 'yc:piece'
