import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Check,
    Sparkles,
    BookOpen,
    Wind,
    Headphones,
    Eye,
    Loader2,
    Mail,
    Sun,
    Moon
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const APP_URL = '/';
const PREMIUM_URL = '/?plan=wisdom_untethered';
const ALL_ACCESS_URL = '/?plan=all_access';

// Gold border utility for premium look
const GOLD_BORDER = "border border-[#D4AF37]/30 dark:border-[#D4AF37]/40";

// ─── Theme Hook ──────────────────────────────────────────────────────────────
const useLandingTheme = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('AP_LANDING_THEME');
            if (saved === 'light' || saved === 'dark') return saved;
            return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
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

// ─── Section: Hero ────────────────────────────────────────────────────────────
const Hero = ({ onScrollToPricing, theme }: { onScrollToPricing: () => void, theme: 'dark' | 'light' }) => (
    <section className={`relative pt-12 pb-12 md:pt-16 md:pb-16 px-6 overflow-hidden border-b ${GOLD_BORDER}`}>
        <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
            style={{
                background: theme === 'dark'
                    ? 'radial-gradient(60% 50% at 50% 0%, rgba(94,196,176,0.18) 0%, rgba(12,9,16,0) 70%)'
                    : 'radial-gradient(60% 50% at 50% 0%, rgba(94,196,176,0.12) 0%, rgba(252,248,242,0) 70%)',
            }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 dark:bg-white/5 bg-black/5 ${GOLD_BORDER} text-[11px] tracking-[0.18em] uppercase font-medium text-black/70 dark:text-white/70 mb-8`}
            >
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>The Awakened Journal</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="font-[Outfit] text-[clamp(34px,6vw,60px)] font-light leading-[1.05] tracking-tight text-black dark:text-white"
            >
                A quieter mind,
                <br />
                <span className="font-medium text-[#5EC4B0]">one breath at a time.</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-black/60 dark:text-white/65 leading-relaxed"
            >
                Daily journaling, breathwork, and witnessing practices grounded in modern wisdom —
                designed to help you watch the noise instead of being it.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
            >
                <a
                    href={PREMIUM_URL}
                    className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#5EC4B0] hover:bg-[#4FB3A0] text-[#0c0910] text-sm font-semibold tracking-wide transition-all shadow-[0_8px_30px_rgba(212,175,55,0.15)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.25)]"
                >
                    Begin the journey
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <button
                    onClick={onScrollToPricing}
                    className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08] ${GOLD_BORDER} text-black/80 dark:text-white/85 text-sm font-medium tracking-wide transition-all`}
                >
                    See pricing
                </button>
            </motion.div>
        </div>
    </section>
);

// ─── Section: How it works ────────────────────────────────────────────────────
const STEPS = [
    {
        n: '01',
        title: 'Witness',
        body: 'Notice what arises — thoughts, emotions, sensations — without becoming them.',
        icon: Eye,
        image: '/assets/landing/witness.webp'
    },
    {
        n: '02',
        title: 'Release',
        body: 'Let go of the inner disturbance. Ten minutes a day rewires what your mind clings to.',
        icon: Wind,
        image: '/assets/landing/release.webp'
    },
    {
        n: '03',
        title: 'Be present',
        body: 'Anchor attention in the now. The voice in your head becomes the thing you watch, not who you are.',
        icon: Sparkles,
        image: '/assets/landing/present.webp'
    },
    {
        n: '04',
        title: 'Practice',
        body: 'Build the muscle with daily journals, breath sessions, and ambient soundscapes.',
        icon: BookOpen,
        image: '/assets/landing/practice.webp'
    },
];

const HowItWorks = () => (
    <section className={`px-6 py-12 md:py-16 border-b ${GOLD_BORDER} bg-black/[0.01] dark:bg-white/[0.01]`}>
        <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] mb-3 font-semibold">
                    How it works
                </p>
                <h2 className="font-[Outfit] text-[clamp(26px,4vw,36px)] font-light tracking-tight text-black dark:text-white">
                    A simple practice, repeated daily.
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <motion.div
                            key={s.n}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className={`group relative p-6 rounded-2xl bg-white/[0.03] dark:bg-white/[0.03] bg-white ${GOLD_BORDER} hover:border-[#D4AF37]/60 transition-all overflow-hidden h-full flex flex-col min-h-[220px] shadow-sm`}
                        >
                            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 overflow-hidden">
                                <img src={s.image} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 dark:opacity-80" />
                            </div>

                            <div className="relative z-10 flex items-center justify-between mb-5">
                                <span className="text-[11px] tracking-[0.2em] text-black/30 dark:text-white/40 font-mono">
                                    {s.n}
                                </span>
                                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                                </div>
                            </div>
                            <h3 className="relative z-10 font-[Outfit] text-lg font-medium text-black dark:text-white mb-2 group-hover:text-white transition-colors">
                                {s.title}
                            </h3>
                            <p className="relative z-10 text-sm text-black/60 dark:text-white/60 leading-relaxed group-hover:text-white/90 transition-colors">
                                {s.body}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
);

// ─── Section: Featured practices ──────────────────────────────────────────────
const PRACTICES = [
    {
        tag: 'Daily journal',
        title: 'A guided journal that listens.',
        body: 'Prompts shaped by Singer & Tolle. Track moods. Capture insight. Return to it months later and see how far you\'ve come.',
        icon: BookOpen,
    },
    {
        tag: 'Breath sessions',
        title: 'Calm the body, calm the mind.',
        body: 'Box breathing, 4-7-8, long-exhale. Beautifully visualized timers — no hype, no noise.',
        icon: Wind,
    },
    {
        tag: 'Sacred soundscapes',
        title: 'Ambient music for presence.',
        body: 'Original soundscapes designed to keep you grounded during meditation, journaling, or focused work.',
        icon: Headphones,
    },
];

const FeaturedPractices = () => (
    <section className={`px-6 py-12 md:py-16 border-b ${GOLD_BORDER}`}>
        <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] mb-3 font-semibold">
                    Inside the Journal
                </p>
                <h2 className="font-[Outfit] text-[clamp(26px,4vw,36px)] font-light tracking-tight text-black dark:text-white">
                    Built around the practices that work.
                </h2>
            </div>

            <div className="space-y-4">
                {PRACTICES.map((p, i) => {
                    const Icon = p.icon;
                    return (
                        <motion.div
                            key={p.tag}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45, delay: i * 0.05 }}
                            className={`grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start p-7 md:p-10 rounded-3xl bg-black/[0.02] dark:bg-white/[0.04] border ${GOLD_BORDER} hover:border-[#D4AF37]/40 transition-colors`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-6 h-6 text-[#D4AF37]" />
                            </div>
                            <div>
                                <p className="text-[10px] tracking-[0.2em] uppercase text-black/40 dark:text-white/40 font-semibold mb-2">
                                    {p.tag}
                                </p>
                                <h3 className="font-[Outfit] text-xl md:text-2xl font-light text-black dark:text-white mb-2 tracking-tight">
                                    {p.title}
                                </h3>
                                <p className="text-sm md:text-base text-black/60 dark:text-white/65 leading-relaxed max-w-2xl">
                                    {p.body}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </section>
);

// ─── Section: Email waitlist ──────────────────────────────────────────────────
const WaitlistCapture = () => {
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setErrorMsg('Please enter a valid email');
            setState('error');
            return;
        }
        setState('submitting');
        setErrorMsg('');
        try {
            await addDoc(collection(db, 'waitlist'), {
                email: trimmed,
                source: 'aboutjournal',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
                createdAt: serverTimestamp(),
            });
            setState('done');
        } catch (err: any) {
            console.error('[waitlist] submit failed:', err);
            setErrorMsg('Something went wrong. Try again in a moment.');
            setState('error');
        }
    };

    return (
        <section className={`px-6 py-12 md:py-16 border-b ${GOLD_BORDER} bg-black/[0.01] dark:bg-white/[0.01]`}>
            <div className="max-w-3xl mx-auto text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] ${GOLD_BORDER} text-[10px] tracking-[0.2em] uppercase font-semibold text-black/50 dark:text-white/60 mb-6`}>
                    <Mail className="w-3 h-3 text-[#D4AF37]" />
                    Stay in touch
                </div>
                <h2 className="font-[Outfit] text-[clamp(24px,3.5vw,32px)] font-light tracking-tight text-black dark:text-white">
                    Get a weekly note. No spam, just signal.
                </h2>

                {state === 'done' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-black/70 dark:text-white/80 text-sm font-medium`}
                    >
                        <Check className="w-4 h-4 text-[#D4AF37]" />
                        You're on the list. See you Sunday.
                    </motion.div>
                ) : (
                    <form onSubmit={submit} className="mt-8 max-w-md mx-auto">
                        <div className={`flex flex-col sm:flex-row gap-2 p-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.04] ${GOLD_BORDER} focus-within:border-[#D4AF37]/40 transition-colors`}>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (state === 'error') setState('idle');
                                }}
                                placeholder="you@example.com"
                                className="flex-1 bg-transparent px-5 py-2.5 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/35 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={state === 'submitting'}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#5EC4B0] hover:bg-[#4FB3A0] disabled:opacity-50 text-[#0c0910] text-sm font-semibold tracking-wide transition-all shadow-sm"
                            >
                                {state === 'submitting' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>Subscribe <ArrowRight className="w-3.5 h-3.5" /></>
                                )}
                            </button>
                        </div>
                        {state === 'error' && (
                            <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
                        )}
                    </form>
                )}
            </div>
        </section>
    );
};

// ─── Section: Pricing ─────────────────────────────────────────────────────────
type Tier = {
    name: string;
    price: string;
    cadence?: string;
    blurb: string;
    features: string[];
    cta: { label: string; href: string };
    highlighted?: boolean;
};

const TIERS: Tier[] = [
    {
        name: 'Free',
        price: '$0',
        blurb: 'Begin the practice.',
        features: [
            'Daily journal prompts',
            'Core breathwork sessions',
            'Mood tracking',
        ],
        cta: { label: 'Start free', href: APP_URL },
    },
    {
        name: 'Wisdom Untethered',
        price: '$9',
        cadence: 'one-time',
        blurb: 'The signature course.',
        features: [
            'Everything in Free',
            '12-chapter course',
            'Signature teaching tracks',
            'Lifetime access',
        ],
        cta: { label: 'Get started', href: PREMIUM_URL },
        highlighted: true,
    },
    {
        name: 'All Access',
        price: '$199',
        cadence: 'one-time',
        blurb: 'Every course & soundscape.',
        features: [
            'Everything in Premium',
            'All future courses',
            'Full soundscape library',
            'Priority support',
        ],
        cta: { label: 'Unlock all', href: ALL_ACCESS_URL },
    },
];

const Pricing = ({ id }: { id: string }) => (
    <section id={id} className="px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] mb-3 font-semibold">
                    Pricing
                </p>
                <h2 className="font-[Outfit] text-[clamp(26px,4vw,36px)] font-light tracking-tight text-black dark:text-white">
                    Pay once. Practice forever.
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {TIERS.map((t, i) => (
                    <motion.div
                        key={t.name}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.45, delay: i * 0.06 }}
                        className={`relative p-7 md:p-8 rounded-3xl border transition-all flex flex-col ${
                            t.highlighted
                                ? 'bg-gradient-to-br from-[#D4AF37]/[0.08] to-[#D4AF37]/[0.02] border-[#D4AF37]/50 shadow-[0_20px_60px_-20px_rgba(212,175,55,0.2)]'
                                : `bg-black/[0.02] dark:bg-white/[0.03] ${GOLD_BORDER} hover:border-[#D4AF37]/40`
                        }`}
                    >
                        {t.highlighted && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#D4AF37] text-[#0c0910] text-[10px] font-bold uppercase tracking-[0.18em]">
                                Recommended
                            </div>
                        )}
                        <h3 className="font-[Outfit] text-lg font-medium text-black dark:text-white">{t.name}</h3>
                        <p className="mt-1 text-sm text-black/50 dark:text-white/55 min-h-[2.5em]">{t.blurb}</p>
                        <div className="mt-5 flex items-baseline gap-2">
                            <span className="font-[Outfit] text-4xl md:text-5xl font-light text-black dark:text-white tracking-tight">
                                {t.price}
                            </span>
                            {t.cadence && (
                                <span className="text-xs text-black/40 dark:text-white/40 uppercase tracking-widest">
                                    {t.cadence}
                                </span>
                            )}
                        </div>

                        <ul className="mt-6 space-y-3 flex-1">
                            {t.features.map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-black/70 dark:text-white/75">
                                    <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>

                        <a
                            href={t.cta.href}
                            className={`mt-7 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold tracking-wide transition-all ${
                                t.highlighted
                                    ? 'bg-[#5EC4B0] hover:bg-[#4FB3A0] text-[#0c0910]'
                                    : `bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.10] ${GOLD_BORDER} text-black dark:text-white`
                            }`}
                        >
                            {t.cta.label}
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
    <footer className={`px-6 py-8 border-t ${GOLD_BORDER}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/40 dark:text-white/40">
            <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="tracking-wide">The Awakened Path Studio</span>
            </div>
            <div className="flex items-center gap-5">
                <a href="/" className="hover:text-black/70 dark:hover:text-white/70 transition-colors">Journal</a>
                <a href="mailto:connect@skrmblissai.in" className="hover:text-black/70 dark:hover:text-white/70 transition-colors">Contact</a>
            </div>
        </div>
    </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutJournal() {
    const { theme, toggle } = useLandingTheme();

    const scrollToPricing = () => {
        const el = document.getElementById('pricing');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div
            className={`min-h-screen w-full transition-colors duration-1000 antialiased ${theme === 'dark' ? 'bg-[#0c0910]' : 'bg-[#fcf8f2]'}`}
            style={{
                fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
            }}
        >
            <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
                <a href="/aboutjournal" className="flex items-center gap-2 text-black/80 dark:text-white/85 hover:text-black dark:hover:text-white transition-colors">
                    <div className={`w-7 h-7 rounded-full bg-[#D4AF37]/10 ${GOLD_BORDER} flex items-center justify-center`}>
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <span className="font-medium text-sm tracking-wide">The Awakened Journal</span>
                </a>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={toggle}
                        className={`p-2 rounded-full bg-black/5 dark:bg-white/5 ${GOLD_BORDER} text-black/60 dark:text-white/60 hover:text-[#D4AF37] transition-colors`}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <a
                        href="/"
                        className="text-sm text-black/60 dark:text-white/65 hover:text-black dark:hover:text-white transition-colors font-medium"
                    >
                        Sign in
                    </a>
                </div>
            </header>

            <Hero onScrollToPricing={scrollToPricing} theme={theme} />
            <HowItWorks />
            <FeaturedPractices />
            <WaitlistCapture />
            <Pricing id="pricing" />
            <Footer />
        </div>
    );
}
