import { useState, useEffect, useRef } from 'react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { CrystalPyramid } from '../../components/ui/CrystalPyramid';
import {
    ArrowRight,
    Sparkles,
    BookOpen,
    Wind,
    Eye,
    Loader2,
    Sun,
    Moon,
    Bell,
    Download
} from 'lucide-react';
import presenceGuideImg from '../../assets/presence_guide_cover.png';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getSuggestion, validateEmailLocally, checkMxRecords } from '../../utils/emailValidation';
import { db } from '../../firebase';

const PREMIUM_URL = '/?plan=wisdom_untethered';

// ─── Activity Tracker ─────────────────────────────────────────────────────────
const LOG_URL = 'https://us-central1-mind-gym-2026.cloudfunctions.net/logWebActivity';

function getTrackedEmail(): string {
    if (typeof window === 'undefined') return 'anonymous';
    // Check URL param first (appended by emailClickTracker redirect)
    const params = new URLSearchParams(window.location.search);
    const utmEmail = params.get('utm_email');
    if (utmEmail) return utmEmail.toLowerCase();
    return localStorage.getItem('journal_access_email') || 'anonymous';
}

async function trackActivity(action: string, details = '', emailOverride?: string) {
    try {
        const email = emailOverride || getTrackedEmail();
        fetch(LOG_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                action,
                page: typeof window !== 'undefined' ? window.location.pathname : '/aboutmindgym',
                details,
                source: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
            }),
        }).catch(() => {}); // fire and forget — never block UI
    } catch (_) { /* silent */ }
}

// Gold border utility for premium look
const GOLD_BORDER = "border border-[#D4AF37]/30 dark:border-[#D4AF37]/40";

// ─── Theme Hook ──────────────────────────────────────────────────────────────
const useLandingTheme = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('AP_LANDING_THEME');
            if (saved === 'light' || saved === 'dark') return saved;
            // Default to dark
            return 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        localStorage.setItem('AP_LANDING_THEME', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    return { theme, toggle };
};

// ─── Firebase Storage helpers (used by Hero + HowItWorks + JournalFeatures) ──
const STORAGE_BASE = "https://firebasestorage.googleapis.com/v0/b/mind-gym-2026.firebasestorage.app/o/AboutJournal%2F";
const getStorageImg = (name: string) => `${STORAGE_BASE}${name}.webp?alt=media`;

// Graceful image fallback — called when Firebase Storage image fails to load.
// Replaces the img with a subtle gradient so the page never shows a black void.
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    el.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
        width:100%;height:${Math.max(el.offsetHeight || 200, 200)}px;
        background:linear-gradient(135deg,rgba(94,196,176,0.12) 0%,rgba(99,102,241,0.08) 100%);
        border-radius:inherit;
    `;
    el.parentNode?.insertBefore(placeholder, el);
};

// ─── Section: Hero ────────────────────────────────────────────────────────────
const Hero = ({ theme }: { theme: 'dark' | 'light' }) => {
    const containerRef = useRef<HTMLElement>(null);
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Gentle parallax on the background image as user scrolls past the hero
    const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const imageBlur = useTransform(scrollYProgress, [0, 0.35], [12, 0]);
    const imageOpacity = useTransform(scrollYProgress, [0, 0.35], [0.72, 1]);
    const imageFilter = useMotionTemplate`blur(${imageBlur}px)`;

    const isDark = theme === 'dark';

    // ── Shared content block (text + CTAs) ──────────────────────────────────
    const ContentText = () => (
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left md:pr-10">
            {/* Badge */}
            <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${GOLD_BORDER} text-[10px] tracking-[0.2em] uppercase font-bold mb-6 md:mb-8`}
                style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(12px)',
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                }}
            >
                <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
                <span>Mind Gym</span>
            </div>

            {/* Headline */}
            <h1
                className="font-[Outfit] text-[clamp(32px,6vw,72px)] font-light leading-[1.05] tracking-tight"
                style={{ color: isDark ? '#ffffff' : '#0c0910' }}
            >
                Train your mind.<br />
                <span className="font-medium" style={{ color: '#5EC4B0' }}>Every day.</span>
            </h1>

            {/* Description */}
            <p
                className="mt-6 max-w-md md:max-w-xl text-sm md:text-lg leading-relaxed font-light"
                style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}
            >
                A daily rhythm of journaling, video teachings, and awareness practices — designed to quiet the mental noise and help you actually feel at peace.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center md:items-start">
                <a
                    href={PREMIUM_URL}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#5EC4B0] hover:bg-[#4FB3A0] text-[#0c0910] text-sm font-bold tracking-wide transition-all shadow-xl hover:shadow-[#5EC4B0]/30"
                >
                    Begin Journey
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                    href="#download"
                    onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-semibold tracking-wide transition-all border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md"
                    style={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }}
                >
                    Download Guide
                    <Download className="w-4 h-4 transition-transform group-hover:translate-y-1" />
                </a>
            </div>
        </div>
    );

    const heroImageSrc = getStorageImg(isDark ? 'hero-dark' : 'hero-light');

    // ── MOBILE HERO — content first, image after with overlap ────────────────
    if (isMobile) {
        return (
            <section className={`relative w-full border-b ${GOLD_BORDER} overflow-hidden`}>
                <div
                    className="relative"
                    style={{
                        background: isDark
                            ? 'radial-gradient(ellipse at 60% 30%, rgba(94,196,176,0.10) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.08) 0%, transparent 55%), #0c0910'
                            : 'radial-gradient(ellipse at 60% 30%, rgba(94,196,176,0.18) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.10) 0%, transparent 55%), #fcf8f2',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="relative z-10 flex flex-col items-center px-6 pt-20 pb-14 gap-2"
                    >
                        {/* Crystal prominently on mobile */}
                        <CrystalPyramid className="w-full max-w-[260px]" />

                        {/* Text below crystal */}
                        <ContentText />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.95, delay: 0.1, ease: 'easeOut' }}
                        className="relative z-20 mx-4 mt-6 mb-8"
                    >
                        <div className="text-center mb-5 px-2">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] mb-2 font-semibold">
                                Mind Gym
                            </p>
                            <h2 className="font-[Outfit] text-[clamp(22px,5vw,30px)] font-light tracking-tight text-white">
                                Your daily practice, in one sacred space.
                            </h2>
                            <p className="mt-2 text-xs text-white/55 leading-relaxed">
                                Journal, reflect, track growth, and stay present through every part of your day.
                            </p>
                        </div>
                        <img
                            src={heroImageSrc}
                            alt="Mind Gym"
                            loading="eager"
                            onError={handleImgError}
                            className="w-full h-auto object-cover rounded-[28px] border border-white/10 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.8)]"
                        />
                    </motion.div>

                    <div className="mx-6 mb-8 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />
                </div>
            </section>
        );
    }

    // ── DESKTOP HERO — content first, image revealed after with overlap ─────
    return (
        <section
            ref={containerRef}
            className={`relative w-full border-b ${GOLD_BORDER} overflow-hidden`}
            style={{
                background: isDark
                    ? 'radial-gradient(ellipse at 20% 25%, rgba(94,196,176,0.08) 0%, transparent 52%), radial-gradient(ellipse at 80% 15%, rgba(99,102,241,0.08) 0%, transparent 55%), #0c0910'
                    : 'radial-gradient(ellipse at 20% 25%, rgba(94,196,176,0.15) 0%, transparent 52%), radial-gradient(ellipse at 80% 15%, rgba(99,102,241,0.12) 0%, transparent 55%), #fcf8f2',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="relative z-20 flex items-center px-8 xl:px-16 pt-28 pb-14"
                style={{ minHeight: '74vh' }}
            >
                <div className="max-w-6xl w-full mx-auto flex flex-row items-center gap-6">
                    {/* Text — left column */}
                    <div className="flex-1 min-w-0 flex flex-col items-start text-left">
                        <ContentText />
                    </div>
                    {/* Crystal — fixed-width right column, never clips */}
                    <div className="flex-shrink-0 w-[340px] xl:w-[400px] flex items-center justify-center">
                        <CrystalPyramid className="w-full" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.95, delay: 0.08, ease: 'easeOut' }}
                className="relative z-30 px-8 xl:px-16 pb-12"
            >
                <div className="max-w-6xl mx-auto text-center mb-6">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] mb-3 font-semibold">
                        Mind Gym
                    </p>
                    <h2 className="font-[Outfit] text-[clamp(26px,4vw,38px)] font-light tracking-tight text-black dark:text-white">
                        Your daily practice, in one sacred space.
                    </h2>
                    <p className="mt-3 text-sm text-black/50 dark:text-white/50 leading-relaxed">
                        Journal, reflect, track growth, and stay present through every part of your day.
                    </p>
                </div>
                <div className="max-w-6xl mx-auto mb-6 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />
                <motion.div
                    className="max-w-6xl mx-auto mt-6 rounded-[34px] overflow-hidden border border-white/10 shadow-[0_38px_100px_-45px_rgba(0,0,0,0.85)]"
                    style={{ scale: bgScale, filter: imageFilter, opacity: imageOpacity }}
                >
                    <img
                        src={heroImageSrc}
                        alt="Mind Gym"
                        loading="eager"
                        onError={handleImgError}
                        className="w-full h-auto object-cover"
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

// ─── Section: How it works ────────────────────────────────────────────────────

const STEPS = [
    {
        n: '01',
        title: 'Witness',
        body: 'Notice what arises — thoughts, emotions, sensations — without becoming them.',
        icon: Eye,
        image: getStorageImg('witness')
    },
    {
        n: '02',
        title: 'Release',
        body: 'Let go of the inner disturbance. Ten minutes a day rewires what your mind clings to.',
        icon: Wind,
        image: getStorageImg('release')
    },
    {
        n: '03',
        n_alt: 'Present',
        title: 'Be present',
        body: 'Anchor attention in the now. The voice in your head becomes the thing you watch, not who you are.',
        icon: Sparkles,
        image: getStorageImg('present')
    },
    {
        n: '04',
        title: 'Practice',
        body: 'Build the muscle with daily journals, breath sessions, and ambient soundscapes.',
        icon: BookOpen,
        image: getStorageImg('practice')
    },
];

// Per-step color palette — mirrors the "Your Daily Journey" infographic
const STEP_COLORS = [
    { accent: '#D4AF37', glow: 'rgba(212,175,55,0.35)', bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.25)', label: 'Learn' },
    { accent: '#9B6DFF', glow: 'rgba(155,109,255,0.35)', bg: 'rgba(155,109,255,0.08)', border: 'rgba(155,109,255,0.25)', label: 'Practice' },
    { accent: '#F4779A', glow: 'rgba(244,119,154,0.35)', bg: 'rgba(244,119,154,0.08)', border: 'rgba(244,119,154,0.25)', label: 'Reflect' },
    { accent: '#5EC49A', glow: 'rgba(94,196,154,0.35)', bg: 'rgba(94,196,154,0.08)', border: 'rgba(94,196,154,0.25)', label: 'Live It' },
];

// ─── Inline YouTube player: thumbnail → iframe on click ──────────────────────
const YOUTUBE_ID = 'rLXnxzq_Dlk';

function DailyJourneyVideo({ theme }: { theme: 'dark' | 'light' }) {
    const [playing, setPlaying] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto mb-16"
        >
            {/* Label */}
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px flex-1 max-w-[60px] bg-[#D4AF37]/30" />
                <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-500">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">
                        Demo · The 4-Step Daily Process
                    </span>
                </div>
                <div className="h-px flex-1 max-w-[60px] bg-[#D4AF37]/30" />
            </div>

            {/* Player */}
            <div
                className="group relative rounded-[20px] overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors duration-500"
                style={{ aspectRatio: '16/9' }}
            >
                {playing ? (
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
                        title="Your Daily Journey — 4-Step Process Demo"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <>
                        <img
                            src={getStorageImg(theme === 'dark' ? 'daily-journey-dark' : 'daily-journey-light')}
                            alt="Your Daily Journey — 4-Step Process Demo"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                        {/* Play button — embeds iframe on click */}
                        <button
                            onClick={() => { setPlaying(true); trackActivity('VIDEO_PLAY', `Played walkthrough video (${YOUTUBE_ID}) on /aboutmindgym`); }}
                            aria-label="Play video"
                            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_70px_rgba(212,175,55,0.7)] group-hover:border-[#D4AF37]/60 transition-all duration-500">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-9 md:h-9 text-white translate-x-0.5">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </button>

                        {/* Bottom bar */}
                        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 flex items-end justify-between pointer-events-none">
                            <div>
                                <p className="text-white text-[11px] uppercase tracking-widest font-semibold opacity-80">Watch the walkthrough</p>
                                <p className="text-white/60 text-xs mt-0.5">Learn · Practice · Reflect · Live It</p>
                            </div>
                            {/* YouTube badge — opens new tab, independent of play button */}
                            <a
                                href={`https://youtu.be/${YOUTUBE_ID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => { e.stopPropagation(); trackActivity('YOUTUBE_BADGE_CLICK', `Opened YouTube video ${YOUTUBE_ID} from /aboutmindgym`); }}
                                className="pointer-events-auto flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:border-red-500/50 transition-colors"
                                aria-label="Open on YouTube"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-500">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                <span className="text-[10px] font-bold text-white tracking-wider uppercase">YouTube ↗</span>
                            </a>
                        </div>
                    </>
                )}
            </div>

            <p className="text-center text-[11px] text-black/40 dark:text-white/35 mt-4 tracking-wide">
                This video walks you through exactly how to use these 4 steps daily →
            </p>
        </motion.div>
    );
}

// ─── Section: How it works ────────────────────────────────────────────────────
const HowItWorks = ({ theme }: { theme: 'dark' | 'light' }) => (

    <section className={`px-6 py-14 md:py-20 border-b ${GOLD_BORDER} bg-black/[0.01] dark:bg-white/[0.01]`}>
        <div className="max-w-5xl mx-auto">
            {/* Heading */}
            <div className="text-center max-w-2xl mx-auto mb-14">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] mb-3 font-semibold">
                    How it works
                </p>
                <h2 className="font-[Outfit] text-[clamp(26px,4vw,38px)] font-light tracking-tight text-black dark:text-white">
                    A simple practice, repeated daily.
                </h2>
                <p className="mt-4 text-sm text-black/50 dark:text-white/50 leading-relaxed">
                    Four steps. Ten minutes. A lifetime of presence.
                </p>
            </div>

            {/* Inline video player */}
            <DailyJourneyVideo theme={theme} />

            {/* 4 Step Cards — unique accent per step */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const color = STEP_COLORS[i];
                    const rotations = ['rotate-[1.5deg]', '-rotate-[1deg]', 'rotate-[0.5deg]', '-rotate-[1.5deg]'];
                    const offsets  = ['translate-y-2', '-translate-y-1', 'translate-y-3', '-translate-y-2'];
                    return (
                        <motion.div
                            key={s.n}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45, delay: i * 0.08 }}
                            className={`group relative aspect-square rounded-[28px] overflow-hidden shadow-2xl border-[3px] border-white dark:border-white/5 transition-all duration-500 hover:rotate-0 hover:translate-y-0 ${rotations[i]} ${offsets[i]}`}
                            style={{
                                boxShadow: `0 8px 32px -8px ${color.glow}`,
                                transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease, border-color 0.3s ease',
                            }}
                            whileHover={{
                                boxShadow: `0 0 50px 4px ${color.glow}`,
                                borderColor: color.accent + '60',
                            }}
                        >
                            {/* Background image fades on hover */}
                            <div className="absolute inset-0 z-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500 overflow-hidden">
                                <img src={s.image} alt="" loading="lazy" onError={handleImgError} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-1000" style={{minHeight:120,background:"rgba(94,196,176,0.08)"}} />
                                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${color.glow}, transparent 60%)` }} />
                            </div>

                            {/* Hover reveal bg */}
                            <div
                                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(ellipse at 50% 30%, ${color.bg} 0%, transparent 70%)` }}
                            />

                            {/* Content */}
                            <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
                                {/* Label pill + step number */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-[10px] font-bold tracking-[0.25em] px-2.5 py-1 rounded-full"
                                        style={{ color: color.accent, background: color.bg, border: `1px solid ${color.border}` }}
                                    >
                                        {color.label}
                                    </span>
                                    <span className="text-[10px] font-mono opacity-30 text-black dark:text-white">{s.n}</span>
                                </div>

                                {/* Icon */}
                                <div className="flex justify-center">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                                        style={{ background: color.bg, border: `1px solid ${color.border}` }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: color.accent }} />
                                    </div>
                                </div>

                                {/* Title + description */}
                                <div className="text-center space-y-1.5">
                                    <h3 className="font-[Outfit] text-base md:text-lg font-semibold text-black dark:text-white group-hover:-translate-y-0.5 transition-transform duration-500">
                                        {s.title}
                                    </h3>
                                    <p className="text-[11px] text-black/60 dark:text-white/55 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                                        {s.body}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Connector dots */}
            <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
                {STEP_COLORS.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: c.accent }} />
                        {i < 3 && <div className="w-6 h-px bg-current opacity-30" />}
                    </div>
                ))}
            </div>
        </div>
    </section>
);

// (Moved to top)

const MORE_FEATURES = [
    {
        title: 'Wisdom Untethered',
        body: '12-chapter signature course distilling Singer\'s most transformative teachings into a guided practice arc.',
        image: getStorageImg('wisdom_course'),
    },
    {
        title: 'Witness & Release',
        body: 'Singer\'s letting-go method. Notice what arises, soften, and watch the disturbance pass through you.',
        image: getStorageImg('release'),
    },
    {
        title: 'Daily Presence Check',
        body: 'Tolle-inspired situational practices for the messy moments — traffic, conflict, tired afternoons.',
        image: getStorageImg('present'),
    },
    {
        title: 'Mood tracking',
        body: 'A gentle daily check-in. See your inner weather over weeks and months — no judgment, just patterns.',
        image: getStorageImg('mood_heart'),
    },
    {
        title: 'Voice guidance',
        body: 'Calming AI-narrated meditations and reflections for when you\'d rather listen than read.',
        image: getStorageImg('voice_audio'),
    },
    {
        title: 'Sacred medals & stats',
        body: 'Subtle progress markers — streaks, sessions, breakthroughs — that honor practice without gamifying it.',
        image: getStorageImg('sacred_medal'),
    },
    {
        title: 'Learn → Practice → Reflect',
        body: 'A four-step daily rhythm that turns insight into integration. The path you actually walk.',
        image: getStorageImg('daily_flow'),
    },
    {
        title: 'Soundscape Player',
        body: 'Mindful soundscape mini-player. Background music and meditations follow you across the Journal.',
        image: getStorageImg('soundscape_sparkles'),
    },
];

const JournalFeatures = () => (
    <section className={`px-6 py-12 md:py-16 border-b ${GOLD_BORDER}`}>
        <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] mb-3 font-semibold">
                    Inside the Journal
                </p>
                <h2 className="font-[Outfit] text-[clamp(26px,4vw,36px)] font-light tracking-tight text-black dark:text-white">
                    Every tool requested by the path.
                </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {MORE_FEATURES.map((f, i) => {
                    return (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: i * 0.04 }}
                            className={`relative aspect-square rounded-[32px] bg-black/[0.02] dark:bg-white/[0.03] border-[4px] border-white dark:border-white/5 hover:border-[#D4AF37]/40 transition-all group flex flex-col items-center justify-center text-center overflow-hidden shadow-2xl ${i % 3 === 0 ? 'rotate-1' : i % 3 === 1 ? '-rotate-1' : 'rotate-0'} hover:rotate-0 duration-500 animate-heartbeat card-surge`}
                        >
                            {/* Background Image - visible by default, hidden on hover */}
                            <div className="absolute inset-0 z-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500 overflow-hidden">
                                <img src={f.image} alt="" loading="lazy" onError={handleImgError} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-1000" style={{minHeight:120,background:"rgba(94,196,176,0.08)"}} />
                                <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
                            </div>
 
                            {/* Text Content */}
                            <div className="relative z-10 px-4 md:px-6 flex flex-col items-center justify-center h-full">
                                <h3 className="font-[Outfit] text-sm md:text-base font-semibold text-black dark:text-white mb-2 tracking-tight transition-transform duration-500 group-hover:-translate-y-1">
                                    {f.title}
                                </h3>
                                <p className="text-[10px] md:text-xs text-black/70 dark:text-white/70 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0 max-w-[160px]">
                                    {f.body}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
);

// ─── Section: 30-Day Journal Download ─────────────────────────────────────────
const JournalDownload = () => {
    const [email, setEmail] = useState('');
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'checking' | 'submitting' | 'done' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [hasAccess, setHasAccess] = useState(false);
    const [accessEmail, setAccessEmail] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('journal_access_granted') === 'true') {
            setHasAccess(true);
            setAccessEmail(localStorage.getItem('journal_access_email') || '');
        }
    }, []);

    const handleEmailChange = (v: string) => {
        setEmail(v);
        setErrorMsg('');
        setSuggestion(getSuggestion(v));
    };

    const handleGrantAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();

        const localError = validateEmailLocally(trimmed);
        if (localError) { setErrorMsg(localError); setStatus('error'); return; }

        setStatus('checking');
        const domain = trimmed.split('@')[1];
        const hasMx = await checkMxRecords(domain);
        if (!hasMx) {
            setErrorMsg(`"${domain}" doesn't appear to have email configured. Please use your real email.`);
            setStatus('error');
            return;
        }

        setStatus('submitting');
        try {
            await addDoc(collection(db, 'waitlist'), {
                email: trimmed,
                source: 'journal_download_gate',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
                mailingList: true,
                createdAt: serverTimestamp(),
            });
            localStorage.setItem('journal_access_granted', 'true');
            localStorage.setItem('journal_access_email', trimmed);
            setAccessEmail(trimmed);
            setHasAccess(true);
            setStatus('done');
            trackActivity('EMAIL_FORM_SUBMIT', 'Submitted email for journal access on /aboutmindgym', trimmed);
        } catch (err) {
            console.error('Email capture failed:', err);
            setErrorMsg('Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const handleDownloadClick = () => {
        const emailToTrack = accessEmail || email.trim().toLowerCase();
        if (emailToTrack) {
            addDoc(collection(db, 'waitlist'), {
                email: emailToTrack,
                source: 'journal_download_clicked',
                type: 'download',
                mailingList: true,
                createdAt: serverTimestamp(),
            }).catch(() => {});
            trackActivity('JOURNAL_DOWNLOAD', 'Downloaded 30-day journal PDF from /aboutmindgym', emailToTrack);
        }
    };

    return (
        <section id="download" className={`px-6 py-12 md:py-16 border-b ${GOLD_BORDER} bg-[#5EC4B0]/[0.03] dark:bg-[#5EC4B0]/[0.05]`}>
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-1 text-center md:text-left">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5EC4B0]/10 ${GOLD_BORDER} text-[10px] tracking-[0.2em] uppercase font-semibold text-[#5EC4B0] mb-6`}>
                        <BookOpen className="w-3 h-3" />
                        Free Resource
                    </div>
                    <h2 className="font-[Outfit] text-[clamp(28px,4vw,40px)] font-light tracking-tight text-black dark:text-white leading-[1.1]">
                        The 30-Day <br />
                        <span className="font-medium text-[#5EC4B0]">Presence Guide.</span>
                    </h2>
                    <p className="mt-6 text-base text-black/60 dark:text-white/65 leading-relaxed">
                        A beautiful, printable 30-day guided journal to help you begin the practice of witnessing your thoughts. 
                        No app required to start — just a pen and your presence.
                    </p>
                    
                    <div className="mt-8">
                        {!hasAccess ? (
                            <form onSubmit={handleGrantAccess} className="max-w-md">
                                <div className={`flex flex-col sm:flex-row gap-2 p-1.5 rounded-full bg-white dark:bg-white/5 border transition-colors shadow-sm ${
                                    errorMsg ? 'border-red-400/50' : suggestion ? 'border-amber-400/50' : GOLD_BORDER
                                } focus-within:border-[#5EC4B0]/50`}>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        placeholder="Enter email to get access"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        className="flex-1 bg-transparent px-5 py-2.5 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/35 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === 'submitting' || status === 'checking'}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#5EC4B0] hover:bg-[#4FB3A0] disabled:opacity-50 text-[#0c0910] text-sm font-semibold tracking-wide transition-all shadow-sm group"
                                    >
                                        {status === 'checking' ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying…</span></>
                                        ) : status === 'submitting' ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>Get Journal <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" /></>
                                        )}
                                    </button>
                                </div>
                                {suggestion && !errorMsg && (
                                    <div className="mt-2 px-4 py-2 rounded-2xl flex items-center justify-between gap-2"
                                        style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
                                        <span className="text-[11px] text-yellow-500 dark:text-yellow-400">Did you mean <strong>{suggestion}</strong>?</span>
                                        <button type="button"
                                            onClick={() => { setEmail(suggestion); setSuggestion(null); setErrorMsg(''); }}
                                            className="text-[10px] font-black uppercase tracking-widest text-yellow-500 dark:text-yellow-400 hover:opacity-70 transition-opacity">
                                            Fix
                                        </button>
                                    </div>
                                )}
                                {errorMsg && (
                                    <p className="mt-2 text-xs text-red-500 ml-4">{errorMsg}</p>
                                )}
                                <p className="mt-3 text-[10px] text-black/40 dark:text-white/40 ml-4 uppercase tracking-widest font-medium">
                                    Instant access to PDF · Free Forever
                                </p>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start"
                            >
                                <a
                                    href="https://firebasestorage.googleapis.com/v0/b/mind-gym-2026.firebasestorage.app/o/AboutJournal%2FSoulfulIntelligenceStudio-30day_journal.docx.pdf?alt=media"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleDownloadClick}
                                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#5EC4B0] hover:bg-[#4FB3A0] text-[#0c0910] text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-[#5EC4B0]/20"
                                >
                                    Download PDF Journal
                                    <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                                </a>
                                <span className="text-xs text-black/40 dark:text-white/40 font-medium">Digital & Printable · Free Forever</span>
                            </motion.div>
                        )}
                    </div>
                </div>
                
                <div className="relative flex-1 max-w-[320px] md:max-w-none">
                    <div className={`aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl rotate-3 translate-y-4 hover:rotate-0 transition-transform duration-700`}>
                        <img 
                            src={presenceGuideImg} 
                            alt="30 Day Journal Preview" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className={`absolute inset-0 aspect-[3/4] rounded-3xl overflow-hidden border border-white/20 shadow-xl -rotate-6 transition-transform duration-700 bg-white/10 backdrop-blur-sm -z-10`} />
                </div>
            </div>
        </section>
    );
};





// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
    <footer className={`px-6 py-8 border-t ${GOLD_BORDER}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/40 dark:text-white/40">
            <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="tracking-wide">Mind Gym</span>
            </div>
            <div className="flex items-center gap-5">
                <a href="/" className="hover:text-black/70 dark:hover:text-white/70 transition-colors">Journal</a>
                <a href="mailto:connect@skrmblissai.in" className="hover:text-black/70 dark:hover:text-white/70 transition-colors">Contact</a>
            </div>
        </div>
    </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
// ─── Floating Actions ────────────────────────────────────────────────────────
const FloatingActions = () => {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
            {/* WhatsApp Floating Button */}
            <motion.a
                href="https://wa.me/918217581238"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center text-white cursor-pointer"
                title="Chat on WhatsApp"
            >
                <div className="w-6 h-6">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.801.983 3.826 1.504 5.885 1.505h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                </div>
            </motion.a>

            {/* Subscribe Floating Button */}
            <motion.a
                href="#download"
                onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
                }}
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-[#D4AF37] shadow-lg flex items-center justify-center text-[#0c0910] cursor-pointer"
                title="Get Daily Reminders"
            >
                <Bell className="w-5 h-5 focus:animate-ring" />
            </motion.a>
        </div>
    );
};

// ─── Animations & Styles ──────────────────────────────────────────────────────
const HEARTBEAT_KEYFRAMES = `
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.02); opacity: 1; }
  }
  .animate-heartbeat {
    animation: heartbeat 4s infinite ease-in-out;
    transform: translateZ(0);
    will-change: transform, opacity;
  }
  .card-surge {
    transform: translateZ(0);
    will-change: transform, box-shadow;
    transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .card-surge:hover {
    box-shadow: 0 0 50px rgba(94, 196, 176, 0.5) !important;
    transform: translateY(-4px) scale(1.01) translateZ(0) !important;
  }
`;

export default function AboutJournal() {
    const { theme, toggle } = useLandingTheme();

    // Track page visit once on mount
    useEffect(() => {
        trackActivity('PAGE_VISIT_ABOUT', 'Visited /aboutmindgym');
    }, []);

    return (
        <div
            className={`min-h-screen w-full transition-colors duration-1000 antialiased ${theme === 'dark' ? 'bg-[#0c0910]' : 'bg-[#fcf8f2]'}`}
            style={{
                fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
            }}
        >
            <style>{HEARTBEAT_KEYFRAMES}</style>
            <header className="fixed top-0 left-0 right-0 z-[110] px-6 py-4 flex items-center justify-between bg-black/10 dark:bg-black/20 backdrop-blur-md border-b border-white/5">
                <a href="/aboutmindgym" className="flex items-center gap-3 text-black/90 dark:text-white/95 hover:text-black dark:hover:text-white transition-all group">
                    <div className={`w-9 h-9 rounded-full bg-[#D4AF37]/15 ${GOLD_BORDER} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                </a>
                <div className="flex items-center gap-8">
                    <button 
                        onClick={toggle}
                        className={`p-2.5 rounded-xl bg-white/5 dark:bg-white/10 ${GOLD_BORDER} text-black/80 dark:text-white/80 hover:text-[#D4AF37] transition-all hover:scale-110`}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <a
                        href="/"
                        className="text-sm text-black/80 dark:text-white/85 hover:text-[#5EC4B0] transition-colors font-bold tracking-wide uppercase"
                    >
                        Sign in
                    </a>
                </div>
            </header>


            <Hero theme={theme} />
            <HowItWorks theme={theme} />
            <JournalFeatures />
            <JournalDownload />
            <Footer />
            <FloatingActions />
        </div>
    );
}
