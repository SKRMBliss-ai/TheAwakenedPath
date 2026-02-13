import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle, Bell, Activity, ChevronLeft, Sparkles } from 'lucide-react';
import { useWitnessingVoice } from '../hooks/useWitnessingVoice';
import { getNoMindGrounding } from '../services/geminiService';
import { BodyTruthTest } from './BodyTruthTest';
import { usePresenceScheduler } from '../hooks/usePresenceScheduler';
import { cn } from '../../../lib/utils';

/**
 * COMPONENT: PowerOfNow
 * The core curriculum based on Power of Now.
 */

interface Chapter {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    color: string;
}

interface PowerOfNowProps {
    initialChapter?: string;
}

export const PowerOfNow: React.FC<PowerOfNowProps> = ({ initialChapter }) => {
    const { isListening, transcript, reflection, isProcessing, startListening, stopListening } = useWitnessingVoice();
    const { lastReminder, requestPermission } = usePresenceScheduler();
    const [panicMode, setPanicMode] = useState(false);
    const [presenceValue, setPresenceValue] = useState(45);
    const [groundingText, setGroundingText] = useState('');
    const [expandedChapter, setExpandedChapter] = useState<string | null>(initialChapter || 'observer');

    React.useEffect(() => {
        if (initialChapter) {
            setExpandedChapter(initialChapter);
        }
    }, [initialChapter]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

    const chapters: Chapter[] = [
        {
            id: 'observer',
            title: 'Chapter 1',
            subtitle: 'You Are Not Your Mind',
            description: 'Witness the voice in your head and discover the gap of awareness.',
            icon: Mic,
            color: '#ABCEC9'
        },
        {
            id: 'inner-body',
            title: 'Chapter 2',
            subtitle: 'The Inner Body',
            description: 'Move consciousness from the mind into the somatic field of the body.',
            icon: Activity,
            color: '#C65F9D'
        },
        {
            id: 'gaps',
            title: 'Chapter 3',
            subtitle: 'Mindful Gaps',
            description: 'Insert spaces of no-mind into the flow of your daily routine.',
            icon: Bell,
            color: '#F4E3DA'
        },
        {
            id: 'panic',
            title: 'Chapter 4',
            subtitle: 'Beyond the Storm',
            description: 'Immediate grounding tools for when the mind-storm is too loud.',
            icon: AlertCircle,
            color: '#F08C8C'
        }
    ];

    const handleEnableNotifications = () => {
        requestPermission();
        setNotificationsEnabled(true);
    };

    const togglePanic = () => setPanicMode(!panicMode);

    const runGrounding = async (input: string) => {
        const exercise = await getNoMindGrounding(input);
        setGroundingText(exercise);
        setPresenceValue(prev => Math.min(100, prev + 10));
    };

    // Dedicated Panic Mode View
    if (initialChapter === 'panic') {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center relative py-12">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center max-w-2xl text-center space-y-8">
                    <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.1)] mb-4">
                        <AlertCircle className="w-10 h-10 text-rose-400" />
                    </div>

                    {!groundingText ? (
                        <>
                            <div className="space-y-4 mb-8">
                                <h2 className="text-5xl md:text-6xl font-serif font-bold text-white tracking-tight">Stay Here</h2>
                                <p className="text-xl text-white/50 font-light leading-relaxed max-w-lg mx-auto">
                                    The storm is just a thought. You are the sky. Choose an anchor to return to safety.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                                <button
                                    onClick={() => runGrounding("Anxiety / Overwhelm")}
                                    className="group w-full py-6 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-serif text-xl hover:bg-white/10 hover:border-white/20 transition-all shadow-lg flex items-center justify-between"
                                >
                                    <span>I am lost in worry</span>
                                    <ChevronLeft className="w-5 h-5 rotate-180 opacity-40 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => runGrounding("Negative Self-Talk")}
                                    className="group w-full py-6 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-serif text-xl hover:bg-white/10 hover:border-white/20 transition-all shadow-lg flex items-center justify-between"
                                >
                                    <span>The voice is shouting</span>
                                    <ChevronLeft className="w-5 h-5 rotate-180 opacity-40 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => runGrounding("Body Panic")}
                                    className="group w-full py-6 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-serif text-xl hover:bg-white/10 hover:border-white/20 transition-all shadow-lg flex items-center justify-between"
                                >
                                    <span>My body is panicking</span>
                                    <ChevronLeft className="w-5 h-5 rotate-180 opacity-40 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-12"
                        >
                            <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
                                <p className="text-2xl md:text-3xl text-[#ABCEC9] font-serif leading-relaxed italic">
                                    "{groundingText}"
                                </p>
                            </div>
                            <button
                                onClick={() => setGroundingText('')}
                                className="px-12 py-5 rounded-xl bg-white text-black font-bold uppercase tracking-[0.3em] text-xs shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all"
                            >
                                Select Another Anchor
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full pb-10">
            {/* Header / Gauge */}
            <div className="card-glow p-8 rounded-[38px] border border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-40">
                            <Sparkles className="w-4 h-4 text-[#ABCEC9]" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Consciousness Stream</h3>
                        </div>
                        <h2 className="text-4xl font-serif font-bold text-white tracking-tight">The Power of Now</h2>
                    </div>
                    <div className="text-left md:text-right">
                        <span className="text-5xl font-serif text-[#C65F9D] drop-shadow-[0_0_15px_rgba(198,95,157,0.3)]">{presenceValue}%</span>
                        <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold mt-1">Presence Frequency</p>
                    </div>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px] shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${presenceValue}%` }}
                        className="h-full bg-gradient-to-r from-[#C65F9D] via-[#ABCEC9] to-[#F4E3DA] rounded-full shadow-[0_0_20px_#ABCEC955]"
                        transition={{ type: "spring", stiffness: 40, damping: 15 }}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {chapters.map((chapter) => {
                    const isExpanded = expandedChapter === chapter.id;
                    return (
                        <div key={chapter.id} className={cn(
                            "group transition-all duration-700 rounded-[32px] overflow-hidden border transition-shadow",
                            isExpanded ? "bg-white/[0.03] border-white/10 shadow-2xl scale-[1.01]" : "bg-transparent border-white/5 hover:border-white/10"
                        )}>
                            <button
                                onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                                className="w-full text-left p-6 md:p-8 flex items-center gap-6 md:gap-8"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 transition-all duration-700 shadow-lg",
                                    isExpanded ? "scale-110 rotate-[5deg] shadow-[0_10px_30px_rgba(0,0,0,0.3)]" : "group-hover:scale-110"
                                )} style={{ backgroundColor: `${chapter.color}15`, color: chapter.color }}>
                                    <chapter.icon className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">{chapter.title}</span>
                                        <ChevronLeft className={cn("w-5 h-5 opacity-20 transition-transform duration-700 ease-fluid", isExpanded ? "rotate-[-90deg]" : "rotate-180")} />
                                    </div>
                                    <h4 className="text-2xl font-serif font-bold text-white group-hover:text-white/90 transition-colors tracking-tight">{chapter.subtitle}</h4>
                                    {!isExpanded && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xs text-white/40 leading-relaxed mt-2 line-clamp-1 font-light"
                                        >
                                            {chapter.description}
                                        </motion.p>
                                    )}
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                    >
                                        <div className="px-6 md:px-12 pb-6 pt-2 lg:pt-4">
                                            <p className="text-sm text-white/40 mb-6 border-l-[3px] border-white/10 pl-6 italic font-light leading-relaxed max-w-2xl">
                                                {chapter.description}
                                            </p>

                                            <div className="w-full h-px bg-white/5 mb-6" />

                                            {/* Chapter Content Router */}
                                            {chapter.id === 'observer' && (
                                                <div className="card-glow p-8 md:p-10 flex flex-col items-center text-center rounded-[40px] border-white/10 shadow-inner">
                                                    <div className="w-20 h-20 rounded-full bg-[#ABCEC9]/5 border border-[#ABCEC9]/20 flex items-center justify-center mb-6 relative">
                                                        <AnimatePresence>
                                                            {isListening && (
                                                                <motion.div
                                                                    initial={{ scale: 1, opacity: 0.4 }}
                                                                    animate={{ scale: 2.5, opacity: 0 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                                                    className="absolute inset-0 bg-[#ABCEC9] rounded-full"
                                                                />
                                                            )}
                                                        </AnimatePresence>
                                                        <Mic className={cn("w-8 h-8 transition-all duration-700", isListening ? "text-[#ABCEC9] scale-110" : "text-[#F4E3DA]/20")} />
                                                    </div>

                                                    <h2 className="text-2xl font-serif font-bold text-[#F4E3DA] mb-2">Witness the Voice</h2>
                                                    <p className="text-sm text-[#F4E3DA]/50 mb-8 max-w-md font-light leading-relaxed">
                                                        The mind is a tool, not who you are. Share a thought that has been circling, and let the Observer's light shine on it.
                                                    </p>

                                                    <button
                                                        onMouseDown={startListening}
                                                        onMouseUp={stopListening}
                                                        onTouchStart={startListening}
                                                        onTouchEnd={stopListening}
                                                        className={cn(
                                                            "w-full max-w-xs py-4 rounded-2xl font-bold uppercase tracking-[0.3em] transition-all duration-700 text-[10px]",
                                                            isListening
                                                                ? "bg-[#C65F9D] text-white shadow-[0_0_50px_rgba(198,95,157,0.4)] scale-105"
                                                                : "bg-white/5 text-[#F4E3DA]/80 border border-white/10 hover:bg-white/10 hover:scale-105 shadow-xl"
                                                        )}
                                                    >
                                                        {isListening ? "Listening with Deep Presence..." : "Hold to Share Thought"}
                                                    </button>

                                                    <AnimatePresence>
                                                        {(transcript || reflection || isProcessing) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="mt-8 pt-8 border-t border-white/5 w-full max-w-6xl"
                                                            >
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                                                    {/* User Thought Card */}
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center gap-3 px-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                                                            <p className="text-[9px] uppercase font-bold tracking-[0.5em] text-white/30">Mind's Form</p>
                                                                        </div>
                                                                        {/* Progress Header */}
                                                                        <div className="w-full">
                                                                            <div className="relative p-8 md:p-12 rounded-[48px] bg-gradient-to-r from-[#C65F9D]/10 to-[#ABCEC9]/10 border border-white/5 shadow-2xl overflow-hidden w-full group">
                                                                                <div className="absolute top-4 left-4 text-white/5 font-serif text-6xl select-none leading-none">"</div>
                                                                                <p className="text-2xl italic text-white/50 leading-relaxed font-light font-serif relative z-10">
                                                                                    {transcript || 'The mist is clearing...'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* AI Reflection Card */}
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center gap-3 px-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#ABCEC9] shadow-[0_0_8px_#ABCEC9]" />
                                                                            <p className="text-[9px] uppercase font-bold tracking-[0.5em] text-[#ABCEC9]/60">Presence's Light</p>
                                                                        </div>
                                                                        <div className="p-8 md:p-12 bg-[#ABCEC9]/5 rounded-[40px] border border-[#ABCEC9]/15 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden backdrop-blur-sm">
                                                                            {/* Subtle background glow */}
                                                                            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#ABCEC9]/5 blur-[80px] rounded-full pointer-events-none" />

                                                                            <div className="text-xl md:text-2xl text-[#ABCEC9] leading-relaxed font-serif relative z-10 whitespace-pre-line">
                                                                                {isProcessing ? (
                                                                                    <motion.span
                                                                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                                                                        transition={{ duration: 2, repeat: Infinity }}
                                                                                    >
                                                                                        Seeing beyond the veil...
                                                                                    </motion.span>
                                                                                ) : (
                                                                                    reflection || "The Witness is silent and watchful."
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            {chapter.id === 'inner-body' && (
                                                <div className="space-y-0 p-1">
                                                    <BodyTruthTest />
                                                </div>
                                            )}

                                            {chapter.id === 'gaps' && (
                                                <div className="card-glow p-12 md:p-20 flex flex-col items-center text-center space-y-12 rounded-[40px] border-white/10">
                                                    <div className="w-24 h-24 rounded-[40px] bg-[#F4E3DA]/5 border border-[#F4E3DA]/20 flex items-center justify-center rotate-[-5deg] shadow-2xl">
                                                        <Bell className="w-10 h-10 text-[#F4E3DA]" />
                                                    </div>
                                                    <div className="space-y-4 max-w-md">
                                                        <h3 className="text-3xl font-serif font-bold text-white tracking-tight">The Routine as Ritual</h3>
                                                        <p className="text-base text-white/40 leading-relaxed font-light">
                                                            Every wait, every chores, every simple breath is an invitation to leave the mind and arrive in the Now.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={handleEnableNotifications}
                                                        className={cn(
                                                            "w-full max-w-xs py-6 rounded-2xl font-bold uppercase tracking-[0.4em] transition-all duration-700 text-[10px]",
                                                            notificationsEnabled
                                                                ? "bg-white/5 text-white/20 cursor-default border border-white/5"
                                                                : "bg-[#ABCEC9] text-[#1a151b] hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(171,206,201,0.2)]"
                                                        )}
                                                    >
                                                        {notificationsEnabled ? "Presence Reminders Active" : "Awaken Reminders"}
                                                    </button>
                                                    <AnimatePresence>
                                                        {lastReminder && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="pt-16 border-t border-white/5 w-full flex flex-col items-center"
                                                            >
                                                                <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-6 font-bold">Latest Gate to Presence</p>
                                                                <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/5 max-w-md shadow-inner">
                                                                    <p className="text-2xl text-[#ABCEC9] italic font-serif leading-relaxed">"{lastReminder}"</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            {chapter.id === 'panic' && (
                                                <div className="space-y-8">
                                                    <div className="card-glow p-12 md:p-20 space-y-12 rounded-[40px] border-white/10 shadow-2xl">
                                                        <div className="flex flex-col items-center text-center space-y-10">
                                                            <div className="w-24 h-24 rounded-full bg-rose-500/5 flex items-center justify-center border border-rose-500/10 shadow-[inset_0_0_40px_rgba(244,63,94,0.05)]">
                                                                <AlertCircle className="w-12 h-12 text-rose-400" />
                                                            </div>
                                                            <div className="space-y-4 max-w-md">
                                                                <h3 className="text-3xl font-serif font-bold text-white tracking-tight">Emergency Awareness</h3>
                                                                <p className="text-base text-white/40 leading-relaxed font-light">
                                                                    When the mind forms a storm of noise, return to the Anchor. Find the one who is witnessing the storm.
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={togglePanic}
                                                                className="w-full max-w-xs py-6 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-rose-500/20 transition-all shadow-lg"
                                                            >
                                                                Activate Rescue Anchor
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {panicMode && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="fixed inset-0 z-[200] bg-[#0d0a0e]/98 backdrop-blur-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center"
                                                            >
                                                                <motion.div
                                                                    animate={{
                                                                        scale: [1, 1.2, 1],
                                                                        opacity: [0.1, 0.3, 0.1]
                                                                    }}
                                                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                                >
                                                                    <div className="w-[600px] h-[600px] bg-rose-500/20 rounded-full blur-[120px]" />
                                                                </motion.div>

                                                                <motion.div
                                                                    initial={{ scale: 0.9, y: 20 }}
                                                                    animate={{ scale: 1, y: 0 }}
                                                                    className="relative z-10 flex flex-col items-center max-w-2xl"
                                                                >
                                                                    <AlertCircle className="w-20 h-20 text-rose-400/40 mb-10" />

                                                                    <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 tracking-tight">Stay Here</h2>
                                                                    <p className="text-rose-100/40 mb-20 text-xl font-light leading-relaxed font-serif max-w-lg">
                                                                        The thoughts are noise. Your breath is the silence. Feel the life force within your hands right now.
                                                                    </p>

                                                                    {!groundingText ? (
                                                                        <div className="grid grid-cols-1 gap-6 w-full max-w-lg">
                                                                            <button
                                                                                onClick={() => runGrounding("Anxiety / Overwhelm")}
                                                                                className="group w-full py-8 rounded-3xl bg-white/5 border border-white/10 text-white font-serif text-2xl hover:bg-white/10 hover:border-white/20 transition-all shadow-2xl flex items-center justify-center gap-4"
                                                                            >
                                                                                <span>I am lost in worry</span>
                                                                                <ChevronLeft className="w-5 h-5 rotate-180 opacity-0 group-hover:opacity-40 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => runGrounding("Negative Self-Talk")}
                                                                                className="group w-full py-8 rounded-3xl bg-white/5 border border-white/10 text-white font-serif text-2xl hover:bg-white/10 hover:border-white/20 transition-all shadow-2xl flex items-center justify-center gap-4"
                                                                            >
                                                                                <span>The voice is shouting</span>
                                                                                <ChevronLeft className="w-5 h-5 rotate-180 opacity-0 group-hover:opacity-40 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                                                            </button>
                                                                            <button
                                                                                onClick={togglePanic}
                                                                                className="mt-16 text-white/20 uppercase text-[11px] font-bold tracking-[0.6em] hover:text-[#ABCEC9] hover:tracking-[0.8em] transition-all"
                                                                            >
                                                                                No, I am Awake
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            className="space-y-16"
                                                                        >
                                                                            <p className="text-3xl md:text-4xl text-white font-serif leading-relaxed italic border-x border-white/10 px-12 py-4">
                                                                                "{groundingText}"
                                                                            </p>
                                                                            <button
                                                                                onClick={() => { setPanicMode(false); setGroundingText(''); }}
                                                                                className="px-16 py-6 rounded-2xl bg-[#ABCEC9] text-[#0d0a0e] font-bold uppercase tracking-[0.4em] text-[12px] shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:scale-105 transition-all"
                                                                            >
                                                                                I have Returned
                                                                            </button>
                                                                        </motion.div>
                                                                    )}
                                                                </motion.div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
