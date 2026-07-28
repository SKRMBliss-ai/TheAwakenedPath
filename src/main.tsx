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
import EditorialIntelligenceView from './features/content/EditorialIntelligenceView'
import GlobalKnowledgeDock from './components/site/GlobalKnowledgeDock'
import SocialFab from './components/ui/SocialFab'
import { AuthProvider } from './features/auth/AuthContext'
import { ThemeProvider } from './theme/ThemeSystem'
import { VoiceService } from './services/voiceService'
import { AchievementsProvider } from './features/achievements/useAchievements'
import { Component, type ReactNode } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

function trackPageVisit(path: string, eventType = 'PAGE_VISIT') {
  try {
    addDoc(collection(db, 'activity_logs'), {
      eventType,
      path,
      timestamp: serverTimestamp(),
    });
  } catch (_) {}
}

// Silence non-critical speech synthesis errors in development/unsupported environments
VoiceService.init();

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
  return p === '/feelingsandemotioncourse' || p === '/feelingsandemotioncourse/index.html';
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

// Track /mindgym (main app) visits
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
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (isAboutJournalRoute) {
  root.render(
    <ErrorBoundary featureName="AboutJournal">
      <AboutJournal />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (isEmotionalHealthRoute) {
  root.render(
    <ErrorBoundary featureName="EmotionalHealthCheck">
      <EmotionalHealthCheck />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (isFeelingsCourseRoute) {
  root.render(
    <ErrorBoundary featureName="EmotionFeelingsCourse">
      <EmotionFeelingsCourse />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (isPoliciesRoute) {
  root.render(
    <ErrorBoundary featureName="Policies">
      <Policies />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'editorial') {
  root.render(
    <ErrorBoundary featureName="EditorialIntelligenceView">
      <EditorialIntelligenceView />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'knowledgeHub') {
  root.render(
    <ErrorBoundary featureName="MasterKnowledgeHub">
      <MasterKnowledgeHub />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'contentHub') {
  root.render(
    <ErrorBoundary featureName="ContentHub">
      <ContentHub />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'glossary' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticGlossaryView">
      <ProgrammaticGlossaryView termSlug={knowledgeInfo.slug} />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'video' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticVideoView">
      <ProgrammaticVideoView videoId={knowledgeInfo.slug} />
      <GlobalKnowledgeDock />
      <SocialFab />
    </ErrorBoundary>,
  );
} else if (knowledgeInfo.type === 'guide' && knowledgeInfo.slug) {
  root.render(
    <ErrorBoundary featureName="ProgrammaticContentView">
      <ProgrammaticContentView slug={knowledgeInfo.slug} />
      <GlobalKnowledgeDock />
      <SocialFab />
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
            <SocialFab />
          </AchievementsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>,
  );
}
