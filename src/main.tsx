import { createRoot } from 'react-dom/client'
import './index.css'
import UntetheredApp from './UntetheredSoulApp'
import { AuthProvider } from './features/auth/AuthContext'
import { ThemeProvider } from './theme/ThemeSystem'
import { VoiceService } from './services/voiceService'
import { AchievementsProvider } from './features/achievements/useAchievements'

// Initialize Voice System
VoiceService.init();

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider>
      <AchievementsProvider>
        <UntetheredApp />
      </AchievementsProvider>
    </ThemeProvider>
  </AuthProvider>,
)
