import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PowerOfNow } from '../soul-intelligence/components/PowerOfNow';


import { isAdminEmail, isUnlockedUser } from '../../config/admin';

interface CoursesHubProps {
    initialChapter?: string;
    onCourseSelect?: (courseId: string | null) => void;
}

<<<<<<< HEAD
export const CoursesHub: React.FC<CoursesHubProps> = ({ initialChapter, onCourseSelect }) => {
    const { user, isAccessValid } = useAuth();
    const { checkOut, isProcessing } = useRazorpay();
    const [activeCourseId, setActiveCourseId] = useState<'power-of-now' | 'untethered'>('power-of-now');
    
    // Admin / Unlocked bypass for Wisdom Untethered
    const isWisdomAuthorized = isAccessValid || (user && (isAdminEmail(user.email) || isUnlockedUser(user.email)));

    const handleUnlock = async () => {
        if (!user) {
            alert("Please sign in first to unlock this journey.");
            return;
        }

        await checkOut(
            user.uid,
            user.email || '',
            user.displayName || 'Seeker',
            'wisdom_untethered',
            () => {
                // Success callback: Firestore is updated by the cloud function
                alert("Success! The path of Wisdom Untethered is now open for you.");
                // The profile state will automatically refresh once Firestore updates (onAuthStateChanged handles it)
            }
        );
    };

=======
export const CoursesHub: React.FC<CoursesHubProps> = ({ initialChapter }) => {
>>>>>>> newUI
    return (
        <div className="w-full flex flex-col min-h-screen">
            {/* Main Content Area: Focusing on Power of Now as requested */}
            <div className="flex-1 w-full mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key="power-of-now"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        <PowerOfNow initialChapter={initialChapter} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

