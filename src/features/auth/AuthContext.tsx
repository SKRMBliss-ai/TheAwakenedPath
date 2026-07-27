import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  signInAnonymously,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db, functions } from '../../firebase';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { hasWisdomAccess, isMonitoredEmail } from '../../config/admin';
import { deductTokens as _deductTokens, buildInitialTokenFields } from '../tokens/tokenService';
import type { FeatureName, DeductResult } from '../tokens/tokenService';
import { useTokenToastStore } from '../../stores/tokenToastStore';

// ─── UserProfile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  level: number;
  xp: number;
  streak: number;
  purchasedCourses: string[];
  subscriptionStatus?: 'ACTIVE' | 'INACTIVE';
  subscriptionId?: string;
  // Pay-what-you-want Mind Gym membership — extended (not replaced) by each
  // membership_monthly/yearly purchase; premium while this is in the future.
  membershipUntil?: any;
  trialUntil?: any;
  createdAt?: any;
  visitCount?: number;
  phoneNumber?: string;
  phonePromptSkippedAt?: any;
  phonePromptSkippedAtVisit?: number;
  phonePromptDismissed?: boolean;
  // ── Token system ──
  tokensTotal?: number;
  tokensUsed?: number;
  tokensRemaining?: number;
  trialActivatedAt?: any;
  trialExpiresAt?: any;
  trialDays?: number;
  entryEmail?: string;
  isAnonymousUser?: boolean;
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  activateTrial: () => Promise<void>;
  isAccessValid: boolean;
  /** True only for genuinely paid/admin users (active subscription, all-access
   *  purchase, or admin email) — NOT merely "within the trial window". Paid
   *  users bypass the token system entirely; trial users do not, even while
   *  isAccessValid is still true from time remaining. */
  isPremiumUser: boolean;
  // ── Token system ──
  tokenBalance: number;
  deductTokens: (cost: number, featureName: FeatureName) => Promise<DeductResult>;
  beginAnonymousPath: (email: string) => Promise<void>;
  upgradeAnonymousUser: (email: string, password: string) => Promise<void>;
  linkWithGoogle: () => Promise<void>;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  activateTrial: async () => {},
  isAccessValid: false,
  isPremiumUser: false,
  tokenBalance: 0,
  deductTokens: async () => ({ success: false, newBalance: 0, error: 'USER_NOT_FOUND' }),
  beginAnonymousPath: async () => {},
  upgradeAnonymousUser: async () => {},
  linkWithGoogle: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Activity logger (monitored accounts only) ─────────────────────────────
  const logActivity = async (currentUser: User, type = 'SESSION_START', overrideEmail?: string) => {
    const emailToCheck = overrideEmail ?? currentUser.email;
    // NOTE: every user's session is now logged (previously only monitored/internal
    // accounts were), so the admin dashboard reflects real usage. It's fire-and-
    // forget upstream, so it never sits on the login critical path.
    try {
      // Geo-locate ONLY internal/monitored accounts: the ipapi.co free tier is
      // rate-limited, and we don't want to store coarse location for the whole
      // user base. Everyone else logs with location 'Unknown'.
      let location = 'Unknown';
      if (isMonitoredEmail(emailToCheck)) {
        try {
          const ac = new AbortController();
          const to = setTimeout(() => ac.abort(), 2500);
          const locRes = await fetch('https://ipapi.co/json/', { signal: ac.signal });
          clearTimeout(to);
          if (locRes.ok) {
            const locData = await locRes.json();
            location =
              `${locData.city || ''}, ${locData.region || ''}, ${locData.country_name || ''}`.trim() ||
              'Unknown';
          }
        } catch (e) {
          console.warn('Location fetch failed/timed out:', e);
        }
      }
      await addDoc(collection(db, 'activity_logs'), {
        userId: currentUser.uid,
        userEmail: emailToCheck,
        entryEmail: overrideEmail ?? null,
        isAnonymous: currentUser.isAnonymous ?? false,
        activityType: type,
        details: type === 'LOGIN' ? 'User logged in' : 'Session started / App opened',
        location,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // ── Handle Google redirect result (mobile Safari uses redirect not popup) ──
  useEffect(() => {
    let retries = 0;
    const maxRetries = 3;

    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('[Auth] Redirect sign-in completed for:', result.user.email);
          const userRef = doc(db, 'users', result.user.uid);
          await updateDoc(userRef, {
            isAnonymous: false,
            email: result.user.email,
            displayName: result.user.displayName ?? (result.user.email ? result.user.email.split('@')[0] : null),
            photoURL: result.user.photoURL,
          }).catch(err => {
            console.warn('[Auth] Failed to sync user doc after redirect:', err);
          });
        }
      } catch (err: any) {
        // Retry on transient errors
        if (retries < maxRetries && err?.code === 'auth/network-request-failed') {
          retries++;
          console.warn('[Auth] Network error checking redirect, retrying...', retries);
          setTimeout(checkRedirectResult, 1000);
        } else if (err?.code !== 'auth/no-pending-redirect') {
          console.error('[Auth] Redirect result error:', err?.code, err?.message);
        }
      }
    };

    // Small delay to ensure auth is ready
    const timer = setTimeout(checkRedirectResult, 100);
    return () => clearTimeout(timer);
  }, []);

  // ── Auth state listener ───────────────────────────────────────────────────
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      try {
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);

          unsubscribeProfile = onSnapshot(userRef, async (snapshot) => {
            if (snapshot.exists()) {
              const d = snapshot.data();
              setProfile({
                uid: currentUser.uid,
                email: currentUser.email ?? d.entryEmail ?? null,
                displayName: currentUser.displayName ?? d.displayName ?? null,
                photoURL: currentUser.photoURL,
                level: d.level ?? 1,
                xp: d.xp ?? 0,
                streak: d.streak ?? 0,
                purchasedCourses: d.purchasedCourses ?? [],
                subscriptionStatus: d.subscriptionStatus,
                subscriptionId: d.subscriptionId,
                membershipUntil: d.membershipUntil,
                trialUntil: d.trialUntil,
                createdAt: d.createdAt,
                visitCount: d.visitCount ?? 0,
                phoneNumber: d.phoneNumber ?? '',
                phonePromptSkippedAt: d.phonePromptSkippedAt,
                phonePromptSkippedAtVisit: d.phonePromptSkippedAtVisit,
                phonePromptDismissed: d.phonePromptDismissed ?? false,
                // Token fields
                tokensTotal: d.tokensTotal ?? 300,
                tokensUsed: d.tokensUsed ?? 0,
                tokensRemaining: d.tokensRemaining ?? 300,
                trialActivatedAt: d.trialActivatedAt,
                trialExpiresAt: d.trialExpiresAt,
                trialDays: d.trialDays ?? 7,
                entryEmail: d.entryEmail,
                isAnonymousUser: d.isAnonymous ?? false,
              });
            } else {
              // New user doc — create with token grant
              const tokenFields = buildInitialTokenFields(7);
              const userData = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
                level: 1,
                xp: 0,
                streak: 0,
                visitCount: 1,
                purchasedCourses: [],
                subscriptionStatus: 'INACTIVE',
                isAnonymous: currentUser.isAnonymous,
                ...tokenFields,
              };
              await setDoc(userRef, userData);
            }
          });

          // Update last-login metadata & log session
          // For non-anonymous users: always track
          // For anonymous users: track only if they have an entryEmail (came via email capture)
          let timezone = 'America/New_York';
          try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) {}

          if (!currentUser.isAnonymous) {
            // These three are all fire-and-forget: the profile is already set
            // (above), so nothing here should sit on the critical path to a
            // usable, correctly-entitled session. Awaiting them made logins wait
            // on a third-party geo-IP fetch (logActivity → ipapi.co) and a
            // possible Cloud-Function cold start (linkGuestPurchases).

            // Kick off guest-purchase linking FIRST so entitlements resolve as
            // early as possible — not queued behind the geo fetch below. The
            // onSnapshot callback re-fires on every profile change, so guard with
            // a per-session flag: at most one call per browser session (a guest
            // purchase made between sessions still links on the next login).
            let alreadyLinkedThisSession = false;
            try { alreadyLinkedThisSession = sessionStorage.getItem('__guest_link_done') === currentUser.uid; } catch (_) {}
            if (!alreadyLinkedThisSession) {
              try { sessionStorage.setItem('__guest_link_done', currentUser.uid); } catch (_) {}
              import('firebase/functions')
                .then(({ httpsCallable }) => httpsCallable(functions, 'linkGuestPurchases')())
                .catch(() => { /* nothing to link, or offline */ });
            }

            updateDoc(userRef, {
              lastLogin: serverTimestamp(),
              timezone,
              visitCount: increment(1),
            }).catch((err) => console.warn('visitCount increment failed:', err));

            // logActivity resolves location via ipapi.co internally; not awaited,
            // so that fetch stays off the critical path.
            void logActivity(currentUser, 'SESSION_START');
          } else {
            // Anonymous path — only track returning visits (not the initial sign-up,
            // which is already handled in beginAnonymousPath)
            try {
              const { getDoc } = await import('firebase/firestore');
              const snap = await getDoc(userRef);
              const entryEmail = snap.data()?.entryEmail;
              const visitCount = snap.data()?.visitCount ?? 1;

              if (entryEmail && visitCount > 1) {
                // Returning visit — update metadata and log (both fire-and-forget)
                updateDoc(userRef, {
                  lastLogin: serverTimestamp(),
                  visitCount: increment(1),
                }).catch(() => {});
                void logActivity(currentUser, 'SESSION_START', entryEmail);
              }
            } catch (_) {}
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Pay-what-you-want membership (extended by membership_monthly/yearly
  // purchases) — premium while membershipUntil is in the future.
  const hasActiveMembership = (p: UserProfile | null) => {
    if (!p?.membershipUntil) return false;
    const untilMs = typeof p.membershipUntil.toDate === 'function'
      ? p.membershipUntil.toDate().getTime()
      : new Date(p.membershipUntil).getTime();
    return untilMs > Date.now();
  };

  // ── isAccessValid ─────────────────────────────────────────────────────────
  const isAccessValid = React.useMemo(() => {
    if (!user || !profile) return false;
    if (hasWisdomAccess(user.email)) return true;
    if (profile.purchasedCourses?.includes('all_access')) return true;
    if (profile.subscriptionStatus === 'ACTIVE') return true;
    if (hasActiveMembership(profile)) return true;

    // Legacy 3-day trial (existing users)
    if (profile.trialUntil) {
      const trialEnd =
        typeof profile.trialUntil.toDate === 'function'
          ? profile.trialUntil.toDate().getTime()
          : profile.trialUntil;
      if (trialEnd > Date.now()) return true;
    }

    // New token trial — valid while trial window open (regardless of token balance)
    if (profile.trialExpiresAt) {
      const expiry =
        typeof profile.trialExpiresAt.toDate === 'function'
          ? profile.trialExpiresAt.toDate().getTime()
          : new Date(profile.trialExpiresAt).getTime();
      if (expiry > Date.now()) return true;
    }

    return false;
  }, [user, profile]);

  // ── isPremiumUser — genuinely paid/admin only, excludes the trial window ──
  // (isAccessValid intentionally stays true through the trial period even at
  // 0 tokens; this narrower flag is what actually exempts someone from the
  // token system and the full-app lock.)
  const isPremiumUser = React.useMemo(() => {
    if (!user || !profile) return false;
    if (hasWisdomAccess(user.email)) return true;
    if (profile.purchasedCourses?.includes('all_access')) return true;
    if (profile.subscriptionStatus === 'ACTIVE') return true;
    if (hasActiveMembership(profile)) return true;
    return false;
  }, [user, profile]);

  // ── Computed token balance ────────────────────────────────────────────────
  const tokenBalance = profile?.tokensRemaining ?? 0;

  // ── Token deduction (wraps service, injects uid) ──────────────────────────
  // Centralised here so every call site (voice guidance, journal, practices,
  // chapters, videos, …) automatically gets: (1) a premium bypass — paid/admin
  // users never spend tokens, and (2) the "tokens used" toast notification.
  const deductTokens = async (cost: number, featureName: FeatureName): Promise<DeductResult> => {
    if (!user) return { success: false, newBalance: 0, error: 'USER_NOT_FOUND' };

    if (isPremiumUser) {
      return { success: true, newBalance: tokenBalance };
    }

    const result = await _deductTokens(user.uid, cost, featureName);
    if (result.success) {
      useTokenToastStore.getState().show(featureName, cost, result.newBalance);
    }
    return result;
  };

  // ── Anonymous entry (email-only onboarding) ───────────────────────────────
  const beginAnonymousPath = async (email: string) => {
    const credential = await signInAnonymously(auth);
    const uid = credential.user.uid;
    const tokenFields = buildInitialTokenFields(7);

    await setDoc(doc(db, 'users', uid), {
      uid,
      entryEmail: email,
      isAnonymous: true,
      email: null,
      displayName: null,
      photoURL: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
      level: 1,
      xp: 0,
      streak: 0,
      visitCount: 1,
      purchasedCourses: [],
      subscriptionStatus: 'INACTIVE',
      ...tokenFields,
    });

    // Log session for anonymous users using their entryEmail so admin can identify them
    await logActivity(credential.user, 'SESSION_START', email);
  };

  // ── Upgrade anonymous → email+password ────────────────────────────────────
  const upgradeAnonymousUser = async (email: string, password: string) => {
    if (!user || !user.isAnonymous) throw new Error('Not an anonymous user');
    const credential = EmailAuthProvider.credential(email, password);
    try {
      await linkWithCredential(user, credential);
      await updateDoc(doc(db, 'users', user.uid), {
        isAnonymous: false,
        email,
        displayName: email.split('@')[0],
      });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') throw new Error('ACCOUNT_EXISTS');
      throw err;
    }
  };

  // ── Upgrade anonymous → Google ────────────────────────────────────────────
  const linkWithGoogle = async () => {
    if (!user || !user.isAnonymous) throw new Error('Not an anonymous user');
    const provider = new GoogleAuthProvider();
    try {
      await linkWithPopup(user, provider);
      await updateDoc(doc(db, 'users', user.uid), { isAnonymous: false });
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') throw new Error('ACCOUNT_EXISTS');
      throw err;
    }
  };

  // ── Auth actions ──────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Ensure scopes are requested
    provider.addScope('profile');
    provider.addScope('email');

    try {
      // Use popup for all platforms to avoid Safari ITP cross-domain redirect issues
      console.log('[Auth] Using popup flow for Google sign-in');
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('[Auth] Google sign-in error:', err?.code, err?.message);
      // Re-throw with user-friendly message
      if (err?.code === 'auth/popup-blocked') {
        throw new Error('Google sign-in popup was blocked. Please allow popups and try again.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        throw new Error('Google sign-in was cancelled. Please try again.');
      } else if (err?.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const activateTrial = async () => {
    if (!user) return;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    await updateDoc(doc(db, 'users', user.uid), { trialUntil: trialEndDate });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPassword,
        activateTrial,
        isAccessValid,
        isPremiumUser,
        tokenBalance,
        deductTokens,
        beginAnonymousPath,
        upgradeAnonymousUser,
        linkWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
