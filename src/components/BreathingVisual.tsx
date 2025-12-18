import { motion } from 'framer-motion';

export const BreathingVisual = () => {
    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
                className="absolute w-full h-full bg-cyan-400/30 rounded-full blur-2xl"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
                className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.4)] flex items-center justify-center z-10"
            >
                <span className="text-white font-medium tracking-widest text-sm uppercase">Breathe</span>
            </motion.div>
        </div>
    );
};
