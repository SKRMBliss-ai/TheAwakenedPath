
import { createRoot } from 'react-dom/client'
import './index.css'
import UntetheredApp from './UntetheredSoulApp'
import AboutJournal from './features/landing/AboutJournal'
import EmotionalHealthCheck from './features/landing/EmotionalHealthCheck'
import EmotionFeelingsCourse from './features/landing/EmotionFeelingsCourse'
import Policies from './features/landing/Policies'
import SoulfulHome from './features/landing/SoulfulHome'
import ContentHub from './features/content/ContentHub'
import ProgrammaticContentView from './features/content/ProgrammaticContentView'
import MasterKnowledgeHub from './features/content/MasterKnowledgeHub'
import ProgrammaticGlossaryView from './features/content/ProgrammaticGlossaryView'
import ProgrammaticVideoView from './features/content/ProgrammaticVideoView'
import GlobalKnowledgeDock from './components/site/GlobalKnowledgeDock'
import { AuthProvider } from './features/auth/AuthContext'
import { ThemeProvider } from './theme/ThemeSystem'
import { VoiceService } from './services/voiceService'
import { AchievementsProvider } from './features/achievements/useAchievements'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { installGlobalErrorReporting } from './lib/errorReporter'

// Capture async/uncaught errors that never reach a React ErrorBoundary.
installGlobalErrorReporting();

// Initialize Voice System — wrapped so a throwing init (older mobile browsers
// where some Web APIs are missing) cannot blank the entire app.
try {
  VoiceService.init();
} catch (e) {
  console.warn('[main] VoiceService.init failed; continuing without audio:', e);
}

// ─── Stale-deploy guard ───────────────────────────────────────────────────────
// The PWA uses autoUpdate + skipWaiting + clientsClaim + cleanupOutdatedCaches:
// on every deploy the new service worker takes over ALREADY-OPEN tabs and
// deletes the old precached chunks — while the tab is still running the old
// index. Any lazy import after that 404s ("Failed to fetch dynamically
// imported module"). Reload the instant a NEW worker claims an already-
// controlled page so page and cache never diverge. First-ever install
// (no previous controller) is skipped — nothing is stale then.
if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });
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

// ─── /block-clarity — visit this URL on any device to stop Clarity recording ─
// Useful for dev/admin devices. Sets localStorage flag and redirects to app.
if (typeof window !== 'undefined') {
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  if (p === '/block-clarity') {
    try { localStorage.setItem('BLOCK_CLARITY', 'true'); } catch (_) {}
    window.location.replace('/');
  }
  if (p === '/unblock-clarity') {
    try { localStorage.removeItem('BLOCK_CLARITY'); } catch (_) {}
    window.location.replace('/');
  }
}

// Marketing landing route — rendered without auth/theme providers so it stays
// fast for anonymous traffic and survives provider failures.
const isAboutJournalRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  // /aboutawakenedpath is the legacy URL — old email links must keep working
  return p === '/aboutmindgym' || p === '/aboutmindgym/index.html'
    || p === '/aboutawakenedpath' || p === '/aboutawakenedpath/index.html';
})();

// Standalone emotional-health quiz landing — captures email as a lead, then
// runs the 2-minute check. Rendered without auth/theme providers like AboutJournal.
const isEmotionalHealthRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/knowyouremotionalhealth' || p === '/knowyouremotionalhealth/index.html';
})();

// Standalone sales page for the Emotion & Feelings course — same pattern as
// AboutJournal: rendered without auth/theme providers, own email capture.
const isFeelingsCourseRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/feelingsandemotioncourse' || p === '/feelingsandemotioncourse/index.html';
})();

// Standalone legal/policy pages (Privacy, Terms, Refund) — linked from the
// course footer. Rendered without auth/theme providers like the other landings.
const isPoliciesRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/policies' || p === '/policies/index.html';
})();

// Master Knowledge Platform route matching (/knowledge, /learn, /glossary/:term, /videos/:id, /guides/:slug)
const knowledgeInfo = (() => {
  if (typeof window === 'undefined') return { type: 'none', slug: null };
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();

  if (p === '/knowledge' || p === '/knowledge/index.html' || p === '/learn' || p === '/learn/index.html') {
    return { type: 'knowledgeHub', slug: null };
  }
  if (p === '/guides' || p === '/guides/index.html') {
    return { type: 'contentHub', slug: null };
  }
  if (p.startsWith('/glossary/')) {
    const slug = p.split('/').pop() || null;
    return { type: 'glossary', slug };
  }
  if (p.startsWith('/videos/')) {
    const slug = p.split('/').pop() || null;
    return { type: 'video', slug };
  }
  if (p.startsWith('/guides/') || p.startsWith('/learn/')) {
    const slug = p.split('/').pop() || null;
    return { type: 'guide', slug };
  }
  return { type: 'none', slug: null };
})();

// Brand home (Soulful Intelligence umbrella) — the ROOT of skrmblissai.in. The
// Mind Gym app now lives at /mindgym; the bare domain shows the studio home.
const isHomeRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '' || p === '/index.html';
})();

// Track /mindgym (main app) visits — the brand home & AboutJournal track their own.
if (!isAboutJournalRoute && !isEmotionalHealthRoute && !isFeelingsCourseRoute && !isPoliciesRoute && !isHomeRoute && typeof window !== 'undefined') {
  const p = window.location.pathname.toLowerCase();
  if (p === '/mindgym' || p === '/mindgym/') {
    trackPageVisit('/mindgym', 'PAGE_VISIT_APP');
  }
}

const root = createRoot(document.getElementById('root')!);

if (isHomeRoute) {
  root.render(
    <ErrorBoundary featureName="SoulfulHome">
      <SoulfulHome />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (isAboutJournalRoute) {
  root.render(
    <ErrorBoundary featureName="AboutJournal">
      <AboutJournal />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (isEmotionalHealthRoute) {
  root.render(
    <ErrorBoundary featureName="EmotionalHealthCheck">
      <EmotionalHealthCheck />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (isFeelingsCourseRoute) {
  root.render(
    <ErrorBoundary featureName="EmotionFeelingsCourse">
      <EmotionFeelingsCourse />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (isPoliciesRoute) {
  root.render(
    <ErrorBoundary featureName="Policies">
      <Policies />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'knowledgeHub') {
  root.render(
    <ErrorBoundary featureName="MasterKnowledgeHub">
      <MasterKnowledgeHub />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'contentHub') {
  root.render(
    <ErrorBoundary featureName="ContentHub">
      <ContentHub />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'glossary' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticGlossaryView">
      <ProgrammaticGlossaryView termSlug={knowledgeInfo.slug} />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'video' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticVideoView">
      <ProgrammaticVideoView videoId={knowledgeInfo.slug} />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'guide' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticContentView">
      <ProgrammaticContentView slug={knowledgeInfo.slug} />
      <GlobalKnowledgeDock />
    </ErrorBoundary>,
  );
} else {
  root.render(
    <ErrorBoundary featureName="Root">
      <AuthProvider>
        <ThemeProvider>
          <AchievementsProvider>
            <UntetheredApp />
            <GlobalKnowledgeDock />
          </AchievementsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>,
  );
}
