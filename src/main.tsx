import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UntetheredApp from './UntetheredSoulApp.tsx'
import { AuthProvider } from './features/auth/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <UntetheredApp />
    </AuthProvider>
  </StrictMode>,
)
