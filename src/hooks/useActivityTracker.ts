import { useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { isMonitoredEmail } from '../config/admin';

export const useActivityTracker = (activeTab: string, details?: any) => {
    const { user } = useAuth();
    const lastTracked = useRef<{ tab: string; details: string }>({ tab: '', details: '' });

    const logEvent = async (type: string, eventDetails: any = {}) => {
        if (!user || !isMonitoredEmail(user.email)) return;

        try {
            // Include location if possible (cached in session or fetched once)
            let location = localStorage.getItem('user_location') || 'Unknown';
            
            await addDoc(collection(db, 'activity_logs'), {
                userId: user.uid,
                userEmail: user.email,
                activityType: type,
                details: typeof eventDetails === 'string' ? eventDetails : JSON.stringify(eventDetails),
                location,
                timestamp: serverTimestamp(),
                platform: 'web',
                userAgent: navigator.userAgent,
                source: 'tracker'
            });
        } catch (error) {
            console.error('[ActivityTracker] Error logging:', error);
        }
    };

    useEffect(() => {
        if (!user || !activeTab) return;

        const currentDetails = {
            page: activeTab,
            ...details
        };
        const detailsStr = JSON.stringify(currentDetails);
        
        if (lastTracked.current.details === detailsStr) return;

        logEvent('PAGE_VIEW', currentDetails);
        lastTracked.current.details = detailsStr;
    }, [activeTab, JSON.stringify(details), user]);

    return { logEvent };
};
