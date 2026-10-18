// Large screens get a floating content surface (~90% of the viewport) with a glimpse of the
// board around it; smaller screens get a full-screen view. Keep in sync with panel.css.
export const WIDE_QUERY = '(min-width: 900px) and (min-height: 560px)'

export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)
