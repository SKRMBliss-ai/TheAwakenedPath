
import { createRoot } from 'react-dom/client'
import './index.css'
import UntetheredApp from './UntetheredSoulApp'
import AboutJournal from './features/landing/AboutJournal'
import { AuthProvider } from './features/auth/AuthContext'
import { ThemeProvider } from './theme/ThemeSystem'
import { VoiceService } from './services/voiceService'
import { AchievementsProvider } from './features/achievements/useAchievements'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

// Initialize Voice System — wrapped so a throwing init (older mobile browsers
// where some Web APIs are missing) cannot blank the entire app.
try {
  VoiceService.init();
} catch (e) {
  console.warn('[main] VoiceService.init failed; continuing without audio:', e);
}

// Marketing landing route — rendered without auth/theme providers so it stays
// fast for anonymous traffic and survives provider failures.
const isAboutJournalRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '');
  return p === '/aboutjournal' || p === '/aboutjournal/index.html';
})();

const root = createRoot(document.getElementById('root')!);

if (isAboutJournalRoute) {
  root.render(
    <ErrorBoundary featureName="AboutJournal">
      <AboutJournal />
    </ErrorBoundary>,
  );
} else {
  root.render(
    <ErrorBoundary featureName="Root">
      <AuthProvider>
        <ThemeProvider>
          <AchievementsProvider>
            <UntetheredApp />
          </AchievementsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>,
  );
}
