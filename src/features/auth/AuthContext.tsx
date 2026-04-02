import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc, updateDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { hasWisdomAccess } from '../../config/admin';
interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    level: number;
    xp: number;
    streak: number;
    purchasedCourses: string[];
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
    isAccessValid: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
                    
                    // Use onSnapshot for real-time profile updates (e.g. course purchases)
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
                                createdAt: data?.createdAt,
                            } as UserProfile);
                        } else {
                            // Initialize profile if it doesn't exist
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
                                purchasedCourses: []
                            };
                            await setDoc(userRef, userData);
                            // snapshot will fire again after this
                        }
                    });

                    // Update last login
                    await updateDoc(userRef, {
                        lastLogin: serverTimestamp()
                    }).catch(() => {}); // Ignore error if doc just created

                    // Log Activity
                    try {
                        await addDoc(collection(db, 'activity_logs'), {
                            userId: currentUser.uid,
                            userEmail: currentUser.email,
                            activityType: 'LOGIN',
                            details: 'User logged in',
                            timestamp: serverTimestamp()
                        });
                    } catch (error) {
                        console.error("Error logging activity:", error);
                    }
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

    const isAccessValid = React.useMemo(() => {
        if (!user || !profile) return false;
        if (hasWisdomAccess(user.email)) return true;
        if (profile.purchasedCourses?.includes('all_access')) return true;
        
        if (profile.createdAt) {
            let createdDate;
            if (profile.createdAt?.toDate) {
                createdDate = profile.createdAt.toDate();
            } else if (typeof profile.createdAt === 'string' || typeof profile.createdAt === 'number') {
                createdDate = new Date(profile.createdAt);
            } else {
                return false;
            }
            const trialLimit = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - createdDate.getTime() <= trialLimit) {
                return true;
            }
        }
        return false;
    }, [user, profile]);

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, isAccessValid }}>
            {children}
        </AuthContext.Provider>
    );
};

