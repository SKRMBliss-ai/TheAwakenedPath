import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { ArrowRight, Eye, EyeOff, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../theme/ThemeSystem';
import { SI_LOGO_SRC } from '../../components/ui/SILogoMark';

export const SignInScreen = () => {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
    const { theme, mode } = useTheme();
    const [isLogin, setIsLogin] = useState(true);

    // Set by the course sales page after a GUEST purchase. That purchase lives
    // server-side under guestPurchases/{email} and only merges into an account
    // when someone signs in with the SAME address, so show it here and prefill
    // the field — otherwise a buyer with two Google accounts signs in with the
    // wrong one, sees no course, and files a support ticket.
    const [claimEmail] = useState<string>(() => {
        try { return localStorage.getItem('pendingCourseClaimEmail') || ''; } catch { return ''; }
    });
    const [email, setEmail] = useState(claimEmail);
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
            if (isLogin) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address above first.');
            return;
        }
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
            className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden p-6"
            style={{ background: theme.bgGradient }}
        >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-20 blur-[120px] transition-all duration-1000"
                    style={{ background: theme.accentPrimary }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[100px] transition-all duration-1000"
                    style={{ background: theme.accentSecondary }}
                />
            </div>

            {/* App Identity */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center mb-10"
            >
                {/* The SI mark carries its own gold ring, so it's shown round and
                    unframed — the previous gradient-filled square fought it. */}
                <div className="w-20 h-20 mb-4 rounded-full shadow-xl flex items-center justify-center overflow-hidden">
                    <img
                        src={SI_LOGO_SRC}
                        alt="Soulful Intelligence Studio"
                        className="w-full h-full object-contain rounded-full"
                    />
                </div>
                <h1
                    className="text-2xl font-serif font-bold tracking-[0.15em] uppercase text-center"
                    style={{ color: theme.textPrimary }}
                >
                    Mind Gym
                </h1>
                <p
                    className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase mt-2 opacity-60"
                    style={{ color: theme.textSecondary }}
                >
                    A Presence Study
                </p>
            </motion.div>

            {/* Main Auth Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 w-full max-w-sm"
            >
                <div
                    className="relative rounded-[24px] overflow-hidden shadow-2xl transition-all duration-500"
                    style={{
                        background: theme.bgSurface,
                        border: `1.5px solid ${theme.borderGlass}`,
                        backdropFilter: theme.blur,
                        boxShadow: mode === 'dark' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div className="p-8 flex flex-col items-center">
                        <h2 className="text-xl font-serif font-light mb-8 text-center" style={{ color: theme.textPrimary }}>
                            Enter Presence
                        </h2>

                        {claimEmail && (
                            <div
                                className="w-full mb-6 p-3.5 rounded-xl border text-center"
                                style={{
                                    background: 'rgba(196,145,58,0.10)',
                                    borderColor: 'rgba(196,145,58,0.35)',
                                }}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: theme.textMuted }}>
                                    Your course is waiting
                                </p>
                                <p className="text-[12.5px] leading-relaxed" style={{ color: theme.textSecondary }}>
                                    Sign in with <strong style={{ color: theme.textPrimary, wordBreak: 'break-all' }}>{claimEmail}</strong> to
                                    unlock Understanding Feelings &amp; Emotions.
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full mb-6 p-3 rounded-xl border flex items-center justify-center"
                                    style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        borderColor: 'rgba(239, 68, 68, 0.2)'
                                    }}
                                >
                                    <p className="text-red-500 text-[12px] font-medium text-center">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Google Sign In - Hero Action */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full group relative flex items-center justify-center gap-3 px-6 py-3 rounded-2xl transition-all active:scale-95 mb-6"
                            style={{
                                background: mode === 'dark' ? 'white' : '#1E1B2E',
                                color: mode === 'dark' ? '#1E1B2E' : 'white',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                        >
                            <LayoutGrid className="w-5 h-5 opacity-80 group-hover:rotate-12 transition-transform" />
                            <span className="text-sm font-bold tracking-wide">Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="w-full flex items-center gap-4 mb-6">
                            <div className="flex-1 h-[1px] opacity-10" style={{ background: theme.textPrimary }} />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30" style={{ color: theme.textSecondary }}>or</span>
                            <div className="flex-1 h-[1px] opacity-10" style={{ background: theme.textPrimary }} />
                        </div>

                        {/* Email Form Toggle */}
                        <button
                            onClick={() => setShowEmailForm(!showEmailForm)}
                            className="w-full flex items-center justify-between px-4 py-2 rounded-xl hover:bg-black/5 transition-colors mb-2"
                        >
                            <span className="text-xs font-bold tracking-widest uppercase opacity-60" style={{ color: theme.textPrimary }}>
                                Use Email Address
                            </span>
                            {showEmailForm ? <ChevronUp className="w-4 h-4 opacity-40" /> : <ChevronDown className="w-4 h-4 opacity-40" />}
                        </button>

                        <AnimatePresence>
                            {showEmailForm && (
                                <motion.form
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="w-full space-y-5 overflow-hidden pt-4"
                                >
                                    {/* Email Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest pl-2 opacity-50" style={{ color: theme.textPrimary }}>Email</label>
                                        <input
                                            type="email"
                                            placeholder="your@soul.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-2xl py-3.5 px-5 text-sm transition-all outline-none"
                                            style={{
                                                background: theme.bgInput,
                                                border: `1.5px solid ${theme.borderDefault}`,
                                                color: theme.textPrimary
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest pl-2 opacity-50" style={{ color: theme.textPrimary }}>Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full rounded-2xl py-3.5 px-5 text-sm transition-all outline-none"
                                                style={{
                                                    background: theme.bgInput,
                                                    border: `1.5px solid ${theme.borderDefault}`,
                                                    color: theme.textPrimary
                                                }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                                                style={{ color: theme.textPrimary }}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Forgot Password */}
                                    {isLogin && (
                                        <AnimatePresence mode="wait">
                                            {forgotSent ? (
                                                <motion.p
                                                    key="sent"
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-[11px] text-center"
                                                    style={{ color: theme.accentPrimary }}
                                                >
                                                    ✨ A reset link has been sent to your soul's inbox.
                                                </motion.p>
                                            ) : (
                                                <motion.button
                                                    key="link"
                                                    type="button"
                                                    onClick={handleForgotPassword}
                                                    disabled={forgotLoading}
                                                    className="w-full text-right text-[11px] font-medium pr-1 opacity-60 hover:opacity-100 transition-opacity"
                                                    style={{ color: theme.accentPrimary }}
                                                    aria-label="Send password reset email"
                                                >
                                                    {forgotLoading ? 'Sending...' : 'Forgot Password?'}
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    )}

                                    {/* Email Action Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white text-xs font-bold py-3 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="tracking-[0.2em] uppercase">{isLogin ? 'Sign In' : 'Create Account'}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* Auth Mode Toggle */}
                        <div className="mt-8">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="px-4 py-2 rounded-full border transition-all text-[10px] font-bold uppercase tracking-widest"
                                style={{
                                    borderColor: theme.borderDefault,
                                    color: theme.textSecondary,
                                    backgroundColor: 'transparent'
                                }}
                            >
                                {isLogin ? (
                                    <span>New here? <span style={{ color: theme.accentPrimary }}>Join the Path</span></span>
                                ) : (
                                    <span>Have an account? <span style={{ color: theme.accentPrimary }}>Log In</span></span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Footer Information */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 flex flex-col items-center gap-4 z-10"
            >
                <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: theme.textPrimary }}>
                    <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
                    <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-20" style={{ color: theme.textPrimary }}>
                    <span>Presence Study</span>
                </div>
            </motion.div>
        </div>
    );
};
