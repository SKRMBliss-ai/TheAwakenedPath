import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Shrink, Expand, Info, HelpCircle } from 'lucide-react';

/**
 * COMPONENT: BodyTruthTest
 * A visualization for testing the truth of a thought via somatic response.
 */

type BodyTestState = 'idle' | 'input' | 'testing' | 'result' | 'numbness_guidance';

export const BodyTruthTest: React.FC = () => {
    const [testState, setTestState] = useState<BodyTestState>('idle');
    const [thought, setThought] = useState('');
    const [, setResult] = useState<'expansion' | 'contraction' | 'numbness' | null>(null);

    const startTest = () => {
        if (!thought) return;
        setTestState('testing');
        // Simulated process: in reality, the user would be guided to feel their body
        setTimeout(() => {
            setTestState('result');
        }, 3000);
    };

    const resetTest = () => {
        setTestState('idle');
        setThought('');
        setResult(null);
    };

    return (
        <div className="card-glow p-8 space-y-6 relative overflow-hidden">
            {/* Background Ambiance for Numbness State */}
            {testState === 'numbness_guidance' && (
                <div className="absolute inset-0 bg-[#1a151b]/80 backdrop-blur-md z-10 flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <div className="space-y-6 max-w-sm">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <HelpCircle className="w-6 h-6 text-white/60" />
                        </div>
                        <h4 className="text-xl font-serif text-white">Accept the Numbness</h4>
                        <p className="text-sm text-white/60 leading-relaxed">
                            "If you cannot feel the inner body, then feel the numbness.
                            That is what is here, now. Accepting the numbness allows it to transform
                            into peace. You are the awareness behind the lack of feeling."
                        </p>
                        <button
                            onClick={resetTest}
                            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest transition-colors"
                        >
                            Return to Presence
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-[#ABCEC9]/10">
                    <Shield className="w-5 h-5 text-[#ABCEC9]" />
                </div>
                <div>
                    <h3 className="text-lg font-serif font-bold text-[#F4E3DA]">The Body's Truth Test</h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Somatic Resonance</p>
                </div>
            </div>

            {testState === 'idle' && (
                <div className="space-y-4">
                    <p className="text-sm text-[#F4E3DA]/70 leading-relaxed">
                        The mind can lie, but the body cannot. Enter a stressful thought below, then we will guide you to feel its truth.
                    </p>
                    <div className="relative group">
                        <input
                            type="text"
                            value={thought}
                            onChange={(e) => setThought(e.target.value)}
                            placeholder="e.g. 'I am not enough' or 'They don't like me'"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#ABCEC9]/50 transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
                            <Info className="w-4 h-4" />
                        </div>
                    </div>
                    <button
                        onClick={startTest}
                        disabled={!thought}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ABCEC9]/20 to-[#ABCEC9]/10 hover:from-[#ABCEC9]/30 hover:to-[#ABCEC9]/20 text-[#ABCEC9] font-bold uppercase tracking-widest text-[11px] border border-[#ABCEC9]/20 disabled:opacity-30 transition-all"
                    >
                        Test This Thought
                    </button>
                </div>
            )}

            {testState === 'testing' && (
                <div className="py-12 flex flex-col items-center justify-center relative">
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-full bg-[#ABCEC9]/10 blur-3xl absolute"
                    />
                    <p className="text-lg font-serif text-white/90 relative z-10 text-center">
                        Hold the thought: <br />
                        <span className="italic text-[#ABCEC9]">"{thought}"</span>
                    </p>
                    <p className="text-xs uppercase tracking-widest text-white/40 mt-8 animate-pulse">
                        Feel your chest...
                    </p>
                </div>
            )}

            {testState === 'result' && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-white/60 uppercase tracking-widest">What is the body saying?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => { setResult('expansion'); resetTest(); }}
                            className="col-span-1 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300 flex flex-col items-center gap-3 transition-colors group"
                        >
                            <div className="p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                <Expand className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Expansion</span>
                        </button>

                        <button
                            onClick={() => { setResult('contraction'); resetTest(); }}
                            className="col-span-1 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 flex flex-col items-center gap-3 transition-colors group"
                        >
                            <div className="p-2 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                                <Shrink className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Contraction</span>
                        </button>

                        <button
                            onClick={() => setTestState('numbness_guidance')}
                            className="col-span-2 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-white/40 hover:text-white/60 flex items-center justify-center gap-2 transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">I Feel Nothing / Unsure</span>
                        </button>
                    </div>
                </div>
            )}

            {testState !== 'numbness_guidance' && (
                <div className="pt-4 border-t border-white/5 flex items-start gap-3 opacity-40">
                    <Info className="w-3 h-3 mt-1 flex-shrink-0" />
                    <p className="text-[10px] leading-relaxed">
                        Expansion = Truth (Life). Contraction = Illusion (Ego). Numbness = Unconscious Resistance.
                    </p>
                </div>
            )}
        </div>
    );
};
