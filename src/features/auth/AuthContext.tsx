import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { hasWisdomAccess, isMonitoredEmail } from '../../config/admin';
interface UserProfile {
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
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signUpWithEmail: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
    activateTrial: () => Promise<void>;
    isAccessValid: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    signOut: async () => { },
    activateTrial: async () => { },
    isAccessValid: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const logActivity = async (currentUser: User, type: string = 'SESSION_START') => {
        if (!isMonitoredEmail(currentUser.email)) return;
        try {
            let location = 'Unknown';
            try {
                const locRes = await fetch('https://ipapi.co/json/');
                if (locRes.ok) {
                    const locData = await locRes.json();
                    location = `${locData.city || ''}, ${locData.region || ''}, ${locData.country_name || ''}`.trim() || 'Unknown';
                }
            } catch (e) {
                console.warn("Location fetch failed:", e);
            }

            await addDoc(collection(db, 'activity_logs'), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                activityType: type,
                details: type === 'LOGIN' ? 'User logged in' : 'Session started / App opened',
                location: location,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

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
                            const data = snapshot.data();
                            setProfile({
                                uid: currentUser.uid,
                                email: currentUser.email,
                                displayName: currentUser.displayName,
                                photoURL: currentUser.photoURL,
                                level: data?.level || 1,
                                xp: data?.xp || 0,
                                streak: data?.streak || 0,
                                purchasedCourses: data?.purchasedCourses || [],
                                subscriptionStatus: data?.subscriptionStatus,
                                subscriptionId: data?.subscriptionId,
                                trialUntil: data?.trialUntil,
                                createdAt: data?.createdAt,
                            } as UserProfile);
                        } else {
                            const userData = {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                displayName: currentUser.displayName,
                                photoURL: currentUser.photoURL,
                                createdAt: serverTimestamp(),
                                lastLogin: serverTimestamp(),
                                level: 1,
                                xp: 0,
                                streak: 0,
                                purchasedCourses: [],
                                subscriptionStatus: 'INACTIVE'
                            };
                            await setDoc(userRef, userData);
                        }
                    });

                    await updateDoc(userRef, {
                        lastLogin: serverTimestamp()
                    }).catch(() => {});

                    await logActivity(currentUser, 'SESSION_START');
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
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

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, pass: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error("Error signing in with Email", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, pass: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error("Error signing up with Email", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const activateTrial = async () => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 3);
        await updateDoc(userRef, {
            trialUntil: trialEndDate
        });
    };

    const isAccessValid = React.useMemo(() => {
        if (!user || !profile) return false;
        if (hasWisdomAccess(user.email)) return true;
        if (profile.purchasedCourses?.includes('all_access')) return true;
        if (profile.subscriptionStatus === 'ACTIVE') return true;
        
        if (profile.trialUntil) {
            const trialEnd = typeof profile.trialUntil.toDate === 'function' ? profile.trialUntil.toDate().getTime() : profile.trialUntil;
            if (trialEnd > Date.now()) return true;
        }

        return false;
    }, [user, profile]);

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, activateTrial, isAccessValid }}>
            {children}
        </AuthContext.Provider>
    );
};

