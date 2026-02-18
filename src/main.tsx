import { createRoot } from 'react-dom/client'
import './index.css'
import UntetheredApp from './UntetheredSoulApp.tsx'
import { AuthProvider } from './features/auth/AuthContext.tsx'
import { VoiceService } from './services/voiceService'

// Initialize Voice System
VoiceService.init();

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <UntetheredApp />
  </AuthProvider>,
)
