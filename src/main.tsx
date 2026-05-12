
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

// ─── Lightweight page-visit tracker (fire-and-forget) ────────────────────────
const LOG_URL = 'https://us-central1-awakened-path-2026.cloudfunctions.net/logWebActivity';
function trackPageVisit(page: string, action: string) {
  try {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('utm_email') || localStorage.getItem('journal_access_email') || 'anonymous';
    fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action, page, details: `Visited ${page}`, source: document.referrer || 'direct' }),
    }).catch(() => {});
  } catch (_) { /* silent */ }
}

// Marketing landing route — rendered without auth/theme providers so it stays
// fast for anonymous traffic and survives provider failures.
const isAboutJournalRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/aboutjournal' || p === '/aboutjournal/index.html' || p === '/aboutawakenedpath';
})();

// Track /awakenedpath (main app) visits — AboutJournal tracks its own visits internally
if (!isAboutJournalRoute && typeof window !== 'undefined') {
  const p = window.location.pathname.toLowerCase();
  if (p === '/awakenedpath' || p === '/awakenedpath/' || p === '/') {
    trackPageVisit('/awakenedpath', 'PAGE_VISIT_APP');
  }
}

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
