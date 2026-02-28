export async function generateStepAudioUrl(stepText: string): Promise<string | null> {
    try {
        const response = await fetch("/api/voice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: stepText
            })
        });

        if (!response.ok) {
            console.error("Backend Audio Error:", await response.text());
            return null;
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("Failed to fetch audio from backend:", e);
        return null;
    }
}

import { useState, useEffect } from "react";

export function playAudioUrl(url: string): HTMLAudioElement {
    const audio = new Audio(url);
    audio.play();
    return audio;
}

export function useVoiceGuidance() {
    const [audioEnabled, setAudioEnabled] = useState(() => {
        return localStorage.getItem("bliss_voice_enabled") !== "false";
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

    const toggleAudio = () => {
        setAudioEnabled(prev => {
            const next = !prev;
            localStorage.setItem("bliss_voice_enabled", String(next));
            if (!next && currentAudio) {
                currentAudio.pause();
                setIsPlaying(false);
            }
            return next;
        });
    };

    const playText = async (text: string) => {
        if (!audioEnabled) return;

        if (currentAudio) {
            currentAudio.pause();
        }

        setIsPlaying(true);
        // Simulate a slight delay before generation starts to let the UI settle
        await new Promise(r => setTimeout(r, 500));

        try {
            const url = await generateStepAudioUrl(text);
            if (url) {
                const audio = playAudioUrl(url);
                setCurrentAudio(audio);
                audio.onended = () => setIsPlaying(false);
                audio.onerror = () => setIsPlaying(false);
            } else {
                setIsPlaying(false); // Fail gracefully
            }
        } catch (e) {
            setIsPlaying(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.src = "";
            }
        };
    }, [currentAudio]);

    return { audioEnabled, isPlaying, toggleAudio, playText };
}
