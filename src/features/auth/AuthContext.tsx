import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
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
import { auth, db } from '../../firebase';
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
    if (!isMonitoredEmail(emailToCheck)) return;
    try {
      let location = 'Unknown';
      try {
        const locRes = await fetch('https://ipapi.co/json/');
        if (locRes.ok) {
          const locData = await locRes.json();
          location =
            `${locData.city || ''}, ${locData.region || ''}, ${locData.country_name || ''}`.trim() ||
            'Unknown';
        }
      } catch (e) {
        console.warn('Location fetch failed:', e);
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
    getRedirectResult(auth).then(result => {
      if (result?.user) {
        console.log('[Auth] Redirect sign-in completed for:', result.user.email);
      }
    }).catch(err => {
      // Only log real errors, not the "no pending redirect" case
      if (err?.code !== 'auth/no-pending-redirect') {
        console.error('[Auth] Redirect result error:', err?.code);
      }
    });
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
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
              timezone,
              visitCount: increment(1),
            }).catch((err) => console.warn('visitCount increment failed:', err));

            await logActivity(currentUser, 'SESSION_START');
          } else {
            // Anonymous path — only track returning visits (not the initial sign-up,
            // which is already handled in beginAnonymousPath)
            try {
              const { getDoc } = await import('firebase/firestore');
              const snap = await getDoc(userRef);
              const entryEmail = snap.data()?.entryEmail;
              const visitCount = snap.data()?.visitCount ?? 1;

              if (entryEmail && visitCount > 1) {
                // Returning visit — update metadata and log
                await updateDoc(userRef, {
                  lastLogin: serverTimestamp(),
                  visitCount: increment(1),
                }).catch(() => {});
                await logActivity(currentUser, 'SESSION_START', entryEmail);
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

  // ── isAccessValid ─────────────────────────────────────────────────────────
  const isAccessValid = React.useMemo(() => {
    if (!user || !profile) return false;
    if (hasWisdomAccess(user.email)) return true;
    if (profile.purchasedCourses?.includes('all_access')) return true;
    if (profile.subscriptionStatus === 'ACTIVE') return true;

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

  // ── Computed token balance ────────────────────────────────────────────────
  const tokenBalance = profile?.tokensRemaining ?? 0;

  // ── Token deduction (wraps service, injects uid) ──────────────────────────
  const deductTokens = async (cost: number, featureName: FeatureName): Promise<DeductResult> => {
    if (!user) return { success: false, newBalance: 0, error: 'USER_NOT_FOUND' };
    return _deductTokens(user.uid, cost, featureName);
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
    // Mobile Safari blocks popups → use redirect flow to avoid getting stuck on /__/auth/handler
    const isMobileSafari = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (/Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent));
    if (isMobileSafari) {
      await signInWithRedirect(auth, provider); // full-page redirect — handled by getRedirectResult above
    } else {
      await signInWithPopup(auth, provider);
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
