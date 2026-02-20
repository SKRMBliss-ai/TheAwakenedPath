import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Shrink, Expand, Info, HelpCircle, ChevronRight } from 'lucide-react';
import { WhisperInput, AnchorButton } from '../../../components/ui/SacredUI';

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
        <div className="p-12 space-y-10 relative overflow-hidden rounded-[48px] border border-white/5 bg-white/[0.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ABCEC9]/5 to-transparent pointer-events-none" />
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
                    <p className="text-[10px] uppercase tracking-widest text-white/70">Somatic Resonance</p>
                </div>
            </div>

            {testState === 'idle' && (
                <div className="space-y-8">
                    <p className="text-base text-white/70 leading-relaxed font-light max-w-md">
                        The mind can lie, but the body cannot. Enter a thought that causes friction, and we will guide you into the somatic response.
                    </p>
                    <WhisperInput
                        value={thought}
                        onChange={setThought}
                        placeholder="e.g. 'I am not enough' or 'They don't like me'"
                    />
                    <AnchorButton
                        variant="solid"
                        onClick={startTest}
                        disabled={!thought}
                        className="!w-64"
                    >
                        Begin Somatic Test
                    </AnchorButton>
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
                    <p className="text-xs uppercase tracking-widest text-white/70 mt-8 animate-pulse">
                        Feel your chest...
                    </p>
                </div>
            )}

            {testState === 'result' && (
                <div className="space-y-8">
                    <div className="text-center">
                        <p className="text-[10px] text-white/70 uppercase tracking-[0.6em] font-bold">What is the body saying?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnchorButton
                            variant="ghost"
                            onClick={() => { setResult('expansion'); resetTest(); }}
                            className="!flex !flex-col !h-48 !p-8 !items-center !justify-center !gap-4 !border-emerald-500/20 group"
                        >
                            <div className="p-3 rounded-full bg-emerald-500/5 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                                <Expand className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-400/60">Expansion / Truth</span>
                        </AnchorButton>

                        <AnchorButton
                            variant="ghost"
                            onClick={() => { setResult('contraction'); resetTest(); }}
                            className="!flex !flex-col !h-48 !p-8 !items-center !justify-center !gap-4 !border-rose-500/20 group"
                        >
                            <div className="p-3 rounded-full bg-rose-500/5 border border-rose-500/10 group-hover:scale-110 transition-transform">
                                <Shrink className="w-6 h-6 text-rose-400" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-rose-400/60">Contraction / Ego</span>
                        </AnchorButton>

                        <button
                            onClick={() => setTestState('numbness_guidance')}
                            className="col-span-1 md:col-span-2 py-4 text-white/70 hover:text-white/70 text-[10px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-2"
                        >
                            I Feel Nothing / Resistance
                            <ChevronRight className="w-3 h-3" />
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
