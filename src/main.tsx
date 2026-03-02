import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initErrorLogger } from './services/errorLogger'
import './i18n'
import './index.css'
import App from './App.tsx'

initErrorLogger()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
