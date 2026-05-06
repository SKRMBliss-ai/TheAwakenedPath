import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useTheme } from '../../theme/ThemeSystem';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import appLogo from '../../assets/logo.webp';

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

const TRIAL_FEATURES = [
  { icon: '🎙️', label: 'Voice Guidance' },
  { icon: '🧘', label: 'All Practices' },
  { icon: '📖', label: 'Wisdom Library' },
  { icon: '📓', label: 'Daily Journal' },
];

const BLOCKED_DOMAINS = new Set(['mailinator.com','guerrillamail.com','temp-mail.org','throwam.com','fakeinbox.com','yopmail.com','trashmail.com','maildrop.cc','sharklasers.com','dispostable.com','spamgourmet.com','getairmail.com','trashmail.me','spam4.me','tempinbox.com','throwaway.email','emailondeck.com']);

const VALID_TLDS = new Set(['com','org','net','edu','gov','io','ai','co','app','dev','me','info','biz','in','uk','us','de','fr','au','ca','jp','cn','br','ru','it','es','nl','pl','pt','se','no','dk','fi','be','ch','at','nz','mx','sg','hk','ae','sa','za','ng','ke','pro','tech','online','site','store','shop','blog','cloud','digital','email','media','studio','live','world','today','space','academy','id']);

const TYPO_MAP: Record<string, string> = {
  'gmail.coma':'gmail.com','gmail.con':'gmail.com','gmail.cm':'gmail.com','gmail.ocm':'gmail.com',
  'gmai.com':'gmail.com','gmal.com':'gmail.com','gmial.com':'gmail.com','gmali.com':'gmail.com',
  'gnail.com':'gmail.com','gamil.com':'gmail.com','gmail.co':'gmail.com',
  'yahoo.coma':'yahoo.com','yahoo.con':'yahoo.com','yhoo.com':'yahoo.com','yaho.com':'yahoo.com',
  'hotmail.coma':'hotmail.com','hotmail.con':'hotmail.com','hotmal.com':'hotmail.com','hotmial.com':'hotmail.com',
  'outlook.coma':'outlook.com','outlook.con':'outlook.com','outlok.com':'outlook.com',
  'icloud.coma':'icloud.com','icloud.con':'icloud.com',
};

export const EmailCaptureScreen = ({ onShowSignIn }: EmailCaptureScreenProps) => {
  const { beginAnonymousPath, signInWithGoogle } = useAuth();
  const { theme, mode } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const getSuggestion = (v: string): string | null => {
    const domain = v.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    const correct = TYPO_MAP[domain];
    return correct ? v.split('@')[0] + '@' + correct : null;
  };

  const validateEmail = (v: string): string | null => {
    const trimmed = v.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(trimmed)) return 'Please enter a valid email address.';
    const parts = trimmed.split('@');
    const domain = parts[1];
    const tld = domain.split('.').pop() ?? '';
    if (!VALID_TLDS.has(tld)) return `".${tld}" doesn't look like a real email domain. Please use your actual email.`;
    if (BLOCKED_DOMAINS.has(domain)) return 'Please use your real email — disposable addresses are not allowed.';
    return null;
  };

  const handleEmailChange = (v: string) => {
    setEmail(v);
    setError('');
    setSuggestion(getSuggestion(v));
  };

  const handleBegin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await beginAnonymousPath(email.toLowerCase().trim());
      setSuccess(true);
    } catch (err: any) {
      setError(toFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
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
      className="min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden p-6"
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
          The Awakened Path
        </h1>
        <p
          className="text-[10px] font-sans font-bold tracking-[0.4em] uppercase mt-2 opacity-60"
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

            {/* ── Trial teaser – premium design ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="w-full mb-6"
            >
              {/* Gradient border wrapper */}
              <div
                className="relative rounded-[18px] p-[1px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(94,196,176,0.55) 0%, rgba(94,196,176,0.08) 50%, rgba(94,196,176,0.35) 100%)',
                }}
              >
                <div
                  className="rounded-[17px] px-4 pt-4 pb-3"
                  style={{
                    background: mode === 'dark'
                      ? 'linear-gradient(160deg, rgba(20,28,26,0.95) 0%, rgba(12,14,16,0.95) 100%)'
                      : 'linear-gradient(160deg, rgba(240,252,250,0.95) 0%, rgba(228,248,244,0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Top row: label + badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm leading-none">✨</span>
                      <span
                        className="text-[11px] font-black tracking-[0.18em] uppercase"
                        style={{ color: theme.accentPrimary }}
                      >
                        7-Day Free Trial
                      </span>
                    </div>
                    <div
                      className="px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase"
                      style={{
                        background: 'rgba(94,196,176,0.15)',
                        color: theme.accentPrimary,
                        border: '1px solid rgba(94,196,176,0.3)',
                      }}
                    >
                      No Card
                    </div>
                  </div>

                  {/* Token count */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span
                      className="text-[32px] leading-none font-serif font-light tracking-tight"
                      style={{ color: theme.textPrimary }}
                    >
                      300
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1"
                      style={{ color: theme.textSecondary }}
                    >
                      tokens · all features unlocked
                    </span>
                  </div>

                  {/* Feature pills */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {TRIAL_FEATURES.map((f) => (
                      <div
                        key={f.label}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                        style={{
                          background: 'rgba(94,196,176,0.06)',
                          border: '1px solid rgba(94,196,176,0.12)',
                        }}
                      >
                        <span className="text-[12px] leading-none">{f.icon}</span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider opacity-60"
                          style={{ color: theme.textSecondary }}
                        >
                          {f.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <h2
              className="text-xl font-serif font-light mb-6 text-center"
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
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl transition-all active:scale-95 text-sm font-bold tracking-wide"
                    style={{
                      background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                      color: '#fff',
                      boxShadow: '0 4px 20px rgba(94,196,176,0.3)',
                    }}
                  >
                    {loading ? (
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
              className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity"
              style={{ color: theme.textSecondary }}
            >
              Already have an account? <span style={{ color: theme.accentPrimary }}>Sign in</span>
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
        <p className="text-[9px] font-bold uppercase tracking-widest opacity-20 text-center" style={{ color: theme.textPrimary }}>
          No credit card · Cancel anytime · Your data is private
        </p>
      </motion.div>
    </div>
  );
};
