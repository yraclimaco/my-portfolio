import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/manrope/wght.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/header.css'
import './styles/board.css'
import './styles/box.css'
import './styles/world.css'
import './styles/panel.css'
import './styles/work.css'
import './styles/pages.css'
import './styles/theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
