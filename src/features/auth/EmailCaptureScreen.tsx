import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useTheme } from '../../theme/ThemeSystem';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import appLogo from '../../assets/logo.webp';
import { CrystalPyramid } from '../../components/ui/CrystalPyramid';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getSuggestion,
  validateEmailLocally,
  checkMxRecords,
} from '../../utils/emailValidation';

interface EmailCaptureScreenProps {
  onShowSignIn?: () => void;
}

function toFriendlyError(err: any): string {
  const code = err?.code || '';
  if (code === 'auth/admin-restricted-operation')
    return 'Anonymous sign-in is not enabled. Please use Google to continue, or contact support.';
  if (code === 'auth/email-already-in-use')
    return 'This email is already registered. Use "Sign in" below instead.';
  if (code === 'auth/invalid-email')
    return 'Please enter a valid email address.';
  if (code === 'auth/network-request-failed')
    return 'No connection. Please check your network and try again.';
  if (code === 'auth/too-many-requests')
    return 'Too many attempts. Please wait a moment and try again.';
  return err?.message || 'Something went wrong. Please try again.';
}

export const EmailCaptureScreen = ({ onShowSignIn }: EmailCaptureScreenProps) => {
  const { beginAnonymousPath, signInWithGoogle } = useAuth();
  const { theme, mode } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mxChecking, setMxChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Auto-trigger Google sign-in if redirected from iframe with ?google=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === '1') {
      // Remove param from URL cleanly
      window.history.replaceState({}, '', window.location.pathname);
      signInWithGoogle().catch(() => {});
    }
  }, []);

  const handleEmailChange = (v: string) => {
    setEmail(v);
    setError('');
    setSuggestion(getSuggestion(v));
  };

  const handleBegin = async (e: React.FormEvent) => {
    e.preventDefault();
    const localError = validateEmailLocally(email);
    if (localError) { setError(localError); return; }

    // MX record check — verifies the domain has a mail server
    const domain = email.trim().toLowerCase().split('@')[1];
    setMxChecking(true);
    const hasMx = await checkMxRecords(domain);
    setMxChecking(false);
    if (!hasMx) {
      setError(`"${domain}" doesn't appear to have email configured. Please use your real email address.`);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();
      await beginAnonymousPath(cleanEmail);
      // Store in waitlist for daily email campaigns
      await addDoc(collection(db, 'waitlist'), {
        email: cleanEmail,
        source: 'app_signup',
        mailingList: true,
        createdAt: serverTimestamp(),
      }).catch(() => {}); // non-blocking
      setSuccess(true);
    } catch (err: any) {
      setError(toFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');

    // If running inside an iframe (e.g. embedded on skrmblissai.in via Systeme.io),
    // Google OAuth will fail — Google blocks auth in cross-origin iframes.
    // Break out to the standalone app URL so sign-in works correctly.
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      try {
        // Try to navigate the parent window to the standalone app
        window.top!.location.href = 'https://awakened-path-2026.web.app/?google=1';
      } catch {
        // If parent access is blocked, open in new tab
        window.open('https://awakened-path-2026.web.app/?google=1', '_blank');
      }
      return;
    }

    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(toFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ background: theme.bgGradient }}
    >
      {/* Ambient glows */}
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

      {/* Two-column layout: form left, crystal right (split on md+) */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">

        {/* ── Left / main column ── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:pl-12 md:pr-6">

      {/* Identity */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center mb-8"
      >
        <div className="w-20 h-20 mb-4 rounded-2xl p-1 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-xl flex items-center justify-center">
          <img src={appLogo} alt="Logo" className="w-full h-full object-contain rounded-xl bg-black/20" />
        </div>
        <h1
          className="text-2xl font-serif font-bold tracking-[0.15em] uppercase text-center"
          style={{ color: theme.textPrimary }}
        >
          Mind Gym
        </h1>
        <p
          className="text-[12px] font-sans font-medium tracking-[0.3em] uppercase mt-2 opacity-75"
          style={{ color: theme.textSecondary }}
        >
          A Presence Study
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div
          className="relative rounded-[24px] overflow-hidden shadow-2xl"
          style={{
            background: theme.bgSurface,
            border: `1.5px solid ${theme.borderGlass}`,
            backdropFilter: theme.blur,
            boxShadow: mode === 'dark' ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.1)',
          }}
        >
          <div className="p-8 flex flex-col items-center">

            <h2
              className="text-2xl font-serif font-light mb-8 text-center tracking-wide"
              style={{ color: theme.textPrimary }}
            >
              Begin Your Path
            </h2>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mb-4 p-3 rounded-xl border"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}
                >
                  <p className="text-red-500 text-[12px] font-medium text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email form */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center py-6"
                >
                  <div className="text-3xl mb-3">✨</div>
                  <p className="font-serif text-lg" style={{ color: theme.textPrimary }}>
                    Entering Presence…
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleBegin}
                  className="w-full space-y-4"
                >
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-bold uppercase tracking-widest pl-2 opacity-50"
                      style={{ color: theme.textPrimary }}
                    >
                      Your Email
                    </label>
                    <p className="text-[11px] leading-snug pl-2 pr-1 opacity-60" style={{ color: theme.textSecondary }}>
                      Just enter your email to step straight into Mind Gym — no username or password to create.
                    </p>
                    <input
                      type="text"
                      placeholder="your@soul.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className="w-full rounded-2xl py-3.5 px-5 text-sm transition-all outline-none"
                      style={{
                        background: theme.bgInput,
                        border: `1.5px solid ${error ? 'rgba(239,68,68,0.6)' : suggestion ? 'rgba(251,191,36,0.5)' : theme.borderDefault}`,
                        color: theme.textPrimary,
                      }}
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                    {suggestion && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 px-3 py-2 rounded-xl flex items-center justify-between gap-2"
                        style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}
                      >
                        <span className="text-[11px] text-yellow-400">
                          Did you mean <strong>{suggestion}</strong>?
                        </span>
                        <button
                          type="button"
                          onClick={() => { setEmail(suggestion); setSuggestion(null); setError(''); }}
                          className="text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          Fix
                        </button>
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || mxChecking}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl transition-all active:scale-95 text-sm font-bold tracking-wide"
                    style={{
                      background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                      color: '#fff',
                      boxShadow: '0 4px 20px rgba(94,196,176,0.3)',
                    }}
                  >
                    {mxChecking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying email…</span>
                      </>
                    ) : loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Begin My Path</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="w-full flex items-center gap-4 my-5">
              <div className="flex-1 h-[1px] opacity-10" style={{ background: theme.textPrimary }} />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-30" style={{ color: theme.textSecondary }}>or</span>
              <div className="flex-1 h-[1px] opacity-10" style={{ background: theme.textPrimary }} />
            </div>

            {/* Google shortcut */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-2xl transition-all active:scale-95 mb-4"
              style={{
                background: mode === 'dark' ? 'white' : '#1E1B2E',
                color: mode === 'dark' ? '#1E1B2E' : 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }}
            >
              <LayoutGrid className="w-5 h-5 opacity-80" />
              <span className="text-sm font-bold tracking-wide">Continue with Google</span>
            </button>

            {/* Already have an account */}
            <button
              onClick={onShowSignIn}
              className="text-[13px] font-medium opacity-65 hover:opacity-90 transition-opacity mb-6"
              style={{ color: theme.textSecondary }}
            >
              Already have an account?{' '}
              <span className="font-semibold" style={{ color: theme.accentPrimary }}>Sign in</span>
            </button>

          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 flex flex-col items-center gap-3 z-10"
      >
        <p className="text-[11px] font-medium tracking-wide opacity-45 text-center" style={{ color: theme.textPrimary }}>
          No credit card · Cancel anytime · Your data is private
        </p>
      </motion.div>

        </div>{/* end left column */}

        {/* ── Right column: Crystal (desktop only) ── */}
        <div className="hidden md:flex flex-col items-center justify-center w-[48%] px-10 relative">
          <CrystalPyramid className="w-full max-w-[360px]" />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="text-center mt-2 space-y-2"
          >
            <p
              className="text-[clamp(18px,2vw,26px)] font-serif font-light leading-snug tracking-wide"
              style={{ color: theme.textPrimary }}
            >
              Presence is<br />
              <span style={{ color: theme.accentPrimary }}>your power.</span>
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-35"
              style={{ color: theme.textSecondary }}
            >
              Mind Gym
            </p>
          </motion.div>
        </div>

      </div>{/* end two-column flex */}
    </div>
  );
};
