import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../auth/AuthContext';
import {
    ACHIEVEMENTS,
    POINT_EVENTS,
    type UserStats,
    type Achievement
} from './achievementsDefs';
import { isUnlockedUser } from '../../config/admin';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AchievementsState {
    unlocked: string[];
    points: number;
    loading: boolean;
    toastQueue: Achievement[];
}

export interface AchievementsContextValue extends AchievementsState {
    awardEvent: (eventKey: string) => Promise<void>;
    checkAndUnlock: (stats: UserStats) => Promise<string[]>;
    dismissToast: () => void;
}

const AchievementsContext = createContext<AchievementsContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [state, setState] = useState<AchievementsState>({
        unlocked: [],
        points: 0,
        loading: true,
        toastQueue: [],
    });

    // Load from Firestore
    useEffect(() => {
        if (!user) return;
        const ref = doc(db, 'users', user.uid, 'meta', 'achievements');
        getDoc(ref).then((snap) => {
            const isAlwaysUnlocked = isUnlockedUser(user.email);
            const allAchIds = ACHIEVEMENTS.map(a => a.id);

            if (snap.exists()) {
                const data = snap.data();
                setState(prev => ({
                    ...prev,
                    unlocked: isAlwaysUnlocked ? allAchIds : (data.unlocked ?? []),
                    points: data.points ?? 0,
                    loading: false,
                }));
            } else {
                setDoc(ref, { unlocked: [], points: 0, pointsLog: [] });
                setState(prev => ({ 
                    ...prev, 
                    unlocked: isAlwaysUnlocked ? allAchIds : [], 
                    points: 0, 
                    loading: false 
                }));
            }
        });
    }, [user]);

    // Award points
    const awardEvent = useCallback(async (eventKey: string) => {
        if (!user) return;
        const pts = POINT_EVENTS[eventKey];
        if (!pts) return;

        const ref = doc(db, 'users', user.uid, 'meta', 'achievements');
        await updateDoc(ref, {
            points: increment(pts),
            pointsLog: arrayUnion({ event: eventKey, pts, ts: Date.now() }),
        });
        setState((prev) => ({ ...prev, points: prev.points + pts }));
    }, [user]);

    // Check criteria and unlock (+ enqueue toasts)
    const checkAndUnlock = useCallback(async (stats: UserStats): Promise<string[]> => {
        if (!user) return [];

        const newlyUnlockedIds: string[] = [];
        const newlyUnlockedToasts: Achievement[] = [];

        for (const ach of ACHIEVEMENTS) {
            if (state.unlocked.includes(ach.id)) continue;
            if (ach.check(stats)) {
                newlyUnlockedIds.push(ach.id);
                newlyUnlockedToasts.push(ach);
            }
        }

        if (newlyUnlockedIds.length > 0) {
            const totalBonus = newlyUnlockedToasts.reduce((sum, ach) => sum + ach.points, 0);
            const ref = doc(db, 'users', user.uid, 'meta', 'achievements');

            await updateDoc(ref, {
                unlocked: arrayUnion(...newlyUnlockedIds),
                points: increment(totalBonus),
            });

            setState((prev) => ({
                ...prev,
                unlocked: [...prev.unlocked, ...newlyUnlockedIds],
                points: prev.points + totalBonus,
                toastQueue: [...prev.toastQueue, ...newlyUnlockedToasts],
            }));
        }

        return newlyUnlockedIds;
    }, [user, state.unlocked]);

    const dismissToast = useCallback(() => {
        setState(prev => ({ ...prev, toastQueue: prev.toastQueue.slice(1) }));
    }, []);

    return (
        <AchievementsContext.Provider value={{ ...state, awardEvent, checkAndUnlock, dismissToast }}>
            {children}
        </AchievementsContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAchievements() {
    const context = useContext(AchievementsContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementsProvider');
    }
    return context;
}
