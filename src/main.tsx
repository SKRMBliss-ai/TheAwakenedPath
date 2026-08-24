import { createRoot } from 'react-dom/client'
import './index.css'
import UntetheredApp from './UntetheredSoulApp'
import AboutJournal from './features/landing/AboutJournal'
import EmotionalHealthCheck from './features/landing/EmotionalHealthCheck'
import EmotionFeelingsCourse from './features/landing/EmotionFeelingsCourse'
import KidsChallenge from './features/landing/KidsChallenge'
import KidsChallengeFlyer from './features/landing/KidsChallengeFlyer';
import KidsChallengeRegister from './features/landing/KidsChallengeRegister';
import Policies from './features/landing/Policies'
import AboutUs from './features/landing/AboutUs'
import SoulfulHome from './features/landing/SoulfulHome'
import ContentHub from './features/content/ContentHub'
import ProgrammaticContentView from './features/content/ProgrammaticContentView'
import MasterKnowledgeHub from './features/content/MasterKnowledgeHub'
import ProgrammaticGlossaryView from './features/content/ProgrammaticGlossaryView'
import ProgrammaticVideoView from './features/content/ProgrammaticVideoView'
import EditorialIntelligenceView from './features/content/EditorialIntelligenceView'
import SiteWidgets from './components/site/SiteWidgets'
import NotFoundView from './components/site/NotFoundView'
import { AuthProvider } from './features/auth/AuthContext'
import { ThemeProvider } from './theme/ThemeSystem'
import { VoiceService } from './services/voiceService'
import { AchievementsProvider } from './features/achievements/useAchievements'
import { Component, type ReactNode, lazy, Suspense } from 'react'
import { track } from './lib/analytics'

// Silence non-critical speech synthesis errors in development/unsupported environments
VoiceService.init();

// Monitor service worker registration for errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg) {
      console.log('[ServiceWorker] Registered and ready');
      reg.onupdatefound = () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.onstatechange = () => {
            if (newWorker.state === 'activated') {
              console.log('[ServiceWorker] Updated and activated');
            }
          };
        }
      };
    }
  }).catch((err) => {
    console.error('[ServiceWorker] Registration failed:', err);
  });
}

class ErrorBoundary extends Component<
  { children: ReactNode; featureName?: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; featureName?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error(`ErrorBoundary caught error in ${this.props.featureName || 'App'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#0D0A12',
          color: '#EDE9E3',
          fontFamily: "'Outfit', system-ui, sans-serif",
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, marginBottom: 12, color: '#FFDF9E' }}>
            A Moment of Stillness
          </h2>
          <p style={{ maxWidth: 440, color: 'rgba(237,233,227,0.7)', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
            Something unexpected occurred while rendering this experience. Take a deep breath.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              borderRadius: 999,
              background: '#C4913A',
              color: '#1E1426',
              border: 'none',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route definitions for standalone landing pages
const isAboutJournalRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/aboutmindgym' || p === '/aboutmindgym/index.html'
    || p === '/aboutawakenedpath' || p === '/aboutawakenedpath/index.html';
})();

const isEmotionalHealthRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/knowyouremotionalhealth' || p === '/knowyouremotionalhealth/index.html';
})();

const isFeelingsCourseRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  // /checkout is the course page's own dedicated payment step, rendered by the
  // same component — it must resolve here rather than falling through to 404.
  return p === '/feelingsandemotioncourse' || p === '/feelingsandemotioncourse/index.html'
    || p === '/feelingsandemotioncourse/checkout';
})();

const isKidsChallengeRegisterRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/kidschallenge/register' || p === '/kidschallenge/register/index.html';
})();

const isKidsChallengeFlyerRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/kidschallenge/flyer' || p === '/kidschallenge/flyer/index.html';
})();

const isKidsChallengeRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/kidschallenge' || p === '/kidschallenge/index.html';
})();

const isAboutUsRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/about-us' || p === '/about-us/index.html' || p === '/aboutus';
})();

const isPoliciesRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/policies' || p === '/policies/index.html';
})();

// Master Knowledge Platform route matching (/knowledge, /learn, /editorial, /glossary/:term, /videos/:id, /guides/:slug)
const knowledgeInfo = (() => {
  if (typeof window === 'undefined') return { type: 'none', slug: null };
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();

  if (p === '/editorial' || p === '/editorial/index.html' || p === '/knowledge/editorial') {
    return { type: 'editorial', slug: null };
  }
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

// Brand home (Soulful Intelligence umbrella) — the ROOT of skrmblissai.in
const isHomeRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '' || p === '/index.html';
})();

// The Mind Gym app itself. This is the ONLY path that should fall through to the
// app render below — every other real path is either matched explicitly above or
// shipped as a static file (/twinsouls, /emotions, /habitquest2026, /og,
// /assets), which Hosting serves directly without ever reaching this bundle.
// Anything else is a bad URL and must render NotFoundView rather than silently
// showing the app on top of the home page's prerendered HTML.
const isMindGymRoute = (() => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return p === '/mindgym' || p === '/mindgym/index.html';
})();

// Track /mindgym (main app) visits
if (!isAboutJournalRoute && !isEmotionalHealthRoute && !isFeelingsCourseRoute && !isPoliciesRoute && !isAboutUsRoute && !isHomeRoute && typeof window !== 'undefined') {
  const p = window.location.pathname.toLowerCase();
  if (p === '/mindgym' || p === '/mindgym/') {
    track('PAGE_VISIT_APP', '', '/mindgym');
  }
}

const root = createRoot(document.getElementById('root')!);


// DEV-ONLY visual harness for the practice-path components. The real screens
// sit behind auth; this renders them against sample data so layout can be
// checked without signing in. import.meta.env.DEV is false in any production
// build, so this branch and its import are tree-shaken away entirely.
const isPracticePreviewRoute = import.meta.env.DEV
  && typeof window !== 'undefined'
  && window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/__practice-preview';

if (isPracticePreviewRoute) {
  const PracticePathPreview = lazy(() => import('./features/practice-path/__preview'));
  root.render(
    <Suspense fallback={<div style={{ padding: 40, color: '#888' }}>Loading preview…</div>}>
      <PracticePathPreview />
    </Suspense>,
  );
} else if (isHomeRoute) {
  root.render(
    <ErrorBoundary featureName="SoulfulHome">
      <SoulfulHome />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isAboutJournalRoute) {
  root.render(
    <ErrorBoundary featureName="AboutJournal">
      <AboutJournal />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isEmotionalHealthRoute) {
  root.render(
    <ErrorBoundary featureName="EmotionalHealthCheck">
      <EmotionalHealthCheck />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isFeelingsCourseRoute) {
  root.render(
    <ErrorBoundary featureName="EmotionFeelingsCourse">
      <EmotionFeelingsCourse />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isKidsChallengeRegisterRoute) {
  root.render(
    <ErrorBoundary featureName="KidsChallengeRegister">
      <KidsChallengeRegister />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isKidsChallengeFlyerRoute) {
  root.render(
    <ErrorBoundary featureName="KidsChallengeFlyer">
      <KidsChallengeFlyer />
    </ErrorBoundary>,
  );
} else if (isKidsChallengeRoute) {
  root.render(
    <ErrorBoundary featureName="KidsChallenge">
      <KidsChallenge />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isAboutUsRoute) {
  root.render(
    <ErrorBoundary featureName="AboutUs">
      <AboutUs />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isPoliciesRoute) {
  root.render(
    <ErrorBoundary featureName="Policies">
      <Policies />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'editorial') {
  root.render(
    <ErrorBoundary featureName="EditorialIntelligenceView">
      <AuthProvider>
        <EditorialIntelligenceView />
        <SiteWidgets />
      </AuthProvider>
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'knowledgeHub') {
  root.render(
    <ErrorBoundary featureName="MasterKnowledgeHub">
      <MasterKnowledgeHub />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'contentHub') {
  root.render(
    <ErrorBoundary featureName="ContentHub">
      <ContentHub />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'glossary' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticGlossaryView">
      <ProgrammaticGlossaryView termSlug={knowledgeInfo.slug} />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'video' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticVideoView">
      <ProgrammaticVideoView videoId={knowledgeInfo.slug} />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'guide' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticContentView">
      <ProgrammaticContentView slug={knowledgeInfo.slug} />
      <SiteWidgets />
    </ErrorBoundary>,
  );
} else if (isMindGymRoute) {
  root.render(
    <ErrorBoundary featureName="Root">
      <AuthProvider>
        <ThemeProvider>
          <AchievementsProvider>
            <UntetheredApp />
            <SiteWidgets />
          </AchievementsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>,
  );
} else {
  // Unrecognised path — render an honest 404 (and noindex it) instead of
  // quietly showing the app over the home page's prerendered markup.
  root.render(
    <ErrorBoundary featureName="NotFound">
      <ThemeProvider>
        <NotFoundView />
      </ThemeProvider>
    </ErrorBoundary>,
  );
}
