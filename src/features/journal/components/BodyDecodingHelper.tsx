import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMMON_PROBLEMS = [
    {
        id: 'headaches',
        title: '1. HEADACHES',
        feels: 'Tension, pressure, or pain in your head',
        pattern: 'Being too hard on yourself, constant self-criticism, trying to be perfect, feeling like you’re never good enough.',
        example: 'You criticize yourself all day: “I should have done better… I messed up… I’m so stupid.” Your head literally gets tight from all that mental pressure.',
        helps: 'Be kinder to yourself. When you notice self-criticism, pause and say: “I’m doing my best.”'
    },
    {
        id: 'neck-shoulder',
        title: '2. NECK & SHOULDER PAIN',
        feels: 'Tight, stiff, or aching neck and shoulders',
        pattern: 'Carrying too much responsibility, feeling burdened by life, stubborn thinking (“my way or no way”), refusing to see other viewpoints.',
        example: 'You feel like everything is on your shoulders: kids, work, money, family problems. Your shoulders literally carry this weight and get tight and painful.',
        helps: 'Ask for help. Let some things go. Practice saying: “This isn’t all my responsibility.”'
    },
    {
        id: 'back',
        title: '3. BACK PAIN',
        feels: 'Upper Back: Unloved or unsupported. Middle Back: Guilt. Lower Back: Financial/Future fear.',
        pattern: 'Upper: Holding back affection. Middle: “Get off my back”. Lower: Money worries, feeling unsupported.',
        example: 'You constantly worry about money: “How will I pay rent? What if I lose my job?” Your lower back holds this fear and gets tight.',
        helps: 'Address practical stuff, but notice when you’re stuck in worry. Realize: “Am I okay in this moment?”'
    },
    {
        id: 'stomach',
        title: '4. STOMACH PROBLEMS',
        feels: 'Upset stomach, nausea, butterflies, digestive issues',
        pattern: 'Fear of new things, anxiety about what’s coming, can’t “digest” or accept what’s happening in life, gut-level fear.',
        example: 'You have a big meeting tomorrow. Your stomach churns all night because you’re dreading it. Your body is reacting to your fearful thoughts.',
        helps: 'Deep breathing. When you notice stomach tension, take 5 slow breaths and remind yourself: “I can handle this one step at a time.”'
    },
    {
        id: 'throat',
        title: '5. THROAT ISSUES',
        feels: 'Tightness, soreness, feeling like you can’t speak',
        pattern: 'Not speaking your truth, holding back what you really want to say, fear of speaking up, swallowing your words.',
        example: 'Your boss treats you unfairly. You want to say something but you’re afraid. You hold it in. Your throat gets tight and sore.',
        helps: 'Find safe ways to express yourself: journal, talk to a friend, practice what you’d say. Even just acknowledging “I have something to say” helps.'
    },
    {
        id: 'chest',
        title: '6. CHEST TIGHTNESS / HEART AREA',
        feels: 'Pressure, heaviness, or aching in your chest',
        pattern: 'Lack of joy in life, feeling heartbroken, long-term stress, “I’m not loved” feelings.',
        example: 'You feel lonely or unloved. Your heart area literally aches - it’s not just a saying. Your body is feeling the emotional pain physically.',
        helps: 'Self-compassion. Place your hand on your heart and breathe. Remind yourself: “I matter. I’m worthy of love.”'
    },
    {
        id: 'breathing',
        title: '7. BREATHING PROBLEMS',
        feels: 'Can’t take a full breath, tight chest, wheezing',
        pattern: 'Fear of fully living life, feeling smothered or controlled, not feeling safe to “take in” life, suppressed emotions.',
        example: 'You grew up in a controlling environment where you couldn’t be yourself. Even now as an adult, you can’t take full, deep breaths.',
        helps: 'Practice breathing exercises. Give yourself permission to take up space, to be yourself, to breathe freely.'
    },
    {
        id: 'digestive',
        title: '8. DIGESTIVE ISSUES (Constipation, IBS, Diarrhea)',
        feels: 'Holding on, urgency to release, or severe nervous irritability in the gut.',
        pattern: 'Constipation: Holding on to old beliefs. Diarrhea: Fear and anxiety, running away. IBS: Long-term worry and insecurity.',
        example: 'You can’t let go of a past hurt. You replay it over and over. Your body mirrors this by literally not letting go.',
        helps: 'Practice forgiveness - not for them, but to free yourself. Journal about what you’re ready to release.'
    },
    {
        id: 'bp',
        title: '9. HIGH BLOOD PRESSURE',
        feels: 'Often no symptoms (silent), but feeling pressured internally',
        pattern: 'Long-term unresolved emotional problems, chronic stress and tension, anger you don’t express, feeling under constant pressure.',
        example: 'You’ve been stressed at work for years. Never dealing with it, just pushing through. Your system is always “on.”',
        helps: 'Address what’s stressing you. If you can’t change it, change your response. Learn to release tension daily.'
    },
    {
        id: 'weight',
        title: '10. WEIGHT ISSUES',
        feels: 'Heaviness or emptiness',
        pattern: 'Overweight: Using food for comfort, feeling unsafe. Underweight: Not wanting to be here, fear of being seen.',
        example: 'When you feel stressed or sad, you eat to feel better. It’s not about the food - it’s about what you’re feeding emotionally.',
        helps: 'Ask yourself when you reach for food: “Am I physically hungry, or am I feeding a feeling?” Learn other ways to comfort yourself.'
    },
    {
        id: 'sleep',
        title: '11. INSOMNIA / SLEEP PROBLEMS',
        feels: 'Can’t fall asleep, waking up at night, restless sleep',
        pattern: 'Mind won’t stop worrying, fear of letting go of control, anxiety about tomorrow, not feeling safe enough to rest.',
        example: 'You lie in bed and your mind races: “What if… I should have…” Your body can’t relax because your mind is in overdrive.',
        helps: 'Write down your worries before bed (get them out of your head). Practice telling yourself: “I’m safe right now. I can rest.”'
    },
    {
        id: 'fatigue',
        title: '12. FATIGUE / LOW ENERGY',
        feels: 'Exhausted, drained, no motivation',
        pattern: 'Resistance to your life, “What’s the use?” attitude, not loving yourself, giving up, depression.',
        example: 'You wake up tired because emotionally you’re exhausted from fighting against your life. Your body mirrors your internal state.',
        helps: 'Small steps. Find one thing that brings you a tiny bit of joy. Rest when you need to, but also move your body a little.'
    },
    {
        id: 'skin',
        title: '13. SKIN PROBLEMS',
        feels: 'Breakouts, itchiness, inflammation',
        pattern: 'Anxiety and worry, not accepting yourself, feeling threatened, old issues “erupting” to the surface.',
        example: 'You don’t like yourself. You criticize how you look constantly. Your skin (your outer layer) shows this internal rejection.',
        helps: 'Self-acceptance work. Look in the mirror and find one thing to appreciate. Treat your skin and yourself with kindness.'
    },
    {
        id: 'knee',
        title: '14. KNEE PROBLEMS',
        feels: 'Pain, stiffness, hard to bend',
        pattern: 'Stubborn thinking, pride, ego, refusing to “bend” or be flexible, fear of moving forward.',
        example: 'You refuse to compromise or see another viewpoint. You’re rigid in your thinking. Your knees become stiff and painful.',
        helps: 'Practice flexibility. Ask yourself: “What if there’s another way to see this?” Be willing to “bend” a little.'
    },
    {
        id: 'immune',
        title: '15. FREQUENT COLDS / LOW IMMUNITY',
        feels: 'Always getting sick, low immunity',
        pattern: 'Too much going on (mental overload), needing a break but not taking one, “I need to escape” feelings, burnout.',
        example: 'You’re overwhelmed but you keep pushing. Finally your body forces you to rest by getting sick. It’s your body’s way of saying: “Stop.”',
        helps: 'Rest BEFORE you get sick. Listen to your body’s early signals (tiredness, feeling run down) and actually take breaks.'
    }
];

export const BodyDecodingHelper: React.FC<{
    onSelect?: (area: string, sensations: string, patterns: string, guidance: string) => void;
}> = ({ onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = COMMON_PROBLEMS.find(p => p.id === selectedId);

    useEffect(() => {
        if (selected) {
            onSelect?.(selected.title, selected.feels, selected.pattern, selected.helps);
        }
    }, [selected, onSelect]);

    return (
        <div className="w-full mt-4 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-colors">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#abcec9]/10">
                        <AlertCircle className="w-4 h-4 text-[#abcec9]" />
                    </div>
                    <div>
                        <h4 className="text-sm font-serif text-white/90">Your Body is Talking to You</h4>
                        <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Somatic Pattern Decoding</p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/20"
                    >
                        <div className="p-6">
                            <label className="text-[10px] uppercase tracking-widest text-white/70 mb-3 block">
                                Select a Physical Symptom to Decode:
                            </label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#abcec9]/50 transition-colors"
                                value={selectedId || ''}
                                onChange={(e) => setSelectedId(e.target.value)}
                            >
                                <option value="" disabled>Choose a physical feeling...</option>
                                {COMMON_PROBLEMS.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>

                            {selected && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                            <h5 className="text-[10px] uppercase tracking-widest text-[#abcec9] mb-2 font-bold">What Your Body Feels</h5>
                                            <p className="text-sm text-white/80 font-serif italic leading-relaxed">{selected.feels}</p>
                                        </div>

                                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                            <h5 className="text-[10px] uppercase tracking-widest text-rose-400 mb-2 font-bold">Possible Emotional Pattern</h5>
                                            <p className="text-sm text-white/80 font-serif leading-relaxed mb-3">{selected.pattern}</p>
                                            <div className="pl-3 border-l-2 border-white/10">
                                                <p className="text-xs text-white/50 italic">{selected.example}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-[#abcec9]/5 border border-[#abcec9]/10">
                                            <h5 className="text-[10px] uppercase tracking-widest text-[#abcec9] mb-2 font-bold flex items-center gap-2">
                                                <Wind className="w-3 h-3" /> What Helps
                                            </h5>
                                            <p className="text-sm text-white/90 font-serif leading-relaxed">{selected.helps}</p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-white/30 italic text-center uppercase tracking-wider">
                                        Fear (stomach) • Not feeling enough (fatigue) • Anger (headaches) • Holding on (back pain)
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
