import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import { Sparkles, ArrowRight, Eye, EyeOff, LayoutGrid } from 'lucide-react';

export const SignInScreen = () => {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B0014 0%, #050008 100%)' }}>
            {/* Ambient Background matching app theme */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#C65F9D]/10 blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#ABCEC9]/10 blur-[120px] animate-pulse-slower" />
            </div>

            {/* Ambient Corner Glows - Matching the reference card's environment */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px]" />

            {/* Title Outside Card */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 mb-8 mt-[-10vh]"
            >
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white text-center tracking-wide drop-shadow-lg">
                    Enter Presence
                </h1>
            </motion.div>

            {/* The Main Reference Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 w-full max-w-sm"
            >
                {/* Card Container with Specific Gradient Border/Glow */}
                <div className="relative rounded-[3rem] p-[1px] bg-gradient-to-br from-[#7EE7F9]/50 via-white/10 to-[#C65F9D]/50 shadow-[0_0_40px_rgba(126,231,249,0.1)]">

                    {/* Glass Content Background - Inner Layer */}
                    <div className="relative rounded-[3rem] bg-[#2A2638]/40 backdrop-blur-xl p-8 overflow-hidden h-full flex flex-col items-center">

                        {/* Internal Glow Effects */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-[#7EE7F9]/20 blur-[60px]" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#C65F9D]/20 blur-[60px]" />

                        {/* Icon Box */}
                        <div className="relative w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#C65F9D] to-[#9575CD] flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>

                        {/* Subtitle / Graphic Text */}
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-white text-center leading-tight mb-8 drop-shadow-md">
                            Your Sacred Space
                        </h2>

                        {/* Inputs */}
                        <form onSubmit={handleSubmit} className="w-full space-y-4">
                            {error && (
                                <p className="text-red-300 text-[10px] text-center font-bold tracking-widest uppercase">{error}</p>
                            )}

                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-4 text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/40 transition-all font-sans"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-4 text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/40 transition-all font-sans"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Main Action Button - White Pill */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 bg-white hover:bg-white/90 text-[#1E1B2E] text-sm font-bold py-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-[#1E1B2E] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Google Sign In - Subtle Grid Link */}
                        <div className="mt-6">
                            <button
                                onClick={handleGoogleSignIn}
                                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold tracking-wide group"
                            >
                                <LayoutGrid className="w-4 h-4 group-hover:text-[#C65F9D] transition-colors" />
                                <span>Sign in with Google</span>
                            </button>
                        </div>

                        {/* Toggle Mode */}
                        <div className="mt-6">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white/70 text-[10px] font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
                            >
                                {isLogin ? "Join the Path" : "Log In"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Right Decoration */}
            <div className="absolute bottom-10 right-10 text-white/10">
                <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
        </div>
    );
};
