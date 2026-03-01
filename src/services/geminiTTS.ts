/**
 * Gemini 2.5 Flash TTS Service
 * Uses the same approach as SumanSunejaLaughter app for human-like voice.
 * Gemini TTS returns 24kHz Mono 16-bit PCM audio.
 */
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Convert raw PCM (s16le, 24kHz, mono) → playable WAV blob
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

/**
 * Generate human-like speech from text using Gemini TTS.
 * Voice options: Kore (calm female), Puck (warm male), Charon (deep), Aoede (bright)
 */
export async function generateSpeech(text: string, voiceName: string = 'Aoede'): Promise<string> {
    if (!apiKey || !ai) {
        throw new Error("MISSING_GEMINI_KEY");
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned from TTS");

    return base64Audio;
}

/**
 * Play base64 PCM audio through the browser.
 * Returns a cleanup function to stop playback.
 */
export function playPCMAudio(
    base64Audio: string,
    onEnd?: () => void,
    onError?: (err: Error) => void
): { stop: () => void } {
    const blob = pcmToWavBlob(base64Audio);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => {
        URL.revokeObjectURL(url);
        onEnd?.();
    };
    audio.onerror = () => {
        URL.revokeObjectURL(url);
        onError?.(new Error("Audio playback failed"));
    };

    // Small delay so UI renders first
    setTimeout(() => audio.play().catch((e) => onError?.(e)), 400);

    return {
        stop: () => {
            audio.pause();
            audio.currentTime = 0;
            URL.revokeObjectURL(url);
        }
    };
}

/**
 * Speak text using Gemini TTS with fallback to browser SpeechSynthesis.
 */
export async function speakWithGemini(
    text: string,
    voiceName: string = 'Aoede',
    onEnd?: () => void,
    onError?: (err: Error) => void
): Promise<{ stop: () => void }> {
    try {
        const base64 = await generateSpeech(text, voiceName);
        return playPCMAudio(base64, onEnd, onError);
    } catch (err) {
        console.warn("Gemini TTS failed, falling back to browser TTS:", err);
        // Fallback: browser SpeechSynthesis
        return speakWithBrowserTTS(text, onEnd);
    }
}

/** Browser TTS fallback */
function speakWithBrowserTTS(text: string, onEnd?: () => void): { stop: () => void } {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Try to pick a good voice
    const voices = synth.getVoices();
    const preferred = voices.find(v =>
        v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural')
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => onEnd?.();
    synth.speak(utterance);

    return {
        stop: () => {
            synth.cancel();
        }
    };
}

/** Check if Gemini TTS is available */
export function isTTSAvailable(): boolean {
    return !!apiKey && !!ai;
}
