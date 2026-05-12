import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../../theme/ThemeSystem';
import { useTokens } from './useTokens';
import { LayoutGrid, ArrowRight, Lock } from 'lucide-react';

interface PaymentWallProps {
  onClose?: () => void;
  onNavigateToPlans?: () => void;
}

export function PaymentWall({ onClose, onNavigateToPlans }: PaymentWallProps) {
  const { user, upgradeAnonymousUser, linkWithGoogle } = useAuth();
  const { theme, mode } = useTheme();
  const { tokensUsed, trialExpiresAt } = useTokens();

  const [view, setView] = useState<'wall' | 'secure'>('wall');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAnon = user?.isAnonymous ?? true;

  const handleSecureEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await upgradeAnonymousUser(email, password);
      onNavigateToPlans?.();
    } catch (err: any) {
      if (err.message === 'ACCOUNT_EXISTS') {
        setError('This email already has an account. Sign in instead.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleUpgrade = async () => {
    setError('');
    setLoading(true);
    try {
      await linkWithGoogle();
      onNavigateToPlans?.();
    } catch (err: any) {
      if (err.message === 'ACCOUNT_EXISTS') {
        setError('This Google account is already linked to another profile.');
      } else {
        setError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const daysUsed = trialExpiresAt
    ? (() => {
        const expiry =
          typeof trialExpiresAt.toDate === 'function'
            ? trialExpiresAt.toDate().getTime()
            : new Date(trialExpiresAt).getTime();
        const start = expiry - 7 * 24 * 60 * 60 * 1000;
        return Math.min(7, Math.ceil((Date.now() - start) / (1000 * 60 * 60 * 24)));
      })()
    : 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 overflow-y-auto"
      style={{ background: mode === 'dark' ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)' }}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-lg opacity-40 hover:opacity-100 transition-opacity"
          style={{ background: theme.bgSurface, color: theme.textPrimary }}
        >
          ×
        </button>
      )}

      {view === 'wall' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center text-center"
        >
          {/* Lock icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Lock className="w-7 h-7 text-red-500" />
          </div>

          <h2 className="text-2xl font-serif mb-2" style={{ color: theme.textPrimary }}>
            Your Tokens Have Run Out
          </h2>
          <p className="text-sm opacity-60 mb-2" style={{ color: theme.textSecondary }}>
            You used <strong>{tokensUsed} tokens</strong> across {daysUsed} days of practice.
          </p>
          <p className="text-sm opacity-60 mb-8" style={{ color: theme.textSecondary }}>
            Upgrade to continue your journey with unlimited access.
          </p>

          {/* Plan teaser */}
          <div
            className="w-full rounded-2xl p-5 mb-6 text-left"
            style={{ background: theme.bgSurface, border: `1px solid ${theme.borderGlass}` }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: theme.accentPrimary }}>
              What you unlock
            </p>
            {[
              'Unlimited voice guidance sessions',
              'All situational practices',
              'Wisdom Untethered full course',
              'Power of Now course',
              'Unlimited journaling',
              'Sacred soundscapes',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 mb-2">
                <span style={{ color: theme.accentPrimary }}>✓</span>
                <span className="text-sm" style={{ color: theme.textPrimary }}>{item}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isAnon ? (
            <button
              onClick={() => setView('secure')}
              className="w-full py-4 rounded-2xl font-bold tracking-wide text-sm flex items-center justify-center gap-2 mb-3 transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                color: '#fff',
                boxShadow: '0 4px 20px rgba(94,196,176,0.3)',
              }}
            >
              Secure My Journey & Choose Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNavigateToPlans}
              className="w-full py-4 rounded-2xl font-bold tracking-wide text-sm flex items-center justify-center gap-2 mb-3 transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`,
                color: '#fff',
                boxShadow: '0 4px 20px rgba(94,196,176,0.3)',
              }}
            >
              View Plans
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <p className="text-[10px] opacity-30" style={{ color: theme.textSecondary }}>
            Soundscape tracks available as individual purchases
          </p>
        </motion.div>
      ) : (
        /* ── Secure account before payment ── */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <button
            onClick={() => setView('wall')}
            className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity mb-6 flex items-center gap-1"
            style={{ color: theme.textSecondary }}
          >
            ← Back
          </button>

          <h2 className="text-2xl font-serif mb-2 text-center" style={{ color: theme.textPrimary }}>
            Secure Your Journey
          </h2>
          <p className="text-sm opacity-60 mb-6 text-center" style={{ color: theme.textSecondary }}>
            Your progress, journal entries and streak will be saved to your account.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-red-500 text-[12px] text-center">{error}</p>
            </div>
          )}

          {/* Google upgrade */}
          <button
            onClick={handleGoogleUpgrade}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-2xl mb-5 transition-all active:scale-95"
            style={{ background: mode === 'dark' ? 'white' : '#1E1B2E', color: mode === 'dark' ? '#1E1B2E' : 'white' }}
          >
            <LayoutGrid className="w-5 h-5 opacity-80" />
            <span className="text-sm font-bold tracking-wide">Continue with Google</span>
          </button>

          <div className="w-full flex items-center gap-4 mb-5">
            <div className="flex-1 h-[1px] opacity-10" style={{ background: theme.textPrimary }} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30" style={{ color: theme.textSecondary }}>or email</span>
            <div className="flex-1 h-[1px] opacity-10" style={{ background: theme.textPrimary }} />
          </div>

          {/* Email + password */}
          <form onSubmit={handleSecureEmail} className="space-y-4">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl py-3.5 px-5 text-sm outline-none"
              style={{ background: theme.bgInput, border: `1.5px solid ${theme.borderDefault}`, color: theme.textPrimary }}
              required
            />
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl py-3.5 px-5 text-sm outline-none"
              style={{ background: theme.bgInput, border: `1.5px solid ${theme.borderDefault}`, color: theme.textPrimary }}
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))`, color: '#fff' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Save & Choose Plan <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
