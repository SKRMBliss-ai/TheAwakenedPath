import React, { useState } from 'react';
import { PracticeCard, tokens } from '../../../components/ui/SacredUI';
import { Zap, Moon, Sparkles, Play } from 'lucide-react';
import { BeginnerPranayamPractice } from '../../../components/domain/BeginnerPranayamPractice';

interface PracticeStep {
    title: string;
    instruction: string;
    duration: number;
    visual: string;
    guidance: string;
}

interface Practice {
    id: number;
    title: string;
    icon: string;
    xp: number;
    duration: number;
    type: string;
    book: string;
    level: string;
    breathPattern?: number[];
    steps: PracticeStep[];
}

interface BreathPracticeProps {
    practices: Practice[];
    setActivePractice: (practice: Practice) => void;
}

export const BreathPractice: React.FC<BreathPracticeProps> = ({ practices, setActivePractice }) => {
    const [showBeginnerPranayam, setShowBeginnerPranayam] = useState(false);

    if (showBeginnerPranayam) {
        return (
            <BeginnerPranayamPractice
                onBack={() => setShowBeginnerPranayam(false)}
                onCompleteSession={() => setShowBeginnerPranayam(false)}
            />
        );
    }

    return (
        <div className="space-y-16">
            <div className="flex justify-between items-end border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.6em] text-white/70 font-bold">The Somatic Field</p>
                    <h2 className="text-6xl font-serif font-light text-white tracking-tight">Guidance</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#CFC2CD] font-bold mb-2">Sacred Mastery</p>
                    <span className="text-5xl font-serif text-white/90">72%</span>
                </div>
            </div>

            {/* Featured Daily 5 Beginner Pranayama Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950/80 via-cyan-950/60 to-slate-900 border border-cyan-500/30 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-xl">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 uppercase">
                                Featured Session
                            </span>
                            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5" /> +250 XP
                            </span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">
                            Daily 5 Beginner Pranayama
                        </h3>
                        <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed">
                            Master the 5 foundational yogic breathing techniques: Anulom Vilom, Kapalbhati, Bhastrika, Bhramari, and Udgeeth. Guided pacing, Mudra tips, and audio cues.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowBeginnerPranayam(true)}
                        className="px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(56,189,248,0.4)] flex items-center gap-3 shrink-0"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        <span>Start 25-Min Practice</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {practices.map((p) => {
                    const isFocus = p.title.toLowerCase().includes('focus');
                    const isRest = p.title.toLowerCase().includes('rest');
                    const Icon = isFocus ? Zap : (isRest ? Moon : Sparkles);
                    const accent = isFocus ? tokens.magenta : (isRest ? "#818CF8" : tokens.teal);

                    return (
                        <PracticeCard
                            key={p.id}
                            title={p.title}
                            type={p.type}
                            level={p.level}
                            xp={p.xp}
                            icon={Icon}
                            accent={accent}
                            onClick={() => setActivePractice(p)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

