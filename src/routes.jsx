import Work from './pages/Work'
import OldWorkLink from './pages/OldWorkLink'
import Experience from './pages/Experience'
import About from './pages/About'
import Skills from './pages/Skills'
import BeyondData from './pages/BeyondData'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// '/' is the board itself; every other route opens in the content panel.
export const routes = [
  { path: '/', element: null },
  // One route for the gallery and a project, so the gallery keeps its place while a project is open.
  { path: '/projects/:slug?', element: <Work /> },
  { path: '/work/:slug?', element: <OldWorkLink /> },
  { path: '/experience', element: <Experience /> },
  { path: '/skills', element: <Skills /> },
  { path: '/about', element: <About /> },
  { path: '/beyond-data', element: <BeyondData /> },
  { path: '/contact', element: <Contact /> },
  { path: '*', element: <NotFound /> },
]
