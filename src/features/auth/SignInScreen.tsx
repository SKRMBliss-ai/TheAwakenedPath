import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { ArrowRight, Eye, EyeOff, LayoutGrid, ChevronDown } from 'lucide-react';
import { themes } from '../../theme/constants';

// ─── Stable particle positions (no randomness on re-render) ──────────────────
const PARTICLES = [
    { x: -90, y: -30,  size: 2.5, dur: 6,   delay: 0    },
    { x:  85, y: -60,  size: 1.5, dur: 8,   delay: 1.2  },
    { x: -60, y:  50,  size: 2,   dur: 7,   delay: 0.5  },
    { x:  70, y:  40,  size: 1.5, dur: 9,   delay: 2    },
    { x: -110,y:  10,  size: 1.5, dur: 7.5, delay: 0.8  },
    { x:  100, y: -20, size: 2,   dur: 6.5, delay: 1.6  },
    { x:  30,  y: -90, size: 1.5, dur: 8.5, delay: 0.3  },
    { x: -40,  y: -80, size: 2,   dur: 7,   delay: 1.9  },
    { x:  50,  y:  75, size: 1.5, dur: 9,   delay: 0.7  },
    { x: -75,  y:  70, size: 2,   dur: 6,   delay: 2.4  },
    { x:  120, y:  25, size: 1.5, dur: 8,   delay: 1.1  },
    { x: -20,  y:  95, size: 2.5, dur: 7.5, delay: 0.4  },
];

export const SignInScreen = () => {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
    const theme = themes.dark;

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) await signInWithEmail(email, password);
            else await signUpWithEmail(email, password);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) { setError('Please enter your email address above first.'); return; }
        setError('');
        setForgotLoading(true);
        try {
            await resetPassword(email);
            setForgotSent(true);
        } catch (err: any) {
            setError(err.message || 'Could not send reset email.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Google Sign In Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full relative flex flex-col items-center overflow-hidden"
            style={{ background: '#000000' }}
        >
            {/* ── Deep ambient colour washes ────────────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[60%] h-[55%] rounded-full blur-[140px]"
                    style={{ background: 'radial-gradient(circle, rgba(94,196,176,0.08) 0%, transparent 70%)' }} />
                <div className="absolute top-[5%] right-[-10%] w-[50%] h-[45%] rounded-full blur-[120px]"
                    style={{ background: 'radial-gradient(circle, rgba(184,151,58,0.06) 0%, transparent 70%)' }} />
            </div>

            {/* ── Sacred Portal ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="relative flex flex-col items-center pt-8 pb-0 z-10"
            >
                {/* Particle field */}
                <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
                    {PARTICLES.map((p, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: p.size, height: p.size,
                                background: 'rgba(184,151,58,0.7)',
                                boxShadow: '0 0 4px rgba(184,151,58,0.5)',
                                top: '50%', left: '50%',
                                marginTop: -p.size / 2, marginLeft: -p.size / 2,
                                x: p.x, y: p.y,
                            }}
                            animate={{
                                y: [p.y, p.y - 18, p.y],
                                opacity: [0.4, 1, 0.4],
                            }}
                            transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
                        />
                    ))}
                </div>

                {/* Ring stack */}
                <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
                    {/* Outermost pulse ring */}
                    <motion.div className="absolute rounded-full"
                        style={{ width: 214, height: 214, border: '1px solid rgba(184,151,58,0.08)' }}
                        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Slow CW rotation ring */}
                    <motion.div className="absolute rounded-full"
                        style={{ width: 190, height: 190, border: '1px dashed rgba(184,151,58,0.18)', borderRadius: '50%' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Slow CCW rotation ring */}
                    <motion.div className="absolute rounded-full"
                        style={{ width: 163, height: 163, border: '1px solid rgba(94,196,176,0.12)' }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Inner pulse ring */}
                    <motion.div className="absolute rounded-full"
                        style={{ width: 138, height: 138, border: '1px solid rgba(184,151,58,0.22)' }}
                        animate={{ scale: [1, 1.03, 1], opacity: [0.7, 0.2, 0.7] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    />
                    {/* Gold bloom glow */}
                    <div className="absolute rounded-full blur-[36px]"
                        style={{ width: 118, height: 118, background: 'radial-gradient(circle, rgba(184,151,58,0.28) 0%, transparent 70%)' }}
                    />
                    {/* Teal inner glow */}
                    <div className="absolute rounded-full blur-[18px]"
                        style={{ width: 85, height: 85, background: 'radial-gradient(circle, rgba(94,196,176,0.12) 0%, transparent 70%)' }}
                    />
                    {/* Logo — flush black, breathes gently */}
                    <motion.img
                        src="/AwakenedPathAppLogo.webp"
                        alt="The Awakened Path"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ width: 108, height: 108, position: 'relative', zIndex: 1, display: 'block' }}
                        draggable={false}
                    />
                </div>

                {/* Wordmark */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-col items-center mt-1 mb-0 gap-1"
                >
                    <p className="text-[8px] font-sans font-bold tracking-[0.55em] uppercase"
                        style={{ color: theme.accentPrimary, opacity: 0.55 }}>
                        the
                    </p>
                    <h1 className="text-[28px] font-serif font-light tracking-[0.06em] leading-none"
                        style={{ color: theme.textPrimary }}>
                        Awakened Path
                    </h1>
                    <p className="text-[11px] font-sans font-medium tracking-[0.38em] uppercase mt-1"
                        style={{ color: '#a89fc0' }}>
                        A Presence Study
                    </p>
                </motion.div>

                {/* Light shaft connecting logo to card */}
                <div className="w-px mt-4" style={{
                    height: 28,
                    background: 'linear-gradient(to bottom, rgba(184,151,58,0.25), rgba(184,151,58,0.04))'
                }} />
            </motion.div>

            {/* ── Auth Card ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-sm px-4 pb-8"
            >
                <div
                    className="relative rounded-[28px] overflow-hidden"
                    style={{
                        background: 'rgba(20,18,26,0.85)',
                        border: '1px solid rgba(184,151,58,0.14)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 32px 64px -16px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)'
                    }}
                >
                    {/* Subtle top-edge gold sheen */}
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(184,151,58,0.3), transparent)' }} />

                    <div className="p-5 flex flex-col items-center">

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full mb-5 p-3 rounded-xl"
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
                                >
                                    <p className="text-red-400 text-[11px] text-center">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Google */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full group flex items-center justify-center gap-3 px-6 py-3 rounded-2xl transition-all active:scale-[0.97] mb-4"
                            style={{ background: 'white', color: '#0c0910', boxShadow: '0 4px 20px rgba(255,255,255,0.08)' }}
                        >
                            <LayoutGrid className="w-4 h-4 opacity-70 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="text-[13px] font-bold tracking-wide">Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="w-full flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.22)' }} />
                            <span className="text-[11px] font-bold uppercase tracking-[0.35em]"
                                style={{ color: '#9b92b8' }}>or</span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.22)' }} />
                        </div>

                        {/* Email toggle */}
                        <button
                            onClick={() => setShowEmailForm(!showEmailForm)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-xl transition-colors mb-1"
                            style={{ color: theme.textPrimary }}
                        >
                            <span className="text-[13px] font-semibold tracking-[0.12em]"
                                style={{ color: '#cdc6e0' }}>
                                Use Email
                            </span>
                            <motion.div animate={{ rotate: showEmailForm ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                <ChevronDown className="w-4 h-4" style={{ color: '#9b92b8' }} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {showEmailForm && (
                                <motion.form
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSubmit}
                                    className="w-full overflow-hidden pt-3 space-y-4"
                                >
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.25em] pl-1 opacity-40"
                                            style={{ color: theme.textPrimary }}>Email</label>
                                        <input
                                            type="email"
                                            placeholder="your@soul.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full rounded-2xl py-3 px-4 text-[13px] outline-none transition-all"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                color: theme.textPrimary,
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.25em] pl-1 opacity-40"
                                            style={{ color: theme.textPrimary }}>Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full rounded-2xl py-3 px-4 text-[13px] outline-none transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    color: theme.textPrimary,
                                                }}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-80 transition-opacity"
                                                style={{ color: theme.textPrimary }}>
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {isLogin && (
                                        <AnimatePresence mode="wait">
                                            {forgotSent ? (
                                                <motion.p key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                    className="text-[11px] text-center" style={{ color: theme.accentPrimary }}>
                                                    ✨ Reset link sent to your inbox.
                                                </motion.p>
                                            ) : (
                                                <motion.button key="link" type="button" onClick={handleForgotPassword}
                                                    disabled={forgotLoading}
                                                    className="w-full text-right text-[10px] pr-1 opacity-40 hover:opacity-80 transition-opacity"
                                                    style={{ color: theme.accentPrimary }}>
                                                    {forgotLoading ? 'Sending…' : 'Forgot password?'}
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    )}

                                    <button type="submit" disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[12px] font-bold tracking-[0.18em] uppercase transition-all active:scale-[0.97]"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(184,151,58,0.9), rgba(94,196,176,0.8))',
                                            color: '#000',
                                            boxShadow: '0 4px 20px rgba(184,151,58,0.2)'
                                        }}>
                                        {loading
                                            ? <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                                            : <><span>{isLogin ? 'Sign In' : 'Create Account'}</span><ArrowRight className="w-4 h-4" /></>
                                        }
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Toggle login/signup */}
                        <button onClick={() => setIsLogin(!isLogin)}
                            className="mt-4 text-[13px] font-medium tracking-wide transition-opacity hover:opacity-90"
                            style={{ color: '#9b92b8' }}>
                            {isLogin
                                ? <span>New here? <span className="font-bold" style={{ color: theme.accentPrimary }}>Join the Path</span></span>
                                : <span>Have an account? <span className="font-bold" style={{ color: theme.accentPrimary }}>Sign In</span></span>
                            }
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                    className="mt-3 flex justify-center gap-6">
                    <a href="#" className="text-[13px] font-semibold tracking-wide hover:opacity-100 transition-opacity"
                        style={{ color: '#b8aed4' }}>Privacy</a>
                    <a href="#" className="text-[13px] font-semibold tracking-wide hover:opacity-100 transition-opacity"
                        style={{ color: '#b8aed4' }}>Terms</a>
                </motion.div>
            </motion.div>
        </div>
    );
};
