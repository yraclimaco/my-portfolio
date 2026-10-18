import Work from './pages/Work'
import Experience from './pages/Experience'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

// '/' is the board itself; every other route opens in the content panel.
export const routes = [
  { path: '/', element: null },
  { path: '/work', element: <Work /> },
  { path: '/work/:slug', element: <Work /> },
  { path: '/experience', element: <Experience /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '*', element: <NotFound /> },
]
