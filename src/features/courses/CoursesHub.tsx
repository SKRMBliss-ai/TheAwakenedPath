import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PowerOfNow } from '../soul-intelligence/components/PowerOfNow';

interface CoursesHubProps {
    initialChapter?: string;
    onCourseSelect?: (courseId: string | null) => void;
}

export const CoursesHub: React.FC<CoursesHubProps> = ({ initialChapter }) => {
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
