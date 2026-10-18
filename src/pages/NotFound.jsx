import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'

export default function NotFound() {
  usePageMeta('Off the map')
  return (
    <div className="section">
      <header className="section__head">
        <h1 id="panel-title" className="section__title" tabIndex={-1}>
          Off the map
        </h1>
        <p className="section__lead">That space isn’t on this board. The link may have moved or been mistyped.</p>
      </header>
      <p>
        Try <Link to="/projects">Projects</Link>, <Link to="/experience">Experience</Link>, or head back to the board.
      </p>
    </div>
  )
}
