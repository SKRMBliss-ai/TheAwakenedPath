import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Check,
  X,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useRazorpay } from '../../hooks/useRazorpay';
import { usePaypal } from '../../hooks/usePaypal';
import { usePageSeo } from '../../lib/seo';
import PriceSlider from '../../components/ui/PriceSlider';
import { useSiteTheme } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SacredGeometry from './components/SacredGeometry';
import CursorGlow from './components/CursorGlow';
import HeroMark from '../../components/site/HeroMark';
import BodyMapShowcase from './components/BodyMapShowcase';
import { PaypalDivider, TrustStrip, TrustBadges, ConsentCheckboxes, WhatsIncluded, OrderPromise } from '../../components/checkout';

// ─────────────────────────────────────────────────────────────────────────────
// Emotion & Feelings Course Page — /feelingsandemotioncourse
// Ultra-premium, editorial course experience inspired by Apple, MasterClass & Calm.
// Fully responsive, accessible, with progressive sacred geometry reveal.
// ─────────────────────────────────────────────────────────────────────────────

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

const FS = (file: string) =>
  `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fsite%2F${encodeURIComponent(file)}?alt=media`;

const FS_ROOT = (file: string) =>
  `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2F${encodeURIComponent(file)}?alt=media`;

const HERO_PORTRAIT = FS('sim-portrait.webp');
const SIM_PROFILE   = FS('SimKatyalProfile.webp');
const JOURNAL_IMG   = FS('reflection-journal.webp');
const CLOSING_BANNER = FS_ROOT('ClosingBanner.webp');

const LOG_URL = 'https://us-central1-awakened-path-2026.cloudfunctions.net/logWebActivity';

function trackActivity(action: string, details = '', emailOverride?: string) {
  try {
    const email = emailOverride || localStorage.getItem('journal_access_email') || 'anonymous';
    fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        action,
        page: '/feelingsandemotioncourse',
        details,
        source: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
      }),
    }).catch(() => {});
  } catch (_) { /* silent */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Symptom / Conditioning Cards
interface SymptomCard {
  id: string;
  icon: string; // SVG path
  title: string;
  sub: string;
  insightTitle: string;
  insightText: string;
  moduleLink: string;
}

const SYMPTOMS: SymptomCard[] = [
  {
    id: 'replay',
    icon: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5 M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16 M21 21v-5h-5',
    title: 'I replay conversations',
    sub: 'again and again.',
    insightTitle: 'The Replaying Loop',
    insightText: 'Replaying past moments is the ego’s attempt to rewrite history and regain lost control. In Module 2, you learn how to spot this mental movie the moment it starts and return to the present.',
    moduleLink: 'Module 2: Awareness',
  },
  {
    id: 'shutdown',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M22 11h-6',
    title: 'I shut down or overreact',
    sub: 'without meaning to.',
    insightTitle: 'Nervous System Hijack',
    insightText: 'When an unaddressed past trigger is tapped, your fight-or-flight system takes the wheel before your rational mind can speak. Module 3 teaches you the somatic anatomy of triggers.',
    moduleLink: 'Module 3: Understanding Triggers',
  },
  {
    id: 'conflict',
    icon: 'M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z M12 8v5 M12 16h.01',
    title: 'I avoid conflict',
    sub: 'and people please.',
    insightTitle: 'The Fawn Response',
    insightText: 'People-pleasing is a protective habit formed when staying quiet felt safer than standing in your truth. In Module 5, you learn the art of non-resistance and clear inner boundaries.',
    moduleLink: 'Module 5: Acceptance',
  },
  {
    id: 'guilt',
    icon: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6 11 4.6a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    title: 'I feel guilty afterwards',
    sub: 'no matter what.',
    insightTitle: 'The Second Wave of Suffering',
    insightText: 'First comes the emotion, then comes judgment for having the emotion. This double burden causes 90% of chronic distress. Module 4 shows you how to dissolve self-judgment.',
    moduleLink: 'Module 4: Recognition',
  },
  {
    id: 'stuck',
    icon: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z',
    title: 'I feel stuck in patterns',
    sub: 'for years.',
    insightTitle: 'Embodied Emotional Memory',
    insightText: 'Unprocessed emotions become stored energy in the body, repeating the same life scenes. Module 6 provides guided somatic practices to safely release old trapped energy.',
    moduleLink: 'Module 6: Emotional Freedom',
  },
];

// 2. Conditioning Model Steps
const CONDITIONING_MODEL = [
  { step: 1, title: 'Event', sub: 'Something happens', icon: '⚡' },
  { step: 2, title: 'Emotion', sub: 'We feel it deeply', icon: '🌊' },
  { step: 3, title: 'Suppression', sub: 'We push it down', icon: '🔒' },
  { step: 4, title: 'Pattern', sub: 'It repeats', icon: '🔄' },
  { step: 5, title: 'Identity', sub: 'It defines us', icon: '🎭' },
  { step: 6, title: 'Suffering', sub: 'We lose our freedom', icon: '⛈️' },
];

function ConditioningWatercolorIcon({ step }: { step: number }) {
  if (step === 1) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="wc1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ECE2D3" />
            <stop offset="65%" stopColor="#D9C9B4" />
            <stop offset="100%" stopColor="#C2AF98" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#wc1)" />
        <path d="M 16 72 L 44 36 L 64 64 L 78 46 L 90 72 Z" fill="#8C7A6B" opacity="0.65" />
        <path d="M 28 72 L 52 42 L 72 72 Z" fill="#6A594C" opacity="0.8" />
        <ellipse cx="50" cy="64" rx="40" ry="8" fill="#ECE2D3" opacity="0.45" />
      </svg>
    );
  }
  if (step === 2) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="wc2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E9DEC9" />
            <stop offset="65%" stopColor="#D6C5AD" />
            <stop offset="100%" stopColor="#BFAF96" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#wc2)" />
        <path d="M 20 66 C 32 66, 38 46, 52 38 C 64 30, 74 36, 72 46 C 70 54, 60 56, 52 50 C 46 46, 46 40, 50 38" fill="none" stroke="#7A6856" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
        <path d="M 15 72 Q 45 68 85 72" stroke="#8C7B6A" strokeWidth="2.5" fill="none" opacity="0.5" />
      </svg>
    );
  }
  if (step === 3) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="wc3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E2D7C8" />
            <stop offset="65%" stopColor="#CEBFAB" />
            <stop offset="100%" stopColor="#B6A592" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#wc3)" />
        <path d="M 32 38 C 30 32, 40 25, 48 28 C 54 22, 66 24, 70 30 C 76 30, 80 38, 74 42 C 70 45, 32 45, 32 38 Z" fill="#756758" opacity="0.75" />
        <circle cx="50" cy="58" r="14" fill="#5C4E42" opacity="0.85" />
        <rect x="48" y="68" width="4" height="10" fill="#4A3D33" rx="2" />
      </svg>
    );
  }
  if (step === 4) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="wc4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EDE4D5" />
            <stop offset="65%" stopColor="#DBCBBB" />
            <stop offset="100%" stopColor="#C4B29E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#wc4)" />
        <circle cx="50" cy="50" r="26" stroke="#8C7966" strokeWidth="1.5" fill="none" opacity="0.7" />
        <circle cx="40" cy="50" r="18" stroke="#7A6856" strokeWidth="1.2" fill="none" opacity="0.55" />
        <circle cx="60" cy="50" r="18" stroke="#7A6856" strokeWidth="1.2" fill="none" opacity="0.55" />
        <circle cx="50" cy="40" r="18" stroke="#7A6856" strokeWidth="1.2" fill="none" opacity="0.55" />
        <circle cx="50" cy="60" r="18" stroke="#7A6856" strokeWidth="1.2" fill="none" opacity="0.55" />
        <circle cx="50" cy="50" r="5" fill="#8C7966" opacity="0.85" />
      </svg>
    );
  }
  if (step === 5) {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="wc5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E7DCD0" />
            <stop offset="65%" stopColor="#D6C5B3" />
            <stop offset="100%" stopColor="#C0AF9C" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#wc5)" />
        <circle cx="50" cy="38" r="11" fill="#665648" opacity="0.85" />
        <path d="M 28 74 C 28 58, 38 52, 50 52 C 62 52, 72 58, 72 74 Z" fill="#665648" opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
      <defs>
        <radialGradient id="wc6" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DAD0C1" />
          <stop offset="65%" stopColor="#C5B6A4" />
          <stop offset="100%" stopColor="#AA9A88" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#wc6)" />
      <path d="M 20 76 L 50 48 L 80 76 Z" fill="#4D4036" opacity="0.9" />
      <path d="M 30 36 C 26 30, 36 22, 46 25 C 52 18, 68 20, 72 28 C 80 28, 84 38, 76 44 C 70 48, 30 48, 30 36 Z" fill="#3D322A" opacity="0.85" />
    </svg>
  );
}

function SymptomWatercolorIcon({ symptomId }: { symptomId: string }) {
  if (symptomId === 'replay') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="sw1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ECE3D4" />
            <stop offset="70%" stopColor="#DACBBA" />
            <stop offset="100%" stopColor="#C4B29E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#sw1)" />
        <path d="M 50 25 A 25 25 0 1 1 25 50 A 18 18 0 1 1 50 32 A 12 12 0 1 1 38 50" fill="none" stroke="#7A6856" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        <circle cx="50" cy="50" r="4" fill="#7A6856" opacity="0.9" />
      </svg>
    );
  }
  if (symptomId === 'react') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="sw2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EADBCE" />
            <stop offset="70%" stopColor="#D5C3B3" />
            <stop offset="100%" stopColor="#BFAF9D" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#sw2)" />
        <path d="M 32 70 L 32 46 A 18 18 0 0 1 68 46 L 68 70 Z" fill="#665648" opacity="0.8" />
        <path d="M 40 70 L 40 50 A 10 10 0 0 1 60 50 L 60 70 Z" fill="#EADBCE" opacity="0.6" />
      </svg>
    );
  }
  if (symptomId === 'conflict') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="sw3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EAE0D3" />
            <stop offset="70%" stopColor="#D7C9B8" />
            <stop offset="100%" stopColor="#C0B09E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#sw3)" />
        <path d="M 50 30 C 40 45, 30 55, 50 72 C 70 55, 60 45, 50 30 Z" fill="#7A6958" opacity="0.7" />
        <path d="M 50 42 C 44 52, 38 60, 50 70 C 62 60, 56 52, 50 42 Z" fill="#EAE0D3" opacity="0.5" />
      </svg>
    );
  }
  if (symptomId === 'guilt') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="sw4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EBDDD4" />
            <stop offset="70%" stopColor="#D7C6BB" />
            <stop offset="100%" stopColor="#BCAAA0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#sw4)" />
        <path d="M 50 68 C 30 54, 24 38, 36 28 C 44 22, 50 30, 50 30 C 50 30, 56 22, 64 28 C 76 38, 70 54, 50 68 Z" fill="#755B53" opacity="0.8" />
      </svg>
    );
  }
  if (symptomId === 'stuck') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
        <defs>
          <radialGradient id="sw5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ECE3D5" />
            <stop offset="70%" stopColor="#DACBB9" />
            <stop offset="100%" stopColor="#C3B29E" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#sw5)" />
        <circle cx="50" cy="50" r="32" stroke="#7A6856" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="50" cy="50" r="22" stroke="#7A6856" strokeWidth="2" fill="none" strokeDasharray="30 10" opacity="0.7" />
        <circle cx="50" cy="50" r="12" stroke="#7A6856" strokeWidth="2" fill="none" opacity="0.85" />
        <circle cx="50" cy="50" r="4" fill="#7A6856" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ borderRadius: '50%', display: 'block' }}>
      <defs>
        <radialGradient id="sw6" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5EBD9" />
          <stop offset="70%" stopColor="#E6D4B7" />
          <stop offset="100%" stopColor="#D4BF9A" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#sw6)" />
      <path d="M 50 24 L 54 44 L 74 48 L 54 52 L 50 72 L 46 52 L 26 48 L 46 44 Z" fill="#99743D" opacity="0.85" />
    </svg>
  );
}

// 3. 7 Chapters
interface Chapter {
  num: number;
  epLabel: string;
  badgeKicker: string;
  title: string;
  artworkTitle: string;
  desc: string;
  duration: string;
  keyPractice: string;
  bgGradient: string;
  imgUrl: string;
  teaserVideoId?: string;
  teaserStartTime?: number;
}

const CHAPTERS: Chapter[] = [
  {
    num: 1,
    epLabel: 'EP 1',
    badgeKicker: 'BECOME AWARE',
    title: 'What Are Feelings and Emotions?',
    artworkTitle: 'Awareness',
    desc: 'We begin by understanding what feelings and emotions really are — not just in theory, but in how they show up in our everyday lives.',
    duration: 'Available Immediately',
    keyPractice: 'The 5-Minute Presence Anchor',
    bgGradient: 'linear-gradient(135deg, #3D2D1E 0%, #1E150D 100%)',
    imgUrl: FS_ROOT('Episode1.webp'),
    teaserVideoId: 'fTrY9KMLhAo',
  },
  {
    num: 2,
    epLabel: 'EP 2',
    badgeKicker: 'UNDERSTAND CHILDHOOD',
    title: 'How Childhood Shapes Our Emotional Patterns',
    artworkTitle: 'Understand',
    desc: 'We look back at our childhood and explore the programming behind our emotional responses that still run the show today.',
    duration: 'Available Immediately',
    keyPractice: 'Childhood Conditioning Mapping',
    bgGradient: 'linear-gradient(135deg, #382A1B 0%, #1A120B 100%)',
    imgUrl: FS_ROOT('Episode2.webp'),
    teaserVideoId: 'pES3x5XlJF0',
    teaserStartTime: 90,
  },
  {
    num: 3,
    epLabel: 'EP 3',
    badgeKicker: 'RECOGNIZE YOUR TRIGGERS',
    title: 'Why The Past Still Controls Us',
    artworkTitle: 'Recognize',
    desc: "How random triggers — songs, tones, looks — can spark intense reactions from the past that we don't even realize are running us.",
    duration: 'Available Immediately',
    keyPractice: 'Trigger Deconstruction Inquiry',
    bgGradient: 'linear-gradient(135deg, #33281E 0%, #17110B 100%)',
    imgUrl: FS_ROOT('Episode3.webp'),
    // Teaser restored with the live Episode 3 upload. Same id as the in-app
    // lesson, matching how EP1 and EP2 pair up: the teaser plays the full
    // episode and simply stops after 60s via teaserTimer.
    teaserVideoId: 'nAf0fSs8dto',
  },
  {
    num: 4,
    epLabel: 'EP 4',
    badgeKicker: 'SEE YOUR ESCAPES',
    title: 'Why We Keep Avoiding Our Feelings',
    artworkTitle: 'See the Escape',
    desc: 'The ways we escape and avoid — phone scrolling, busyness, over-eating, shopping, alcohol — and why avoidance never truly sets us free.',
    duration: 'Available Immediately',
    keyPractice: 'The Avoidance Audit',
    bgGradient: 'linear-gradient(135deg, #3A2B1D 0%, #1A120A 100%)',
    imgUrl: FS_ROOT('Episode4.webp'),
  },
  {
    num: 5,
    epLabel: 'EP 5',
    badgeKicker: 'SEE YOUR MASKS',
    title: 'Why We Keep Trying to Prove Ourselves',
    artworkTitle: 'See Your Masks',
    desc: "The drive to achieve, people-please, and prove ourselves — and the quiet, bottomless ache that success can't fill.",
    duration: 'Available Immediately',
    keyPractice: 'Mask Dissolution Practice',
    bgGradient: 'linear-gradient(135deg, #352526 0%, #180F10 100%)',
    imgUrl: FS_ROOT('Episode5.webp'),
  },
  {
    num: 6,
    epLabel: 'EP 6',
    badgeKicker: 'SEE YOURSELF CLEARLY',
    title: 'The Emotions We See in Others — And in Ourselves',
    artworkTitle: 'See Yourself Clearly',
    desc: "How we project, judge, and react to emotions in others that are actually the parts of us we can't accept or feel.",
    duration: 'Available Immediately',
    keyPractice: 'Mirror & Projection Clearing',
    bgGradient: 'linear-gradient(135deg, #252D35 0%, #101418 100%)',
    imgUrl: FS_ROOT('Episode6.webp'),
  },
  {
    num: 7,
    epLabel: 'EP 7',
    badgeKicker: 'LET GO',
    title: 'How It Gets Better — And Why Letting It Go Is The Key',
    artworkTitle: 'Let Go',
    desc: 'Why feeling it all the way through brings true healing — and how letting go is the doorway to freedom and lasting peace.',
    duration: 'Available Immediately',
    keyPractice: 'Complete Emotional Surrender',
    bgGradient: 'linear-gradient(135deg, #3B2E1D 0%, #1A130A 100%)',
    imgUrl: FS_ROOT('Episode7.webp'),
  },
];

// (Testimonials removed — they were fabricated people with stock-photo faces.
//  Real, consented testimonials go here when they exist.)

// 5. FAQs
const FAQS = [
  {
    q: 'Who is this course designed for?',
    a: 'This course is for anyone who feels overwhelmed by overthinking, emotional reactivity, anxiety, or recurring relationship patterns. No prior meditation or spiritual experience is required.',
  },
  {
    q: 'How much time do I need to commit each day?',
    a: 'Just 10 to 15 minutes a day. The course is self-paced with short, actionable video lessons and guided micro-practices designed for busy lives.',
  },
  {
    q: 'What if I fall behind or need more time?',
    a: 'You receive lifetime access to all 7 modules, future updates, and guided workbooks. You can complete it in 7 weeks or revisit it over months at your own speed.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes, absolutely. We offer a 100% risk-free 14-day money-back guarantee. If you do not feel a genuine inner shift, simply send an email for a full refund.',
  },
  {
    q: 'How does the Pay-What-You-Feel pricing work?',
    a: 'We believe inner peace should be accessible. You can choose between the standalone Course Only plan (suggested ₹1,499) or the Whole App + Course All-Access Pass (suggested ₹2,499), and adjust the price slider to pay what feels right for your current circumstances.',
  },
];

const REGION_CURRENCY: Record<string, { currency: string; symbol: string; min: number; suggested: number; max: number; strike: number }> = {
  INR: { currency: 'INR', symbol: '₹', min: 99, suggested: 1499, max: 4999, strike: 4999 },
  USD: { currency: 'USD', symbol: '$', min: 2, suggested: 19, max: 59, strike: 59 },
  GBP: { currency: 'GBP', symbol: '£', min: 2, suggested: 15, max: 49, strike: 49 },
  EUR: { currency: 'EUR', symbol: '€', min: 2, suggested: 17, max: 55, strike: 55 },
  CAD: { currency: 'CAD', symbol: 'C$', min: 3, suggested: 24, max: 79, strike: 79 },
  AUD: { currency: 'AUD', symbol: 'A$', min: 3, suggested: 29, max: 89, strike: 89 },
  SGD: { currency: 'SGD', symbol: 'S$', min: 3, suggested: 24, max: 79, strike: 79 },
  AED: { currency: 'AED', symbol: 'AED ', min: 10, suggested: 75, max: 220, strike: 220 },
};

const ALL_ACCESS_REGION_CURRENCY: Record<string, { currency: string; symbol: string; min: number; suggested: number; max: number; strike: number }> = {
  INR: { currency: 'INR', symbol: '₹', min: 499, suggested: 2499, max: 7999, strike: 9998 },
  USD: { currency: 'USD', symbol: '$', min: 9, suggested: 39, max: 99, strike: 119 },
  GBP: { currency: 'GBP', symbol: '£', min: 8, suggested: 29, max: 89, strike: 99 },
  EUR: { currency: 'EUR', symbol: '€', min: 9, suggested: 35, max: 89, strike: 109 },
  CAD: { currency: 'CAD', symbol: 'C$', min: 12, suggested: 49, max: 129, strike: 149 },
  AUD: { currency: 'AUD', symbol: 'A$', min: 14, suggested: 59, max: 139, strike: 169 },
  SGD: { currency: 'SGD', symbol: 'S$', min: 12, suggested: 49, max: 129, strike: 149 },
  AED: { currency: 'AED', symbol: 'AED ', min: 35, suggested: 149, max: 350, strike: 440 },
};

// Country (locale region subtag) → charge currency. Mirrors REGION_TO_CURRENCY in
// EmotionFeelingsCourseView.tsx and the backend's COURSE_PRICES_BY_CURRENCY.
// Anything unlisted bills in USD, which the backend also falls back to.
const REGION_TO_CURRENCY: Record<string, string> = {
  IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', AE: 'AED', SG: 'SGD',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR',
  PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR',
};

function getRegionPricing(isAllAccess = false) {
  const dict = isAllAccess ? ALL_ACCESS_REGION_CURRENCY : REGION_CURRENCY;
  try {
    if (typeof window !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return dict.INR;
      const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
      for (const l of langs) {
        // The region subtag is a country code ('US', 'GB'); these tables are keyed
        // by currency ('USD', 'GBP'), so the two need translating between them.
        const r = (l || '').split('-').pop()?.toUpperCase();
        const cur = r ? REGION_TO_CURRENCY[r] : undefined;
        if (cur && dict[cur]) return dict[cur];
      }
    }
  } catch (_) {}
  return dict.USD;
}

// Card checkout submit button (Razorpay). Pulled out of the JSX below because
// it now needs to render on either side of the PayPal buttons depending on
// currency, rather than being the sole checkout action.
function RazorpaySubmit({ isProcessing }: { isProcessing: boolean }) {
  return (
    <button
      type="submit"
      disabled={isProcessing}
      style={{
        padding: '14px',
        borderRadius: 999,
        cursor: 'pointer',
        background: '#4A3260',
        color: '#fff',
        border: 'none',
        fontFamily: SANS,
        fontSize: 14,
        fontWeight: 800,
        marginTop: 8,
        width: '100%',
      }}
    >
      {isProcessing ? 'Processing...' : 'Pay by Card →'}
    </button>
  );
}




// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function EmotionFeelingsCourse() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;

  const [selectedPlan, setSelectedPlan] = useState<'course' | 'allAccess'>('course');
  const coursePricingConfig = getRegionPricing(false);
  const allAccessPricingConfig = getRegionPricing(true);
  const activePricingConfig = selectedPlan === 'course' ? coursePricingConfig : allAccessPricingConfig;

  const ink     = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub  = isDark ? 'rgba(237,233,227,0.6)' : '#6B5744';
  const cardBg  = isDark ? 'rgba(30,24,18,0.72)' : 'rgba(249,245,239,0.85)';
  const borderC = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(196,181,160,0.35)';

  // Interactive states
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [reflectionInput, setReflectionInput] = useState('');
  const [reflectionResponse, setReflectionResponse] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>('');
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Guest checkout state
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [customAmount, setCustomAmount] = useState<number>(coursePricingConfig.suggested);
  const [guestName, setGuestName] = useState('');
  const [checkoutErr, setCheckoutErr] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(true);

  /** Set once payment is captured. `email` is the address the purchase was
   *  keyed to — the buyer MUST sign in with it for the course to unlock, so
   *  it's shown prominently rather than buried. `wasSignedIn` skips that
   *  instruction entirely, since the grant already landed on their account. */
  const [purchaseSuccess, setPurchaseSuccess] = useState<{ email: string; wasSignedIn: boolean } | null>(null);

  /** How far the bottom of the LAYOUT viewport sits below the bottom of the
   *  VISUAL viewport, in px.
   *
   *  iOS Safari positions `position: fixed` against the layout viewport, which
   *  extends behind the browser's bottom toolbar. That toolbar is hidden while
   *  you scroll down but slides back the instant you scroll up — so a bar
   *  pinned to `bottom: 0` slips behind it and reads as "the button
   *  disappeared when I scrolled up", which is exactly what it did. Offsetting
   *  by this value keeps the bar against the visible edge in both scroll
   *  directions, and also lifts it clear of the on-screen keyboard. */
  const [viewportInset, setViewportInset] = useState(0);
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const sync = () => {
      // Round down: a fractional inset leaves a hairline of page showing under
      // the bar as Safari animates its toolbar.
      setViewportInset(Math.max(0, Math.floor(window.innerHeight - vv.height - vv.offsetTop)));
    };
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, []);

  // 60-Second Teaser State
  const [teaserVideo, setTeaserVideo] = useState<{ id: string; title: string; episodeNum: number; startTime?: number } | null>(null);
  const [teaserTimer, setTeaserTimer] = useState<number>(60);

  const startTeaser = (id: string, title: string, episodeNum: number, startTime?: number) => {
    setTeaserVideo({ id, title, episodeNum, startTime });
    setTeaserTimer(60);
    trackActivity(`TEASER_PLAY_EPISODE_${episodeNum}`);
  };

  useEffect(() => {
    if (!teaserVideo) return;
    const t = setInterval(() => {
      setTeaserTimer((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          // 60s up — return to the main screen (teaser button visible again).
          setTeaserVideo(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [teaserVideo]);

  const { checkOut, isProcessing } = useRazorpay();
  const { renderCheckout: renderPaypalCheckout, renderGooglePay, isProcessing: isPaypalProcessing, isAvailable: isPaypalAvailable, isGooglePayAvailable } = usePaypal();

  // Master SEO + AEO + GEO Schema setup
  usePageSeo({
    title: 'Understanding Feelings & Emotions Course — 7-Episode Guided Journey | SKRM Bliss AI',
    description: 'Break old emotional patterns, dissolve overthinking, and live with clarity, freedom, and ease. A 7-episode guided course by Sim Katyal & Soulful Intelligence Studio.',
    url: 'https://www.skrmblissai.in/feelingsandemotioncourse',
    image: 'https://www.skrmblissai.in/og/course.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Course',
          '@id': 'https://www.skrmblissai.in/feelingsandemotioncourse/#course',
          name: 'Understanding Feelings & Emotions Course — 7-Episode Guided Journey',
          description: 'A 7-episode guided journey from emotional reactivity to inner freedom, emotional regulation, and presence.',
          provider: {
            '@type': 'Organization',
            name: 'Soulful Intelligence Studio',
            sameAs: ['https://www.skrmblissai.in', 'https://www.youtube.com/@SoulfulIntelligenceStudio'],
          },
          instructor: {
            '@type': 'Person',
            name: 'Sim Katyal',
            jobTitle: 'Emotional Intelligence & Presence Guide',
          },
          offers: {
            '@type': 'Offer',
            price: '4999',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: 'https://www.skrmblissai.in/feelingsandemotioncourse',
          },
          hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'Online / Self-Paced',
            instructor: {
              '@type': 'Person',
              name: 'Sim Katyal',
            },
          },
        },
        {
          '@type': 'FAQPage',
          '@id': 'https://www.skrmblissai.in/feelingsandemotioncourse/#faq',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        },
        {
          '@type': 'VideoObject',
          '@id': 'https://www.skrmblissai.in/feelingsandemotioncourse/#video-ep1',
          name: 'What Are Feelings and Emotions? — Episode 1',
          description: 'Explore the fundamental difference between physical feelings and mental emotional conditioning in Episode 1 of the Feelings & Emotions series.',
          thumbnailUrl: 'https://img.youtube.com/vi/fTrY9KMLhAo/maxresdefault.jpg',
          embedUrl: 'https://www.youtube.com/embed/fTrY9KMLhAo',
          uploadDate: '2026-01-01T00:00:00Z',
        },
      ],
    },
  });

  useEffect(() => {
    trackActivity('PAGE_VISIT_COURSE_PAGE');

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll<HTMLElement>('.si-reveal').forEach((el) => {
        el.classList.add('si-visible');
      });
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('si-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll<HTMLElement>('.si-reveal').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) {
        io.observe(el);
      } else {
        el.classList.add('si-visible');
      }
    });

    return () => io.disconnect();
  }, []);

  // Reflection helper
  const handleReflect = () => {
    if (!reflectionInput.trim()) return;
    const lower = reflectionInput.toLowerCase();
    let aff = 'Whatever you are feeling right now is completely valid. Notice where this sensation lives in your body, breathe into it, and allow it to just be.';
    if (lower.includes('anxiety') || lower.includes('anxious') || lower.includes('fear')) {
      aff = 'Anxiety is your nervous system seeking safety. Take a deep breath. Right now, in this moment, you are safe.';
    } else if (lower.includes('anger') || lower.includes('angry') || lower.includes('frustrated')) {
      aff = 'Anger carries important boundary energy. Acknowledge the feeling without taking action from it. Let it pass through like weather.';
    } else if (lower.includes('sad') || lower.includes('heavy') || lower.includes('grief')) {
      aff = 'Sadness is the heart releasing what it no longer needs to carry. Give yourself permission to feel it gently.';
    }
    setReflectionResponse(aff);
  };

  // Trigger Razorpay Checkout
  const handleStartCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.includes('@')) {
      setCheckoutErr('Please enter a valid email address.');
      return;
    }
    if (!guestName.trim()) {
      setCheckoutErr('Please enter your name.');
      return;
    }
    if (!agreeTerms) {
      setCheckoutErr('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setCheckoutErr('');
    const signedInUid = getAuth().currentUser?.uid;
    const userId = signedInUid || 'guest_pending';
    const paidEmail = guestEmail.trim();

    checkOut(
      userId,
      paidEmail,
      guestName.trim(),
      'emotion_feelings_course',
      // Charge in the same currency the slider quoted. Hardcoding INR here billed
      // every overseas buyer in rupees — the amount got clamped to the ₹99 floor
      // and Razorpay's risk engine declined foreign cards on the currency mismatch.
      activePricingConfig.currency,
      () => {
        setShowCheckoutModal(false);
        // A guest purchase is stored server-side under guestPurchases/{email}
        // and only merges into an account when someone signs in with that SAME
        // address (onUserCreated / linkGuestPurchases). Leave that hint where
        // the Mind Gym sign-in screen can surface it — localStorage rather than
        // a query param, so the address never travels in a URL.
        if (!signedInUid && paidEmail) {
          try { localStorage.setItem('pendingCourseClaimEmail', paidEmail.toLowerCase()); } catch { /* private mode */ }
        }
        setPurchaseSuccess({ email: paidEmail, wasSignedIn: Boolean(signedInUid) });
        trackActivity('COURSE_PURCHASED_SUCCESS', `Amount: ${activePricingConfig.symbol}${customAmount}`, paidEmail);
      },
      guestPhone.trim(),
      customAmount
    );
  };

  // Re-render the PayPal Buttons whenever the checkout inputs they close over
  // change, so a stale amount/email/currency never gets submitted. We always
  // render the container (keeping the card button visible at all times) and use
  // CSS visibility to hide/show it — this avoids the jarring swap where the
  // card button disappears the moment the buyer types a valid email character.
  //
  // A complete email requires both '@' and a '.' after the '@' — e.g. "a@b.c".
  const isPaypalFormReady =
    guestName.trim().length > 0 &&
    guestEmail.includes('@') &&
    guestEmail.split('@')[1]?.includes('.') &&
    agreeTerms;

  useEffect(() => {
    if (!showCheckoutModal) return;
    if (!isPaypalFormReady) return;
    const signedInUid = getAuth().currentUser?.uid;
    const userId = signedInUid || 'guest_pending';
    const paidEmail = guestEmail.trim();

    // Debounced: these deps include the text inputs, so re-rendering the
    // buttons synchronously meant one full create/render cycle per keystroke
    // while the buyer was still typing their email.
    const timer = setTimeout(() => {
      renderPaypalCheckout(
        'paypal-button-container',
        userId,
        paidEmail,
        'emotion_feelings_course',
        activePricingConfig.currency,
        () => {
          setShowCheckoutModal(false);
          if (!signedInUid && paidEmail) {
            try { localStorage.setItem('pendingCourseClaimEmail', paidEmail.toLowerCase()); } catch { /* private mode */ }
          }
          setPurchaseSuccess({ email: paidEmail, wasSignedIn: Boolean(signedInUid) });
          trackActivity('COURSE_PURCHASED_SUCCESS', `Amount: ${activePricingConfig.symbol}${customAmount}`, paidEmail);
        },
        guestPhone.trim(),
        customAmount
      );
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckoutModal, isPaypalFormReady, guestName, guestEmail, guestPhone, customAmount, activePricingConfig.currency]);

  // Google Pay — re-render alongside PayPal whenever the form inputs change.
  // Uses the same isPaypalFormReady gate so the button only appears after a
  // valid name + full email, and shares the same 500ms debounce pattern.
  useEffect(() => {
    if (!showCheckoutModal) return;
    if (!isPaypalFormReady) return;
    const signedInUid = getAuth().currentUser?.uid;
    const userId = signedInUid || 'guest_pending';
    const paidEmail = guestEmail.trim();
    const timer = setTimeout(() => {
      renderGooglePay(
        'googlepay-button-container',
        userId,
        paidEmail,
        'emotion_feelings_course',
        activePricingConfig.currency,
        () => {
          setShowCheckoutModal(false);
          if (!signedInUid && paidEmail) {
            try { localStorage.setItem('pendingCourseClaimEmail', paidEmail.toLowerCase()); } catch { /* private mode */ }
          }
          setPurchaseSuccess({ email: paidEmail, wasSignedIn: Boolean(signedInUid) });
          trackActivity('COURSE_PURCHASED_SUCCESS', `Amount: ${activePricingConfig.symbol}${customAmount}`, paidEmail);
        },
        guestPhone.trim(),
        customAmount
      );
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCheckoutModal, isPaypalFormReady, guestName, guestEmail, guestPhone, customAmount, activePricingConfig.currency]);

  /** Hand off to the app. Full page load, not a router push — Mind Gym is a
   *  separate entry point and needs a fresh auth/entitlement bootstrap. */
  const goToMindGym = () => { window.location.href = '/mindgym'; };

  return (
    <div
      style={{
        background: isDark ? '#0D0A12' : '#F9F5EF',
        color: ink,
        fontFamily: SANS,
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Fixed Sacred Geometry & Cursor Glow ───────────────────────────── */}
      <SacredGeometry isDark={isDark} />
      <CursorGlow />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <SiteHeader
          palette={palette}
          onToggleTheme={toggleTheme}
          links={[
            { label: 'Home', href: '/' },
            { label: 'Overview', href: '#overview' },
            { label: 'Course Journey', href: '#journey' },
            { label: 'What’s Included', href: '#whats-included' },
            { label: 'About the Guide', href: '#about-the-guide' },
            { label: 'Why it works', href: '#stories' },
            { label: 'FAQ', href: '#faq' },
          ]}
          cta={{
            label: 'Join the Course',
            href: '#pricing',
            onClick: () => setShowCheckoutModal(true),
          }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          1. HERO SECTION (Full-Bleed End-to-End)
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="overview"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 'clamp(620px, 90vh, 920px)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        {/* Full-Bleed Background Image (Flipped horizontally so Sim is on the right, un-overlapped) */}
        <img
          src={HERO_PORTRAIT}
          alt="Person in peaceful meditation bathed in warm sunlight"
          fetchPriority="high"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '28% center',
            transform: 'scaleX(-1)',
            opacity: 0.82,
            display: 'block',
          }}
        />

        {/* Gradient Scrim Overlay for Readability */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(90deg, #0D0A12 0%, rgba(13,10,18,0.96) 38%, rgba(13,10,18,0.65) 58%, rgba(13,10,18,0.1) 82%, transparent 100%)'
              : 'linear-gradient(90deg, #F9F5EF 0%, rgba(249,245,239,0.96) 38%, rgba(249,245,239,0.65) 58%, rgba(249,245,239,0.1) 82%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Background HeroMark watermark graphic */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '20%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            opacity: isDark ? 0.35 : 0.22,
            pointerEvents: 'none',
          }}
        >
          <HeroMark palette={palette} size={540} />
        </div>

        {/* Overlaid Text Content Container (Kept on Left 45% so Sim remains 100% visible on right) */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: 1240,
            margin: '0 auto',
            padding: 'clamp(64px, 10vw, 120px) clamp(24px, 6vw, 96px)',
          }}
        >
          <div style={{ maxWidth: 510 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: isDark ? 'rgba(196,145,58,0.15)' : 'rgba(196,145,58,0.1)',
                border: '1px solid rgba(196,145,58,0.25)',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isDark ? '#C4913A' : '#7A5F44',
                marginBottom: 24,
              }}
            >
              <Sparkles size={13} /> Soulful Intelligence Studio · 7-Week Guided Journey
            </div>

            <h1
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(42px, 5.2vw, 74px)',
                fontWeight: 400,
                lineHeight: 1.08,
                color: ink,
                margin: '0 0 16px',
                letterSpacing: '-0.01em',
              }}
            >
              You weren't taught how emotions work.
              <em style={{ fontStyle: 'italic', display: 'block', color: isDark ? '#C4913A' : '#6B5744', marginTop: 4, fontWeight: 500 }}>
                That's why you keep fighting yourself.
              </em>
            </h1>

            <p
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                lineHeight: 1.6,
                color: inkSub,
                margin: '0 0 36px',
                maxWidth: 480,
              }}
            >
              This course will help you understand your inner world, break old patterns, and live with clarity, freedom and ease.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setActiveVideoUrl('https://www.youtube.com/embed/nbyToUpT1_8?autoplay=1&rel=0');
                  setShowVideoModal(true);
                }}
                className="si-btn-breathe"
                style={{
                  padding: '15px 32px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  background: '#4A3260',
                  color: '#fff',
                  border: 'none',
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 30px rgba(74,50,96,0.3)',
                }}
              >
                <Play size={16} fill="#fff" /> Watch the Course Intro (1 min)
              </button>

              <a
                href="#guide"
                style={{
                  padding: '15px 24px',
                  borderRadius: 999,
                  color: inkSub,
                  textDecoration: 'none',
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'color 0.2s ease',
                }}
              >
                Read the overview <ChevronDown size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Floating Watch Intro Badge — duplicates the "Watch the Course
            Intro" button already in the text column (same onClick). Fine on
            desktop where it floats clear in the empty right side of the
            hero; on mobile the text column runs the full width and height,
            so this fixed bottom/right offset landed directly on top of the
            "Read the overview" link. Hidden below 860px rather than
            repositioned, since the primary CTA already covers the action. */}
        <button
          className="si-hero-preview-badge"
          onClick={() => {
            setActiveVideoUrl('https://www.youtube.com/embed/nbyToUpT1_8?autoplay=1&rel=0');
            setShowVideoModal(true);
          }}
          style={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 20px',
            borderRadius: 999,
            background: isDark ? 'rgba(20,16,24,0.85)' : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${borderC}`,
            cursor: 'pointer',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#4A3260',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={16} fill="#fff" style={{ marginLeft: 2 }} />
          </span>
          <div style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: isDark ? '#C4913A' : '#7A5F44' }}>
              Preview
            </span>
            <span style={{ display: 'block', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink }}>
              Watch Course Intro
            </span>
          </div>
        </button>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          MEET YOUR GUIDE — SIM KATYAL
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="guide"
        className="si-reveal"
        style={{
          padding: 'clamp(80px, 11vw, 130px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
          background: isDark
            ? 'linear-gradient(180deg, rgba(20,15,26,0.6) 0%, rgba(13,10,18,0.92) 100%)'
            : 'linear-gradient(180deg, rgba(246,240,230,0.7) 0%, rgba(254,251,246,0.95) 100%)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(36px, 6vw, 72px)',
            flexWrap: 'wrap',
          }}
        >
          {/* Animated Portrait Card Container */}
          <div style={{ flex: '1 1 340px', maxWidth: 450, position: 'relative' }}>
            {/* Glowing Golden Aura Backlight */}
            <motion.div
              animate={{
                scale: [0.96, 1.04, 0.96],
                opacity: isDark ? [0.25, 0.45, 0.25] : [0.15, 0.3, 0.15],
              }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: 40,
                background: 'radial-gradient(circle, rgba(196,145,58,0.4) 0%, rgba(74,50,96,0.2) 60%, transparent 80%)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />

            {/* Floating Glass Frame */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              whileHover={{ scale: 1.02, rotate: -0.5 }}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 5',
                borderRadius: 32,
                overflow: 'hidden',
                boxShadow: isDark
                  ? '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(196,145,58,0.15)'
                  : '0 24px 60px rgba(74,50,96,0.15), 0 0 30px rgba(196,145,58,0.2)',
                border: '1.5px solid rgba(196,145,58,0.35)',
                background: isDark ? '#14101A' : '#FAF6F0',
              }}
            >
              <img
                src={SIM_PROFILE}
                alt="Sim Katyal - Creator & Lead Guide"
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)',
                }}
              />

              {/* Subtle Gradient Vignette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(13,10,18,0.08) 0%, rgba(13,10,18,0.2) 50%, rgba(13,10,18,0.85) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Floating Glass Tag & Name Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 24,
                  left: 20,
                  right: 20,
                  padding: '16px 20px',
                  borderRadius: 20,
                  background: 'rgba(19, 14, 25, 0.75)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(196,145,58,0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#FFDF9E',
                        boxShadow: '0 0 10px #FFDF9E',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.18em',
                        color: '#FFDF9E',
                        textTransform: 'uppercase',
                      }}
                    >
                      CREATOR & LEAD GUIDE
                    </span>
                  </div>
                  {/* h2, not h3: this is the first heading after the page h1, so
                      an h3 here skipped a level and broke the outline for screen
                      reader users. letterSpacing is pinned to normal because the
                      base h2 rule adds tracking that h3 does not — without it the
                      tag change would visibly alter the spacing. */}
                  <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: '#EDE9E3', margin: 0, lineHeight: 1.1, letterSpacing: 'normal' }}>
                    Sim Katyal
                  </h2>
                </div>

                {/* Micro Lotus Graphic */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'rgba(196,145,58,0.18)',
                    border: '1px solid rgba(196,145,58,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFDF9E',
                  }}
                >
                  <Sparkles size={18} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Guide Bio & Video Button */}
          <div style={{ flex: '1.2 1 400px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                background: isDark ? 'rgba(196,145,58,0.15)' : 'rgba(196,145,58,0.1)',
                border: '1px solid rgba(196,145,58,0.3)',
                fontFamily: SANS,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: isDark ? '#C4913A' : '#7A5F44',
                marginBottom: 18,
              }}
            >
              <Sparkles size={12} /> MEET YOUR GUIDE
            </span>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 400, color: ink, margin: '0 0 20px', lineHeight: 1.15 }}>
              A compassionate space to feel, understand, and set yourself free.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7, color: inkSub, margin: '0 0 16px' }}>
              For over a decade, Sim Katyal has guided thousands of individuals through the quiet, inner architecture of human emotion — helping people move from reactive emotional patterns into conscious presence and effortless ease.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: inkSub, margin: '0 0 32px', fontStyle: 'italic', fontWeight: 500, borderLeft: '2.5px solid #C4913A', paddingLeft: 16 }}>
              "True emotional freedom doesn't come from forcing yourself to be happy or pushing feelings down. It comes when you learn the art of witnessing — seeing yourself clearly without judgment."
            </p>

            {/* Animated Play Sim Intro Video Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveVideoUrl('https://www.youtube.com/embed/0LoCdi1YLe0?autoplay=1&rel=0');
                setShowVideoModal(true);
              }}
              className="si-btn-breathe"
              style={{
                padding: '16px 36px',
                borderRadius: 999,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #4A3260 0%, #362248 100%)',
                color: '#fff',
                border: 'none',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 10px 32px rgba(74,50,96,0.35)',
              }}
            >
              <Play size={18} fill="#fff" /> Watch Sim's Personal Welcome (1 min)
            </motion.button>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          2. DOES THIS SOUND FAMILIAR? (5 Symptoms)
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="symptoms"
        className="si-reveal"
        style={{
          padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="si-section-head" style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 14 }}>
            Recognize Yourself
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.8vw, 48px)', fontWeight: 400, color: ink, marginBottom: 8 }}>
            Does this sound familiar?
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: inkSub }}>
            You're not alone. You're human.
          </p>
        </div>

        {/* Grid of 5 Cards + Note Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            maxWidth: 1100,
            margin: '0 auto 32px',
          }}
        >
          {SYMPTOMS.map((s) => {
            const isSelected = selectedSymptom === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSymptom(isSelected ? null : s.id)}
                style={{
                  background: isSelected
                    ? (isDark ? 'rgba(74,50,96,0.35)' : 'rgba(74,50,96,0.12)')
                    : (isDark ? 'linear-gradient(145deg, rgba(38,30,22,0.85) 0%, rgba(24,18,14,0.9) 100%)' : 'linear-gradient(145deg, rgba(255,252,247,0.95) 0%, rgba(248,242,233,0.9) 100%)'),
                  border: `1.5px solid ${isSelected ? '#C4913A' : (isDark ? 'rgba(196,145,58,0.25)' : 'rgba(196,181,160,0.5)')}`,
                  borderRadius: 22,
                  padding: '28px 18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: isSelected ? '0 12px 32px rgba(196,145,58,0.25)' : '0 8px 24px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    boxShadow: isSelected ? '0 8px 24px rgba(196,145,58,0.35)' : '0 6px 18px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    border: `1.5px solid ${isSelected ? '#C4913A' : 'rgba(196,145,58,0.3)'}`,
                  }}
                >
                  <SymptomWatercolorIcon symptomId={s.id} />
                </div>

                <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, color: ink, margin: '0 0 6px', lineHeight: 1.25 }}>
                  "{s.title}"
                </p>
                <p style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, margin: '0 0 14px', lineHeight: 1.35 }}>
                  {s.sub}
                </p>

                {/* Click Me Interactive Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 14px',
                    borderRadius: 999,
                    background: isSelected
                      ? 'linear-gradient(135deg, #4A3260 0%, #362248 100%)'
                      : (isDark ? 'rgba(196,145,58,0.14)' : 'rgba(196,145,58,0.1)'),
                    border: `1px solid ${isSelected ? '#C4913A' : 'rgba(196,145,58,0.35)'}`,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isSelected ? '#FFDF9E' : (isDark ? '#C4913A' : '#7A5F44'),
                    boxShadow: isSelected ? '0 4px 14px rgba(74,50,96,0.3)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Sparkles size={11} /> {isSelected ? 'Exploring' : 'Tap to explore'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Insight Reveal Panel */}
        <AnimatePresence>
          {selectedSymptom && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 12 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ maxWidth: 760, margin: '0 auto', overflow: 'hidden' }}
            >
              {(() => {
                const s = SYMPTOMS.find((item) => item.id === selectedSymptom);
                if (!s) return null;
                return (
                  <div
                    style={{
                      background: isDark ? 'rgba(74,50,96,0.18)' : 'rgba(74,50,96,0.06)',
                      border: '1px solid rgba(74,50,96,0.25)',
                      borderRadius: 24,
                      padding: '28px 36px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#8B6A1A' }}>
                        {s.moduleLink}
                      </span>
                      <button
                        onClick={() => setSelectedSymptom(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkSub }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, color: ink, margin: 0 }}>
                      {s.insightTitle}
                    </h3>
                    <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: inkSub, margin: 0 }}>
                      {s.insightText}
                    </p>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          2b. WHERE DO YOU FEEL IT — body-emotion map (from the journal)
         ════════════════════════════════════════════════════════════════════ */}
      <BodyMapShowcase isDark={isDark} />

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          3. WHY EMOTIONS WORK THIS WAY (Conditioning Model)
         ════════════════════════════════════════════════════════════════════ */}
      <section
        className="si-reveal"
        style={{
          padding: 'clamp(64px, 8vw, 96px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(24px, 4vw, 48px)',
            flexWrap: 'wrap',
          }}
        >
          {/* Left Column: Heading + Subhead + Button */}
          <div style={{ flex: '1 1 280px', maxWidth: 340 }}>
            <h2
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(32px, 3.8vw, 48px)',
                fontWeight: 400,
                lineHeight: 1.15,
                color: ink,
                margin: '0 0 16px',
                letterSpacing: '-0.01em',
              }}
            >
              Why emotions work<br />this way
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 15, color: inkSub, lineHeight: 1.5, margin: '0 0 28px' }}>
              We're not broken.<br />We're just conditioned.
            </p>
            <a
              href="#journey"
              className="si-btn-breathe"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 26px',
                borderRadius: 999,
                background: '#4A3260',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: SANS,
                fontSize: 13.5,
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(74,50,96,0.25)',
              }}
            >
              Learn the simple model
            </a>
          </div>

          {/* Right Column: 6 Watercolor Circle Steps Flow */}
          <div
            style={{
              flex: '3 1 600px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
              gap: 12,
              alignItems: 'start',
            }}
          >
            {CONDITIONING_MODEL.map((m, idx) => (
              <div key={m.step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: '50%',
                      margin: '0 auto 12px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <ConditioningWatercolorIcon step={m.step} />
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: ink, margin: '0 0 2px' }}>
                    {m.title}
                  </p>
                  <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: 0, lineHeight: 1.3 }}>
                    {m.sub}
                  </p>
                </div>
                {idx < CONDITIONING_MODEL.length - 1 && (
                  <span style={{ fontSize: 16, color: inkSub, opacity: 0.4, marginTop: -32 }} className="si-hide-sm">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          4. THE 7-STEP JOURNEY FROM REACTING TO FREEDOM (Course Chapters)
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="journey"
        className="si-reveal"
        style={{
          padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Centered Header */}
        <div className="si-section-head" style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(32px, 4.2vw, 54px)', fontWeight: 400, color: ink, margin: '0 0 12px' }}>
            The 7-step journey from reacting to freedom
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 15, color: inkSub, margin: 0 }}>
            A structured path. <strong>Deep inner shifts.</strong> Lasting transformation.
          </p>
        </div>

        {/* 7-Step Horizontal Flow Timeline Track (Exact Mockup Match) */}
        <div style={{ maxWidth: 1240, margin: '0 auto 64px', position: 'relative' }}>
          {/* Connecting Horizontal Line */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '5%',
              right: '5%',
              height: 1.5,
              background: isDark ? 'rgba(196,145,58,0.3)' : 'rgba(196,145,58,0.25)',
              zIndex: 1,
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 16,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {CHAPTERS.map((ch) => (
              <div
                key={ch.num}
                onClick={() => setSelectedChapter(selectedChapter === ch.num ? null : ch.num)}
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Step Number Circle Node */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: selectedChapter === ch.num ? '#4A3260' : isDark ? '#1C1524' : '#FFFDF9',
                    border: `1.5px solid ${selectedChapter === ch.num ? '#C4913A' : borderC}`,
                    color: selectedChapter === ch.num ? '#FFF' : ink,
                    fontFamily: SERIF,
                    fontSize: 16,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {ch.num}
                </div>

                {/* Step Thumbnail Card */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 4.8',
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginBottom: 14,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: `1.5px solid ${selectedChapter === ch.num ? '#C4913A' : 'transparent'}`,
                  }}
                >
                  <img
                    src={ch.imgUrl}
                    alt={`Step ${ch.num} - ${ch.artworkTitle}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.45) 100%)',
                    }}
                  />
                </div>

                {/* Step Title & Description (Direct 1-to-1 match with Vertical Cards below) */}
                <h4 style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: ink, margin: '0 0 4px' }}>
                  {ch.artworkTitle}
                </h4>
                <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: 0, lineHeight: 1.3 }}>
                  {ch.badgeKicker}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Episode Drawer (Opens when user clicks any of the 7 steps) */}
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 48 }}>
          {CHAPTERS.map((ch, idx) => {
            const isEven = idx % 2 === 0;
            const isOpen = selectedChapter === ch.num;

            // Artwork Card Component
            const ImageCard = (
              <div
                style={{
                  flex: 1,
                  minWidth: 260,
                  minHeight: 280,
                  borderRadius: 24,
                  background: ch.bgGradient,
                  border: `1px solid ${borderC}`,
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                }}
              >
                {/* Real Episode WebP Artwork Image */}
                <img
                  src={ch.imgUrl}
                  alt={`Episode ${ch.num} — ${ch.title}`}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'transform 0.8s ease',
                  }}
                />
              </div>
            );

            // Text Content Component
            const TextBlock = (
              <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 8 }}>
                  {ch.badgeKicker}
                </p>
                <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(24px, 2.8vw, 32px)', fontWeight: 400, color: ink, margin: '0 0 12px', lineHeight: 1.25 }}>
                  {ch.title}
                </h3>
                <div style={{ width: 40, height: 1.5, background: borderC, marginBottom: 16 }} />
                <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.65, color: inkSub, margin: '0 0 20px' }}>
                  {ch.desc}
                </p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {ch.teaserVideoId && (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startTeaser(ch.teaserVideoId!, ch.title, ch.num, ch.teaserStartTime)}
                      style={{
                        padding: '9px 20px',
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, #4A3260 0%, #362248 100%)',
                        color: '#fff',
                        border: '1px solid #C4913A',
                        fontFamily: SANS,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 6px 20px rgba(74,50,96,0.3)',
                      }}
                    >
                      <Play size={14} fill="#fff" /> Watch 60s Free Teaser
                    </motion.button>
                  )}

                  <button
                    onClick={() => setSelectedChapter(isOpen ? null : ch.num)}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 18px',
                      borderRadius: 999,
                      background: isOpen ? (isDark ? 'rgba(74,50,96,0.3)' : '#4A3260') : 'transparent',
                      color: isOpen ? '#fff' : ink,
                      border: `1px solid ${borderC}`,
                      fontFamily: SANS,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {isOpen ? 'Close Practice' : '✨ View Practice & Prompt'}
                  </button>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginTop: 14 }}
                    >
                      <div style={{ padding: 14, borderRadius: 14, background: isDark ? 'rgba(196,145,58,0.1)' : 'rgba(196,145,58,0.06)', border: '1px solid rgba(196,145,58,0.25)', fontSize: 12.5, fontFamily: SANS, color: ink }}>
                        <span style={{ fontWeight: 800, color: isDark ? '#C4913A' : '#7A5F44', display: 'block', marginBottom: 4 }}>
                          Guided Practice: {ch.keyPractice}
                        </span>
                        Watch the lesson and complete the reflection workbook inside your Mind Gym account.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );

            return (
              <div key={ch.num} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isEven ? 'row' : 'row-reverse',
                    gap: 'clamp(24px, 5vw, 64px)',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {isEven ? (
                    <>
                      {ImageCard}
                      {TextBlock}
                    </>
                  ) : (
                    <>
                      {TextBlock}
                      {ImageCard}
                    </>
                  )}
                </div>

                {/* Dotted Vertical Connector Arrow */}
                {idx < CHAPTERS.length - 1 && (
                  <div style={{ textAlign: 'center', color: borderC, fontSize: 18, margin: '-16px 0 -16px' }}>
                    <span style={{ display: 'block', letterSpacing: 4, opacity: 0.5 }}>┊</span>
                    <span style={{ color: isDark ? '#C4913A' : '#7A5F44', opacity: 0.6, fontSize: 14 }}>↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          5. TRY THE METHOD (Interactive 90-Second Practice)
         ════════════════════════════════════════════════════════════════════ */}
      <section
        className="si-reveal"
        style={{
          padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
          background: isDark ? 'rgba(12,9,16,0.4)' : 'rgba(240,232,220,0.35)',
        }}
      >
        <div
          className="si-split-grid"
          style={{
            maxWidth: 980,
            margin: '0 auto',
            display: 'grid',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center',
          }}
        >
          {/* Left Image */}
          <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(60,40,20,0.12)', aspectRatio: '4/3' }}>
            <img
              src={JOURNAL_IMG}
              alt="Open reflection journal with dried flowers and tea candle"
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Right Form */}
          <div>
            <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 14 }}>
              Interactive Micro-Practice
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 400, color: ink, marginBottom: 12 }}>
              Try the method
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14, color: inkSub, marginBottom: 28, lineHeight: 1.6 }}>
              Experience a powerful 90-second practice from the course.<br />
              <strong>Understand. Reflect. Shift.</strong>
            </p>

            <AnimatePresence mode="wait">
              {!reflectionResponse ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <textarea
                    className="si-reflect-input"
                    rows={2}
                    placeholder="Write what you're feeling right now..."
                    value={reflectionInput}
                    onChange={(e) => setReflectionInput(e.target.value)}
                    aria-label="Write what you're feeling right now"
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, flexWrap: 'wrap', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: inkSub, fontWeight: 600 }}>
                      <span>🔒 Private</span>
                      <span>✓ Free</span>
                      <span>⊘ No signup</span>
                      <span>✨ Just for you</span>
                    </div>

                    <button
                      onClick={handleReflect}
                      disabled={!reflectionInput.trim()}
                      style={{
                        padding: '12px 28px',
                        borderRadius: 999,
                        cursor: reflectionInput.trim() ? 'pointer' : 'default',
                        background: reflectionInput.trim() ? '#4A3260' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,40,20,0.08)'),
                        color: reflectionInput.trim() ? '#fff' : inkSub,
                        border: 'none',
                        fontFamily: SANS,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Begin Reflection
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="resp"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    padding: '28px 32px',
                    borderRadius: 20,
                    background: isDark ? 'rgba(196,145,58,0.08)' : 'rgba(196,145,58,0.06)',
                    border: '1px solid rgba(196,145,58,0.25)',
                  }}
                >
                  <p style={{ fontFamily: SERIF, fontSize: 19, fontStyle: 'italic', fontWeight: 500, color: isDark ? '#EDE9E3' : '#4A3C2E', margin: '0 0 20px', lineHeight: 1.6 }}>
                    "{reflectionResponse}"
                  </p>
                  <button
                    onClick={() => { setReflectionInput(''); setReflectionResponse(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 12, color: inkSub, textDecoration: 'underline', padding: 0 }}
                  >
                    Try another feeling →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          5b. ABOUT THE GUIDE (Sim Katyal)
         ════════════════════════════════════════════════════════════════════ */}
      {/* NOT id="guide": the "MEET YOUR GUIDE" section above already owns that
          id, and the hero's "Read the overview" CTA links to it. Two elements
          sharing an id is invalid, and getElementById resolves to the FIRST —
          so the header's "About the Guide" item silently jumped to the short
          blurb near the top instead of landing here. */}
      <section
        id="about-the-guide"
        className="si-reveal"
        style={{
          padding: 'clamp(64px, 8vw, 96px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
          background: isDark ? 'rgba(74,50,96,0.12)' : 'rgba(74,50,96,0.03)',
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div
              style={{
                width: 'clamp(200px, 24vw, 280px)',
                height: 'clamp(200px, 24vw, 280px)',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto',
                border: '3px solid #C4913A',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2), 0 0 30px rgba(196,145,58,0.25)',
              }}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2FSimWriting.png?alt=media"
                alt="Sim Katyal — Presence & Awareness Guide"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          <div>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44' }}>
              About the Guide
            </span>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 400, color: ink, margin: '8px 0 16px', lineHeight: 1.2 }}>
              Guided by Sim Katyal
            </h2>
            <p style={{ fontFamily: SERIF, fontSize: 18, fontStyle: 'italic', color: isDark ? '#EDE9E3' : '#4A3C2E', margin: '0 0 20px', lineHeight: 1.5 }}>
              "From struggle to stillness — a life lived from the inside out."
            </p>
            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.7, color: inkSub, margin: '0 0 24px' }}>
              Sim is a Presence &amp; Awareness Guide and co-founder of Soulful Intelligence Studio. Having spent years walking the path of inner transformation, she created this course to share simple, grounded somatic practices that help you quiet overthinking, release emotional blockages, and live in deep presence.
            </p>
            <a
              href="/twinsouls"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 999,
                border: `1px solid ${borderC}`,
                color: ink,
                textDecoration: 'none',
                fontFamily: SANS,
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              Learn More About Twin Souls →
            </a>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          6. TESTIMONIALS & STATS GRID
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="stories"
        className="si-reveal"
        style={{
          padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 48px' }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 14 }}>
            Honest &amp; grounded
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.8vw, 48px)', fontWeight: 400, color: ink, marginBottom: 12 }}>
            Real practice — not hype.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: inkSub, margin: 0 }}>
            No inflated numbers, no borrowed quotes. This course is built on lived experience and the
            teachings that genuinely helped — and you can watch the first lessons free before you decide.
          </p>
        </div>

        {/* Honest facts about the course — every figure here is true.
            auto-fit with a 180px floor meant a single column on phone width
            (375 < 2×180), so four tall cards stacked into a long scroll.
            si-stat-grid forces two-up on mobile, with smaller padding/type
            to match — desktop keeps the original auto-fit behavior. */}
        <div
          className="si-stat-grid"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {[
            { value: '7', label: 'Episodes, released weekly' },
            { value: 'Free', label: 'First lessons to watch' },
            { value: '15-day', label: 'Money-back guarantee' },
            { value: 'Yours', label: 'Pay what you feel' },
          ].map((s, i) => (
            <div
              key={i}
              className="si-stat-card"
              style={{
                background: isDark ? 'rgba(74,50,96,0.18)' : 'rgba(74,50,96,0.06)',
                border: '1px solid rgba(74,50,96,0.25)',
                borderRadius: 18,
                padding: '26px 20px',
                textAlign: 'center',
              }}
            >
              <p className="si-stat-value" style={{ fontFamily: SERIF, fontSize: 'clamp(26px,3vw,34px)', fontWeight: 500, color: isDark ? '#C4913A' : '#4A3260', margin: '0 0 6px' }}>
                {s.value}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: inkSub, margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          7. WHAT'S INCLUDED & PRICING SECTION
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="whats-included"
        className="si-reveal"
        style={{
          padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          id="pricing"
          className="si-pricing-grid"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gap: 20,
            alignItems: 'stretch',
          }}
        >
          {/* Left Column: What's included */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderC}`,
              borderRadius: 28,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: ink, margin: '0 0 20px' }}>
                What's included
              </h3>

              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { title: '7 in-depth modules', sub: 'Follow the complete transformation journey' },
                  { title: '20+ video lessons', sub: 'Clear, practical and easy to apply' },
                  { title: 'Guided practices & meditations', sub: 'Tools to shift your inner world' },
                  { title: 'Workbooks & journals', sub: 'For deep reflection and clarity' },
                  { title: 'Lifetime access', sub: 'Learn at your own pace, anytime' },
                  { title: 'Private community', sub: 'Connect, share and grow together' },
                  { title: 'Regular updates', sub: 'New content, meditations and practices' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(196,145,58,0.15)', color: isDark ? '#C4913A' : '#8B6A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, margin: 0 }}>{item.title}</p>
                      <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: 0 }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Dark Purple Pricing Card */}
          <div
            style={{
              background: '#1E1426',
              border: '1px solid rgba(196,145,58,0.3)',
              borderRadius: 28,
              padding: '36px 32px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              {/* Plan Selector Toggle Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20, padding: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('course');
                    setCustomAmount(coursePricingConfig.suggested);
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 12,
                    border: selectedPlan === 'course' ? '1.5px solid #C4913A' : '1px solid transparent',
                    background: selectedPlan === 'course' ? 'rgba(196,145,58,0.25)' : 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: SANS,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: selectedPlan === 'course' ? '#FFDF9E' : 'rgba(255,255,255,0.7)' }}>
                    Course Only
                  </div>
                  <div style={{ fontSize: 10.5, color: 'rgba(237,233,227,0.6)', marginTop: 2 }}>
                    Suggested {coursePricingConfig.symbol}{coursePricingConfig.suggested.toLocaleString()}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan('allAccess');
                    setCustomAmount(allAccessPricingConfig.suggested);
                  }}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 12,
                    border: selectedPlan === 'allAccess' ? '1.5px solid #C4913A' : '1px solid transparent',
                    background: selectedPlan === 'allAccess' ? 'rgba(196,145,58,0.3)' : 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: SANS,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', top: -7, right: 6, fontSize: 8.5, fontWeight: 900, background: '#C4913A', color: '#1E1426', padding: '2px 6px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Whole App 🔥
                  </span>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: selectedPlan === 'allAccess' ? '#FFDF9E' : 'rgba(255,255,255,0.7)' }}>
                    App + Course
                  </div>
                  <div style={{ fontSize: 10.5, color: 'rgba(237,233,227,0.6)', marginTop: 2 }}>
                    Suggested {allAccessPricingConfig.symbol}{allAccessPricingConfig.suggested.toLocaleString()}
                  </div>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 500, color: '#EDE9E3' }}>
                  {activePricingConfig.symbol}{customAmount.toLocaleString()}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 15, textDecoration: 'line-through', opacity: 0.45 }}>
                  {activePricingConfig.symbol}{activePricingConfig.strike.toLocaleString()}
                </span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(237,233,227,0.6)', margin: '0 0 20px' }}>
                Pay-What-You-Feel Support Available
              </p>

              {/* Price Slider */}
              <div style={{ marginBottom: 24, textAlign: 'left' }}>
                <PriceSlider
                  currency={activePricingConfig.currency}
                  min={activePricingConfig.min}
                  suggested={activePricingConfig.suggested}
                  max={activePricingConfig.max}
                  value={customAmount}
                  onChange={(val) => setCustomAmount(val)}
                  dark={true}
                />
              </div>

              <div style={{ display: 'grid', gap: 10, textAlign: 'left', marginBottom: 28 }}>
                {(selectedPlan === 'course' ? [
                  '18 Video Masterclasses & Worksheets',
                  'Lifetime Course Access & All Future Updates',
                  'Works on all mobile & desktop devices',
                  '100% 14-Day Money-Back Guarantee'
                ] : [
                  '✨ EVERYTHING in Feelings & Emotions Course',
                  '🧠 Full MindGym App Access (Journal, Breathwork & Audio)',
                  '🏆 Personal Growth Analytics & Daily Tracker',
                  '⚡ Lifetime Access to All Future App Courses & Updates'
                ]).map((checkItem) => (
                  <div key={checkItem} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: selectedPlan === 'allAccess' && checkItem.startsWith('✨') ? '#FFDF9E' : 'rgba(237,233,227,0.85)' }}>
                    <Check size={14} color="#C4913A" />
                    <span>{checkItem}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCheckoutModal(true)}
              className="si-btn-breathe"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 999,
                cursor: 'pointer',
                background: '#fff',
                color: '#1E1426',
                border: 'none',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Join the Course
            </button>
          </div>

          {/* Right Column: Risk-Free & FAQ Prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Our Promise To You */}
            <div
              style={{
                background: cardBg,
                border: '1.5px solid rgba(196,145,58,0.4)',
                borderRadius: 24,
                padding: 24,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: 'var(--si-shadow-warm)',
              }}
            >
              <h4 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: ink, margin: 0 }}>
                Our Promise To You
              </h4>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: isDark ? 'rgba(196,145,58,0.18)' : 'rgba(196,145,58,0.12)',
                  color: isDark ? '#C4913A' : '#7A5F44',
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  width: 'fit-content',
                }}
              >
                100% money back, no questions asked.
              </span>
              <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: inkSub, margin: 0 }}>
                If this course doesn't resonate with you — for any reason, at any time — just tell us and we'll refund you in full. No forms, no justification needed.
              </p>
            </div>

            {/* Have Questions? */}
            <div
              style={{
                background: cardBg,
                border: `1px solid ${borderC}`,
                borderRadius: 24,
                padding: 24,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h4 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: ink, margin: '0 0 8px' }}>
                  Have questions?
                </h4>
                <p style={{ fontFamily: SANS, fontSize: 12.5, color: inkSub, margin: 0 }}>
                  We're here to help.
                </p>
              </div>

              <a
                href="#faq"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 999,
                  border: `1px solid ${borderC}`,
                  color: ink,
                  textDecoration: 'none',
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 16,
                  alignSelf: 'flex-start',
                }}
              >
                See FAQs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          8. FAQ SECTION
         ════════════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        className="si-reveal"
        style={{
          padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="si-faq-head si-section-head" style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 14 }}>
            Questions & Answers
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.8vw, 48px)', fontWeight: 400, color: ink, marginBottom: 8 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div className="si-faq-list" style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: 14 }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: cardBg,
                  border: `1px solid ${borderC}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                <button
                  className="si-faq-q"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: ink,
                    fontFamily: SANS,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {/* flex:1 + minWidth:0 so the question wraps within its own
                      share of the row instead of running under the chevron
                      — without this, a two-line question's second line could
                      land right behind the (flexShrink:0) icon. */}
                  <span style={{ flex: 1, minWidth: 0 }}>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', flexShrink: 0 }}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ padding: '0 24px 20px', color: inkSub, fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6 }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Divider */}
      <div style={{ padding: '0 24px' }}><div className="si-divider" /></div>

      {/* ════════════════════════════════════════════════════════════════════
          9. FINAL EMOTIONAL CTA BANNER
         ════════════════════════════════════════════════════════════════════ */}
      <section
        className="si-reveal"
        style={{
          position: 'relative',
          padding: 'clamp(96px, 14vw, 160px) clamp(24px, 6vw, 96px)',
          textAlign: 'center',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        {/* Background Banner Image */}
        <img
          src={CLOSING_BANNER}
          alt="Peaceful landscape sunset"
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isDark ? 0.22 : 0.14,
            pointerEvents: 'none',
          }}
        />
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(30px, 4.5vw, 62px)',
            fontWeight: 400,
            lineHeight: 1.15,
            color: ink,
            maxWidth: 780,
            margin: '0 auto 24px',
            letterSpacing: '-0.01em',
          }}
        >
          You can keep reacting.<br />
          <em style={{ fontStyle: 'italic', color: isDark ? '#C4913A' : '#6B5744' }}>
            Or you can choose awareness.
          </em>
        </h2>

        <p style={{ fontFamily: SERIF, fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 400, color: inkSub, margin: '0 0 44px' }}>
          The choice is yours.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="si-btn-breathe"
            style={{
              padding: '16px 40px',
              borderRadius: 999,
              cursor: 'pointer',
              background: '#4A3260',
              color: '#fff',
              border: 'none',
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 12px 40px rgba(74,50,96,0.3)',
            }}
          >
            Begin Your Journey Today <ArrowRight size={16} />
          </button>
          <p style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, margin: 0, fontWeight: 600 }}>
            Understand. Heal. Transform.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          10. BOTTOM TRUST BAR
         ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          borderTop: `1px solid ${borderC}`,
          padding: '24px clamp(24px, 6vw, 96px)',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 'clamp(16px, 3vw, 36px)',
          fontSize: 12,
          fontFamily: SANS,
          fontWeight: 600,
          color: inkSub,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span>⊙ Instant lifetime access</span>
        <span>○ Learn at your own pace</span>
        <span>◇ Simple, practical & powerful</span>
        <span>△ For all backgrounds</span>
        <span>♡ Support when you need</span>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteFooter palette={palette} />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODALS
         ════════════════════════════════════════════════════════════════════ */}

      {/* 0. 60-Second Teaser Modal */}
      <AnimatePresence>
        {teaserVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 120,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setTeaserVideo(null)}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 880,
                aspectRatio: '16/9',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 30px 90px rgba(0,0,0,0.6)',
                border: '1.5px solid rgba(196,145,58,0.4)',
                background: '#0D0A12',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setTeaserVideo(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  zIndex: 30,
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 999,
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  fontSize: 12,
                  fontFamily: SANS,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <X size={14} /> Close
              </button>

              {/* Floating Timer Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  zIndex: 30,
                  background: 'rgba(19, 14, 25, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(196,145,58,0.4)',
                  borderRadius: 999,
                  padding: '6px 16px',
                  color: '#FFDF9E',
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
                }}
              >
                <Sparkles size={13} color="#FFDF9E" />
                <span>60s Free Teaser — 00:{teaserTimer < 10 ? `0${teaserTimer}` : teaserTimer} left</span>
              </div>

              {/* YouTube Iframe (controls disabled & pointer shield to prevent seeking/forwarding) */}
              {/* cc_load_policy=0 keeps YouTube's auto-captions off — they were
                  overlapping the teaser's own on-screen text. */}
              <iframe
                src={`https://www.youtube.com/embed/${teaserVideo.id}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&cc_load_policy=0${teaserVideo.startTime ? `&start=${teaserVideo.startTime}` : ''}`}
                title={`60s Teaser - Episode ${teaserVideo.episodeNum}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
              />
              {/* Invisible pointer shield preventing video scrubbing / fast-forwarding */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 25,
                  background: 'transparent',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setShowVideoModal(false)}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 840, aspectRatio: '16/9' }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  position: 'absolute',
                  top: -40,
                  right: 0,
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕ Close
              </button>
              <iframe
                src={activeVideoUrl}
                title="Course Preview"
                style={{ width: '100%', height: '100%', borderRadius: 16, border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Checkout Modal */}
      <AnimatePresence>
        {purchaseSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 120,
              background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="purchase-success-title"
              style={{
                width: '100%',
                maxWidth: 480,
                background: isDark ? '#1A1222' : '#F9F5EF',
                border: `1px solid ${borderC}`,
                borderRadius: 28,
                padding: 36,
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 18px',
                background: 'rgba(74,50,96,0.12)', border: '1px solid rgba(196,145,58,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
              }}>
                ✨
              </div>

              <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', margin: '0 0 10px' }}>
                Payment received
              </p>
              <h3 id="purchase-success-title" style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 400, color: ink, margin: '0 0 12px', lineHeight: 1.25 }}>
                Your course is ready.
              </h3>

              {purchaseSuccess.wasSignedIn ? (
                <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.65, color: inkSub, margin: '0 0 24px' }}>
                  Understanding Feelings &amp; Emotions is unlocked on your account.
                  Open Mind Gym to begin Episode 1.
                </p>
              ) : (
                <>
                  <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.65, color: inkSub, margin: '0 0 14px' }}>
                    You have lifetime access to Understanding Feelings &amp; Emotions.
                    To open it, sign in to Mind Gym with this email:
                  </p>
                  <div style={{
                    fontFamily: SANS, fontSize: 14.5, fontWeight: 700, color: ink,
                    background: 'rgba(196,145,58,0.10)', border: '1px solid rgba(196,145,58,0.3)',
                    borderRadius: 12, padding: '11px 14px', margin: '0 0 14px',
                    wordBreak: 'break-all',
                  }}>
                    {purchaseSuccess.email}
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.6, color: inkSub, margin: '0 0 24px' }}>
                    Your course is tied to this address — signing in with a different
                    one won&rsquo;t show it. New here? Creating the account unlocks it automatically.
                  </p>
                </>
              )}

              <button
                onClick={goToMindGym}
                style={{
                  width: '100%',
                  padding: '15px 28px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  background: '#4A3260',
                  color: '#fff',
                  border: 'none',
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 800,
                  boxShadow: '0 8px 30px rgba(74,50,96,0.3)',
                }}
              >
                Open Mind Gym →
              </button>

              <button
                onClick={() => setPurchaseSuccess(null)}
                style={{
                  marginTop: 12, background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: SANS, fontSize: 12.5, color: inkSub, padding: 8,
                }}
              >
                Stay on this page
              </button>
            </motion.div>
          </motion.div>
        )}

        {showCheckoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setShowCheckoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 480,
                background: isDark ? '#1A1222' : '#F9F5EF',
                border: `1px solid ${borderC}`,
                borderRadius: 28,
                padding: 36,
                boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                position: 'relative',
                // Scrollable so trust badges + Google/Apple Pay buttons are
                // always reachable even on short mobile screens.
                overflowY: 'auto',
                maxHeight: '92dvh',
                // Thin custom scrollbar (Webkit + Firefox)
                scrollbarWidth: 'thin' as const,
                scrollbarColor: 'rgba(196,145,58,0.4) transparent',
              } as React.CSSProperties}
            >
              <button
                onClick={() => setShowCheckoutModal(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: inkSub,
                }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: ink, margin: '0 0 6px' }}>
                Join the Course
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 13, color: inkSub, margin: '0 0 14px' }}>
                Lifetime access to all current &amp; upcoming episode drops.
              </p>

              {/* ── Trust strip ───────────────────────────────────────────── */}
              <TrustStrip isDark={isDark} ink={ink} inkSub={inkSub} />

              <form onSubmit={handleStartCheckout} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: inkSub, marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1px solid ${borderC}`,
                      background: 'transparent',
                      color: ink,
                      fontFamily: SANS,
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                 <div>
                  <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: inkSub, marginBottom: 6 }}>
                    Email Address <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.85 }}>(Your account will be created here)</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1px solid ${borderC}`,
                      background: 'transparent',
                      color: ink,
                      fontFamily: SANS,
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: inkSub, marginBottom: 6 }}>
                    WhatsApp / Phone Number <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.85 }}>(For support &amp; updates)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1px solid ${borderC}`,
                      background: 'transparent',
                      color: ink,
                      fontFamily: SANS,
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <ConsentCheckboxes
                  agreeTerms={agreeTerms}
                  setAgreeTerms={setAgreeTerms}
                  agreeMarketing={agreeMarketing}
                  setAgreeMarketing={setAgreeMarketing}
                  isDark={isDark}
                  ink={ink}
                  inkSub={inkSub}
                />

                {checkoutErr && (
                  <p style={{ fontFamily: SANS, fontSize: 12, color: '#E53935', margin: 0 }}>
                    {checkoutErr}
                  </p>
                )}

                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: inkSub }}>
                      Select Contribution (Pay What You Feel)
                    </label>
                    <span style={{ fontSize: 10, fontWeight: 800, color: isDark ? '#C4913A' : '#8B6A1A', textTransform: 'uppercase', background: isDark ? 'rgba(196,145,58,0.15)' : 'rgba(74,50,96,0.08)', padding: '2px 8px', borderRadius: 999 }}>
                      {selectedPlan === 'course' ? 'Course Only' : 'Whole App + Course 🔥'}
                    </span>
                  </div>
                  <PriceSlider
                    currency={activePricingConfig.currency}
                    min={activePricingConfig.min}
                    suggested={activePricingConfig.suggested}
                    max={activePricingConfig.max}
                    value={customAmount}
                    onChange={(val) => setCustomAmount(val)}
                    dark={isDark}
                  />
                </div>

                <WhatsIncluded isDark={isDark} ink={ink} inkSub={inkSub} />

                <div style={{ marginTop: 10, padding: '14px 16px', borderRadius: 14, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, display: 'block' }}>Total Amount</span>
                    <span style={{ fontFamily: SANS, fontSize: 10.5, color: inkSub }}>{selectedPlan === 'course' ? 'Feelings & Emotions Course' : 'Whole App All-Access Pass'}</span>
                  </div>
                  <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 500, color: isDark ? '#C4913A' : '#4A3260' }}>
                    {activePricingConfig.symbol}{customAmount.toLocaleString()}
                  </span>
                </div>

                {/* Card checkout (Razorpay) and PayPal/Apple Pay are both offered —
                    deliberately, not gated behind a region guess. A wrong region
                    detection previously left overseas buyers stuck on a form
                    quoting the wrong currency with no alternative; whichever
                    button the buyer actually reaches now still works.

                    IMPORTANT: The card button MUST always remain visible. PayPal
                    buttons are toggled via CSS visibility (not conditional mounting)
                    so the card button never disappears while the buyer is typing
                    their email. The container is also capped at 55 px tall on
                    mobile to prevent the PayPal SDK from expanding to half-screen. */}
                {isPaypalAvailable === false ? (
                  // PayPal backend unreachable (functions not deployed, or no
                  // client id configured). Show card checkout on its own rather
                  // than an empty slot and a divider leading nowhere.
                  <RazorpaySubmit isProcessing={isProcessing} />
                ) : activePricingConfig.currency === 'INR' ? (
                  <>
                    <RazorpaySubmit isProcessing={isProcessing} />
                    <div style={{ visibility: isPaypalFormReady ? 'visible' : 'hidden', maxHeight: isPaypalFormReady ? undefined : 0, overflow: 'hidden' }}>
                      <PaypalDivider />
                      <div
                        id="paypal-button-container"
                        style={{
                          minHeight: isPaypalProcessing ? 45 : undefined,
                          maxHeight: 55,
                          overflow: 'hidden',
                        }}
                      />
                      {/* Google Pay — only shown when device supports it */}
                      {isGooglePayAvailable && (
                        <div id="googlepay-button-container" style={{ marginTop: 6, maxHeight: 55, overflow: 'hidden' }} />
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ visibility: isPaypalFormReady ? 'visible' : 'hidden', maxHeight: isPaypalFormReady ? undefined : 0, overflow: 'hidden' }}>
                      <div
                        id="paypal-button-container"
                        style={{
                          minHeight: isPaypalProcessing ? 45 : undefined,
                          maxHeight: 55,
                          overflow: 'hidden',
                        }}
                      />
                      {/* Google Pay — only shown when device supports it */}
                      {isGooglePayAvailable && (
                        <div id="googlepay-button-container" style={{ marginTop: 6, maxHeight: 55, overflow: 'hidden' }} />
                      )}
                      <PaypalDivider />
                    </div>
                    <RazorpaySubmit isProcessing={isProcessing} />
                  </>
                )}

                <OrderPromise brandName="Mind Gym" isDark={isDark} ink={ink} inkSub={inkSub} />

                <TrustBadges isDark={isDark} />
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky bottom CTA — the header's "Join the Course" button is hidden
          below 900px (si-hide-sm, folded into the burger menu instead), which
          left mobile scrollers with no always-visible way to start checkout.
          Hidden while the checkout modal or success screen already covers the
          page, so it never sits under (or duplicates) those. */}
      {!showCheckoutModal && !purchaseSuccess && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            // Not `0`: see viewportInset — on iOS Safari `bottom: 0` puts this
            // behind the browser's bottom toolbar whenever it is showing.
            bottom: viewportInset,
            zIndex: 90,
            background: isDark ? 'rgba(13,10,18,0.92)' : 'rgba(249,245,239,0.92)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderTop: `1px solid ${borderC}`,
            padding: '12px 20px calc(12px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <button
            onClick={() => setShowCheckoutModal(true)}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              padding: '14px',
              borderRadius: 999,
              cursor: 'pointer',
              background: '#4A3260',
              color: '#fff',
              border: 'none',
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Join the Course
          </button>
        </div>
      )}
    </div>
  );
}
