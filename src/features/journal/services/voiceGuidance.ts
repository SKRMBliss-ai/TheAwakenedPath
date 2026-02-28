import { useState, useEffect, useRef, useCallback } from "react";

// Convert Gemini's raw PCM (s16le, 24kHz, mono) to playable WAV
function pcmToWavBlob(base64Pcm: string): Blob {
    const binary = atob(base64Pcm);
    const pcm = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        pcm[i] = binary.charCodeAt(i);
    }

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcm.length;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++)
            view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    const output = new Uint8Array(buffer);
    output.set(pcm, 44);
    return new Blob([output], { type: "audio/wav" });
}

export function useVoiceGuidance() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(() => {
        try {
            return localStorage.getItem("awakened-voice") !== "off";
        } catch { return true; }
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const cache = useRef<Record<string, string>>({});

    // Persist voice preference
    const toggleAudio = useCallback(() => {
        const next = !audioEnabled;
        setAudioEnabled(next);
        try {
            localStorage.setItem("awakened-voice", next ? "on" : "off");
        } catch { }
        if (!next && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [audioEnabled]);

    // Stop any playing audio
    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, []);

    // Generate and play voice
    const playText = useCallback(async (text: string, cacheKey?: string) => {
        if (!audioEnabled) return;

        // Stop any current audio
        stop();

        // Check cache
        const key = cacheKey || text;
        let audioBase64 = cache.current[key];

        if (!audioBase64) {
            setIsLoading(true);
            try {
                // In production, use relative /api/voice
                // In local dev, might need absolute depending on setup
                const res = await fetch("/api/voice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                });

                if (!res.ok) {
                    console.warn("Voice generation failed, continuing silently");
                    setIsLoading(false);
                    return;
                }

                const data = await res.json();
                audioBase64 = data.audio;
                cache.current[key] = audioBase64;
            } catch (err) {
                console.warn("Voice API error:", err);
                setIsLoading(false);
                return; // Fail silently
            }
        }

        setIsLoading(false);

        // Convert PCM to WAV and play
        const blob = pcmToWavBlob(audioBase64);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(url);
        };

        // Small delay so user sees the screen first
        setTimeout(() => audio.play().catch(() => { }), 600);
    }, [audioEnabled, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    return {
        playText,
        stop,
        isPlaying,
        isLoading,
        audioEnabled,
        toggleAudio,
    };
}
