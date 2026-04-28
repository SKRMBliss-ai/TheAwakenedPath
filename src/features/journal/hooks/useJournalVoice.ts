/**
 * useJournalVoice — provides voice guidance for each step of the 3-step journal.
 * Optimized to use the high-fidelity Backend Voice Service.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceService } from '../../../services/voiceService';
import type { FeltExperience } from '../../../data/feltExperiences';

// Calming, spiritual prompts for each step
const STEP_PROMPTS = {
    1: `Take a gentle breath. Welcome to your reflection space. To begin, look through these "Felt Experiences" and notice which one resonates with you right now—perhaps you feel Anxiety, Sadness, or maybe a sense of Peace. 
        Tap the card that matches your truth. Once selected, you'll see common thoughts associated with that feeling. Tap one or more that you've noticed lately, or type your own in the box. 
        When you have identified the mind's activity, tap the arrow at the bottom to continue to the body.`,

    2: (bodyAreas: string[]): string => {
        const areaText = bodyAreas.length > 0 
            ? `Based on your selection, your ${bodyAreas.join(' and ')} might be where this is held.` 
            : `Where do you feel this emotion sitting? Perhaps in your chest, your stomach, or your shoulders?`;
            
        return `Beautiful... Now bring your awareness to your body. ${areaText} 
            Tap the area on the map that feels the most resonant to you. You can also add more details about how it feels—is it tight, heavy, or perhaps a tingling sensation? 
            Once you've mapped the sensation, tap the arrow to move into the final step: Witnessing.`;
    },

    3: (_category: string, distortion: string): string => {
        return `Here is what the Witness sees... Your mind is currently working through a pattern called ${distortion}. 
            Remember, this is not who you are—it is just a temporary cloud passing through your awareness. 
            Read the gentle guidance on the card to gain a new perspective. 
            When you feel ready to release this experience, click the "Record Reflection" button at the bottom. 
            This will save your entry securely. You can find all your previous reflections anytime by clicking the "View all reflections" button on your main journal dashboard. 
            You are doing beautiful work staying present.`;
    }
};

let globalHasInteracted = typeof window !== 'undefined' ? navigator.userActivation?.hasBeenActive || false : false;

export function useJournalVoice() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(() => VoiceService.isEnabled);

    const isMountedRef = useRef(true);
    const lastSpokenRef = useRef<string | null>(null);
    const lastSpokenTimeRef = useRef<number>(0);
    const pendingSpeechRef = useRef<{ text: string; force?: boolean; context?: string } | null>(null);
    const isInteractedRef = useRef(globalHasInteracted || (typeof window !== 'undefined' ? navigator.userActivation?.hasBeenActive || false : false));
    const wasPlayingWhenHiddenRef = useRef(false);
    const speakRef = useRef<Function | null>(null);

    const stop = useCallback(() => {
        VoiceService.stop();
        pendingSpeechRef.current = null;
        lastSpokenRef.current = null;
        lastSpokenTimeRef.current = 0;
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

        // Prevent exact duplicate calls from resetting the audio if it's already playing
        // or if it was requested very recently.
        if (text === lastSpokenRef.current) {
            const timeSinceLast = Date.now() - lastSpokenTimeRef.current;
            if (VoiceService.isSpeaking || timeSinceLast < 1000) {
                return;
            }
        }

        lastSpokenRef.current = text;
        lastSpokenTimeRef.current = Date.now();

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
        
        // Background network preload for the first step
        VoiceService.preloadText(STEP_PROMPTS[1], { voice: 'Enceladus' });

        // Subscribe to global speaking state
        const unsubscribe = VoiceService.subscribe((status, category) => {
            if (isMountedRef.current) {
                // Only consider it 'playing' if it's actually TTS (voice guidance)
                setIsPlaying(status === 'playing' && category === 'tts');
            }
        });

        // Polling for enabled status since it can change globally
        const intv = setInterval(() => {
            if (isMountedRef.current && VoiceService.isEnabled !== voiceEnabled) {
                setVoiceEnabled(VoiceService.isEnabled);
            }
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(intv);
        };
    }, [speak, voiceEnabled]);

    // Full unmount cleanup
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            VoiceService.stop();
        };
    }, []);

    useEffect(() => {
        const handler = (e: any) => {
            if (isInteractedRef.current) return;
            console.log("Voice: Detected interaction:", e.type);
            isInteractedRef.current = true;
            globalHasInteracted = true;
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

        const handleVisibilityChange = () => {
            if (document.hidden) {
                wasPlayingWhenHiddenRef.current = VoiceService.isSpeaking;
                if (VoiceService.isSpeaking) {
                    // Temporarily pause our own tracking to know we paused it
                    isInteractedRef.current = true; // ensure we don't accidentally block it later
                    VoiceService.pause();
                }
            } else {
                if (voiceEnabled && wasPlayingWhenHiddenRef.current) {
                    VoiceService.resume();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // If voice isn't enabled globally yet, wait for interaction
        return () => {
            window.removeEventListener('mousedown', handler, { capture: true });
            window.removeEventListener('touchstart', handler, { capture: true });
            window.removeEventListener('keydown', handler, { capture: true });
            window.removeEventListener('click', handler, { capture: true }); // Added missing cleanup for click
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [voiceEnabled]);

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
