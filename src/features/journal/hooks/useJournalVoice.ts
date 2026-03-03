/**
 * useJournalVoice — provides voice guidance for each step of the 3-step journal.
 * Optimized to use the high-fidelity Backend Voice Service.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceService } from '../../../services/voiceService';
import type { FeltExperience } from '../../../data/feltExperiences';

// Calming, spiritual prompts for each step
const STEP_PROMPTS = {
    1: `Take a gentle breath. Welcome to your reflection space. Look through these felt experiences and notice which one resonates with you right now. There is no right or wrong answer... just notice what feels true. Tap the one that speaks to you, and then select the specific thoughts underneath.`,

    2: (bodyAreas: string[]): string => {
        if (bodyAreas.length > 0) {
            return `Beautiful... Now bring your awareness to your body. 
                Based on what you're feeling, your ${bodyAreas.join(' and ')} area might be holding some of this. 
                Tap where you feel it the most. Your body always knows.`;
        }
        return `Now, gently bring your awareness to your body. 
            Where do you feel this emotion sitting? 
            Perhaps in your chest... your stomach... your shoulders? 
            Tap the area that feels the most resonant.`;
    },

    3: (_category: string, distortion: string): string => {
        return `Here is what the witness sees... 
            Your mind is working in a pattern called ${distortion}. 
            This is not who you are... it's just a pattern your mind has learned. 
            Take a moment to read the gentle guidance below. 
            When you're ready, save this reflection. You're doing beautiful work.`;
    }
};

export function useJournalVoice() {
    const [isPlaying, setIsPlaying] = useState(VoiceService.isSpeaking);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(VoiceService.isEnabled);

    const isMountedRef = useRef(true);
    const lastSpokenRef = useRef<string | null>(null);
    const pendingSpeechRef = useRef<{ text: string; force: boolean } | null>(null);
    const isInteractedRef = useRef(false);
    const speakRef = useRef<Function | null>(null);

    const stop = useCallback(() => {
        VoiceService.stop();
        pendingSpeechRef.current = null;
        lastSpokenRef.current = null;
        if (isMountedRef.current) {
            setIsPlaying(false);
            setIsLoading(false);
        }
    }, []);

    const speak = useCallback(async (text: string, context?: string, force: boolean = false) => {
        if (!voiceEnabled && !force) {
            console.log("Voice: Guidance is disabled via toggle (and not forced).");
            return;
        }

        // Auto-enable if forced
        if (force && !VoiceService.isEnabled) {
            VoiceService.setEnabled(true);
            setVoiceEnabled(true);
        }

        if (!isInteractedRef.current) {
            console.log("Voice: Queuing guidance for first interaction...");
            pendingSpeechRef.current = { text, force };
            return;
        }

        if (text === lastSpokenRef.current && isPlaying) return;
        lastSpokenRef.current = text;

        stop();

        setIsLoading(true);
        try {
            await VoiceService.speak(text, {
                voice: 'Enceladus',
                promptContext: context,
                onEnd: () => {
                    if (isMountedRef.current) {
                        setIsPlaying(false);
                        setIsLoading(false);
                    }
                }
            });
            if (isMountedRef.current) {
                setIsPlaying(true);
                setIsLoading(false);
            }
        } catch (err) {
            console.warn('Voice guidance error:', err);
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [voiceEnabled, stop, isPlaying]);

    const toggleVoice = useCallback(() => {
        const next = !VoiceService.isEnabled;
        VoiceService.setEnabled(next);
        setVoiceEnabled(next);
    }, []);

    const speakStep1 = useCallback(() => { speak(STEP_PROMPTS[1]); }, [speak]);
    const speakStep2 = useCallback((bodyAreas: string[]) => { speak(STEP_PROMPTS[2](bodyAreas)); }, [speak]);
    const speakStep3 = useCallback((categories: FeltExperience[]) => {
        const primary = categories[0];
        if (primary) {
            speak(STEP_PROMPTS[3](primary.label, primary.cognitiveDistortion));
        }
    }, [speak]);

    useEffect(() => {
        isMountedRef.current = true;
        speakRef.current = speak;

        // Subscribe to global speaking state
        const unsubscribe = VoiceService.subscribe((isSpeaking) => {
            if (isMountedRef.current) setIsPlaying(isSpeaking);
        });

        // Polling for enabled status since it can change globally
        const intv = setInterval(() => {
            if (isMountedRef.current && VoiceService.isEnabled !== voiceEnabled) {
                setVoiceEnabled(VoiceService.isEnabled);
            }
        }, 1000);

        return () => {
            isMountedRef.current = false;
            unsubscribe();
            clearInterval(intv);
        };
    }, [speak, voiceEnabled]);

    useEffect(() => {
        const handler = (e: any) => {
            if (isInteractedRef.current) return;
            console.log("Voice: Detected interaction:", e.type);
            isInteractedRef.current = true;
            if (pendingSpeechRef.current) {
                const { text, force } = pendingSpeechRef.current;
                pendingSpeechRef.current = null;
                speakRef.current?.(text, undefined, force);
            }
        };
        window.addEventListener('mousedown', handler, { once: true, capture: true });
        window.addEventListener('touchstart', handler, { once: true, capture: true });
        window.addEventListener('keydown', handler, { once: true, capture: true });
        window.addEventListener('click', handler, { once: true, capture: true });
        return () => {
            window.removeEventListener('mousedown', handler);
            window.removeEventListener('touchstart', handler);
            window.removeEventListener('keydown', handler);
        };
    }, []);

    return {
        isPlaying,
        isLoading,
        voiceEnabled,
        toggleVoice,
        stop,
        speak,
        speakStep1,
        speakStep2,
        speakStep3,
    };
}
