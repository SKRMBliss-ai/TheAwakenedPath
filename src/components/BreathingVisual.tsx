import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";

export const BreathingVisual = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [phase, setPhase] = useState("inhale"); // inhale, hold, exhale, hold
    const [sessionTime, setSessionTime] = useState(155); // 02:35 in seconds
    const [repeatCount, setRepeatCount] = useState(5);

    // Timer logic
    useEffect(() => {
        if (!isPlaying) return;

        // Internal timer for phase handling
        let phaseTime = 0;

        // We need to track phase time separately from the render cycle effectively
        // But for this simple implementation, we can use a ref or just rely on the effect dependency if handled carefully.
        // simpler approach: One main timer that ticks and handles logic.

        const timer = setInterval(() => {
            setSessionTime((prev) => (prev > 0 ? prev - 1 : 0));

            // Phase logic handled via a separate mechanism or coupled here?
            // Let's use a simpler timeout-based approach for phases to avoid complex interval logic overlap
        }, 1000);

        return () => clearInterval(timer);
    }, [isPlaying]);

    // Separate effect for phase cycling
    useEffect(() => {
        if (!isPlaying) return;

        let timeout: NodeJS.Timeout;

        const runPhase = () => {
            let duration = 4000; // default inhale/exhale
            if (phase === 'hold-in' || phase === 'hold-out') duration = 2000;

            timeout = setTimeout(() => {
                setPhase((prev) => {
                    switch (prev) {
                        case "inhale": return "hold-in";
                        case "hold-in": return "exhale";
                        case "exhale":
                            setRepeatCount(c => c > 0 ? c - 1 : 0);
                            return "hold-out";
                        case "hold-out": return "inhale";
                        default: return "inhale";
                    }
                });
            }, duration);
        };

        runPhase();

        return () => clearTimeout(timeout);
    }, [isPlaying, phase]);

    const getPhaseLabel = () => {
        switch (phase) {
            case "inhale": return "Inhale";
            case "hold-in": return "Hold";
            case "exhale": return "Exhale";
            case "hold-out": return "Hold";
            default: return "Ready";
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const variants: Variants = {
        inhale: { scale: [1, 1.5], transition: { duration: 4, ease: "easeInOut" } },
        "hold-in": { scale: 1.5, transition: { duration: 2 } },
        exhale: { scale: [1.5, 1], transition: { duration: 4, ease: "easeInOut" } },
        "hold-out": { scale: 1, transition: { duration: 2 } },
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#0f172a] font-sans items-center justify-between py-12 relative overflow-hidden text-white">

            {/* Top Section: Breathing Concentric Circles */}
            <div className="relative flex items-center justify-center w-80 h-80 mt-10">

                {/* Ripple 3 (Outer) */}
                <motion.div
                    animate={phase}
                    variants={variants}
                    className="absolute w-64 h-64 rounded-full bg-teal-900/20"
                />

                {/* Ripple 2 */}
                <motion.div
                    animate={phase}
                    variants={variants}
                    className="absolute w-48 h-48 rounded-full bg-teal-800/40"
                />

                {/* Ripple 1 */}
                <motion.div
                    animate={phase}
                    variants={variants}
                    className="absolute w-32 h-32 rounded-full bg-teal-600/60 blur-sm"
                />

                {/* Center Core */}
                <motion.div
                    animate={phase}
                    variants={variants}
                    className="relative w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.5)] z-10"
                >
                </motion.div>

                {/* Text Overlay (Does not scale) */}
                <div className="absolute z-20 font-medium text-lg tracking-wide drop-shadow-md pointer-events-none">
                    {getPhaseLabel()}
                </div>
            </div>

            {/* Middle/Bottom Section: Progress Arc & Controls */}
            <div className="flex flex-col items-center w-full max-w-xs space-y-8 mb-8">

                {/* Curved Progress Bar (Static SVG for layout visualization) */}
                <div className="relative w-full h-32 flex justify-center">
                    {/* SVG Arc */}
                    <svg className="w-64 h-32 overflow-visible" viewBox="0 0 200 100">
                        {/* Background Path */}
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                        {/* Progress Path (Dynamic) */}
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#14b8a6" strokeWidth="4" strokeLinecap="round" strokeDasharray="250" strokeDashoffset={250 - (sessionTime / 155 * 250)} />
                    </svg>

                    {/* Time Display */}
                    <div className="absolute top-12 text-center">
                        <div className="text-xl font-bold tracking-tight">Time {formatTime(sessionTime)}</div>
                        <div className="text-slate-400 text-sm mt-1">Repeat: {repeatCount}</div>
                    </div>
                </div>

                {/* Play Button */}
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                    {isPlaying ? (
                        <Pause className="w-8 h-8 text-white fill-current" />
                    ) : (
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                    )}
                </button>

            </div>

            {/* Background ambient particles or gradient */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1] bg-gradient-to-b from-[#0f172a] to-[#020617]" />
        </div>
    );
};
