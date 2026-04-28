import { useState, useEffect, useRef, useCallback } from "react";
import { VoiceService } from "../../../services/voiceService";

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

    const cache = useRef<Record<string, string>>({});

    // Sync isPlaying with VoiceService
    useEffect(() => {
        return VoiceService.subscribe((status, category) => {
            setIsPlaying(status === 'playing' && category === 'tts');
        });
    }, []);

    // Persist voice preference
    const toggleAudio = useCallback(() => {
        const next = !audioEnabled;
        setAudioEnabled(next);
        try {
            localStorage.setItem("awakened-voice", next ? "on" : "off");
        } catch { }
        if (!next) {
            VoiceService.stop();
        }
    }, [audioEnabled]);

    // Stop any playing audio
    const stop = useCallback(() => {
        VoiceService.stop();
    }, []);

    // Generate and play voice
    const playText = useCallback(async (text: string, cacheKey?: string) => {
        if (!audioEnabled) return;

        // Check cache
        const key = cacheKey || text;
        let audioBase64 = cache.current[key];

        if (!audioBase64) {
            setIsLoading(true);
            try {
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

        // Convert PCM to WAV and play via VoiceService for exclusivity
        const blob = pcmToWavBlob(audioBase64);
        const url = URL.createObjectURL(blob);
        
        await VoiceService.playAudioURL(url, { 
            category: 'tts',
            onEnd: () => URL.revokeObjectURL(url) 
        });
    }, [audioEnabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            VoiceService.stop();
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
