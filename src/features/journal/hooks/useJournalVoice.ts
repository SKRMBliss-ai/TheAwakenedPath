/**
 * useJournalVoice — provides voice guidance for each step of the 3-step journal.
 * Uses Gemini TTS for human-like narration.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { speakWithGemini } from '../../../services/geminiTTS';
import type { FeltExperience } from '../../../data/feltExperiences';

// Calming, spiritual prompts for each step
const STEP_PROMPTS = {
    1: `Take a gentle breath... Welcome to your reflection space. 
        Look through these felt experiences and notice which one resonates with you right now. 
        There's no right or wrong answer... just notice what feels true. 
        Tap the one that speaks to you, and then select the specific thoughts underneath.`,

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
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(() => {
        try {
            return localStorage.getItem('awakened-journal-voice') !== 'off';
        } catch { return true; }
    });

    const stopRef = useRef<(() => void) | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            stopRef.current?.();
        };
    }, []);

    const stop = useCallback(() => {
        stopRef.current?.();
        stopRef.current = null;
        if (isMountedRef.current) {
            setIsPlaying(false);
            setIsLoading(false);
        }
    }, []);

    const speak = useCallback(async (text: string) => {
        if (!voiceEnabled) return;

        // Stop any current speech
        stop();

        setIsLoading(true);
        try {
            const result = await speakWithGemini(
                text,
                'Aoede',   // Bright, warm voice
                () => { if (isMountedRef.current) { setIsPlaying(false); } },
                () => { if (isMountedRef.current) { setIsPlaying(false); } }
            );
            stopRef.current = result.stop;
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
    }, [voiceEnabled, stop]);

    const toggleVoice = useCallback(() => {
        const next = !voiceEnabled;
        setVoiceEnabled(next);
        try { localStorage.setItem('awakened-journal-voice', next ? 'on' : 'off'); } catch { }
        if (!next) stop();
    }, [voiceEnabled, stop]);

    // Step-specific speak functions
    const speakStep1 = useCallback(() => {
        speak(STEP_PROMPTS[1]);
    }, [speak]);

    const speakStep2 = useCallback((bodyAreas: string[]) => {
        speak(STEP_PROMPTS[2](bodyAreas));
    }, [speak]);

    const speakStep3 = useCallback((categories: FeltExperience[]) => {
        const primary = categories[0];
        if (primary) {
            speak(STEP_PROMPTS[3](primary.label, primary.cognitiveDistortion));
        }
    }, [speak]);

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
