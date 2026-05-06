import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const stored = localStorage.getItem('loveos-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const useDark = stored === 'dark' || (stored == null && prefersDark)
if (useDark) document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
