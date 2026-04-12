import { useState, useEffect } from 'react';

const API_BASE_URL = "https://awakened-path-2026.web.app";

export type EmotionState = 'CALM' | 'JOY' | 'FOCUS' | 'PANIC' | 'ANGER' | 'SAD' | 'NEUTRAL';

// Color mapping for different emotional resonances
export const EMOTION_COLORS: Record<EmotionState, string> = {
    CALM: '#ABCEC9',    // Sage/Ethereal Cyan
    JOY: '#F9A826',     // Warm Golden
    FOCUS: '#5C6BC0',   // Deep Indigo/Sapphire
    PANIC: '#EF5350',   // Alert Red/Coral
    ANGER: '#FF7043',   // Fire Orange
    SAD: '#4FC3F7',     // Soft Blue/Tear
    NEUTRAL: '#7B2D8B'  // Base Plum
};

export const EMOTION_PHYSICS: Record<EmotionState, { speed: number; distort: number }> = {
    CALM: { speed: 0.1, distort: 0.1 },
    JOY: { speed: 1.5, distort: 0.3 },
    FOCUS: { speed: 0.5, distort: 0.5 },
    PANIC: { speed: 4.0, distort: 0.8 },
    ANGER: { speed: 3.5, distort: 0.6 },
    SAD: { speed: 0.2, distort: 0.2 },
    NEUTRAL: { speed: 0.4, distort: 0.15 }
};

export const useEmotionSync = (inputText: string) => {
    const [emotion, setEmotion] = useState<EmotionState>('NEUTRAL');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!inputText || inputText.length < 15) {
            if (emotion !== 'NEUTRAL') {
                setEmotion('NEUTRAL');
                document.documentElement.style.setProperty('--app-emotion-color', EMOTION_COLORS.NEUTRAL);
            }
            return;
        }

        const timer = setTimeout(async () => {
            setIsAnalyzing(true);
            try {
                // Determine if we are running locally or on production to hit the correct API
                const apiUrl = window.location.hostname === 'localhost'
                    ? '/api/emotion' // Vite proxy or direct functions hit if using emulator
                    : `${API_BASE_URL}/api/emotion`;

                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: inputText })
                });

                if (res.ok) {
                    const data = await res.json();
                    let validEmotion = data.emotion as EmotionState;
                    if (!EMOTION_COLORS[validEmotion]) validEmotion = 'NEUTRAL';

                    setEmotion(validEmotion);

                    // Dispatch a global event to change physics (Orb, background)
                    document.dispatchEvent(new CustomEvent('emotional_resonance', {
                        detail: { emotion: validEmotion, physics: EMOTION_PHYSICS[validEmotion] }
                    }));

                    // Override CSS variables for instant UI color shift
                    document.documentElement.style.setProperty('--app-emotion-color', EMOTION_COLORS[validEmotion]);
                    document.documentElement.style.setProperty('--app-emotion-glow', `${EMOTION_COLORS[validEmotion]}33`); // 20% opacity
                }
            } catch (error) {
                console.error("Emotion Sync Error:", error);
            } finally {
                setIsAnalyzing(false);
            }
        }, 1200); // 1.2s debounce after typing stops

        return () => clearTimeout(timer);
    }, [inputText]);

    return { emotion, isAnalyzing };
};
