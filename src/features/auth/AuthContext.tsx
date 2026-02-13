import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signUpWithEmail: (email: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                const userData = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    lastLogin: serverTimestamp()
                };

                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        ...userData,
                        createdAt: serverTimestamp(),
                        level: 1,
                        xp: 0,
                        streak: 0
                    });
                } else {
                    await updateDoc(userRef, {
                        lastLogin: serverTimestamp()
                    });
                }

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
            }
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
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

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
