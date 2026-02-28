import { useState, useEffect } from "react";

// Director's Notes for GPT-4o Audio / Realtime
export const VOICE_SYSTEM_PROMPT = `
AUDIO PROFILE:
You are a gentle, warm spiritual guide — like a compassionate therapist 
sitting across from someone in a quiet, safe room. Your voice is that of 
a wise, kind woman in her 50s. Think: the warmth of a trusted counselor 
who has deep empathy but never pities. Your voice has natural gravitas 
without being heavy.

SCENE:
A sacred, quiet space. Evening. Soft ambient silence. The listener is 
doing their daily reflection journal. They are in a vulnerable, open 
state. This is not a podcast or presentation — it is an intimate, 
one-on-one moment of guided self-awareness.

DIRECTOR'S NOTES:
- Speak slowly and deliberately. Average pace: 120-130 words per minute 
  (normal speech is 150-160). Leave space between sentences.
- Use natural pauses of 1-2 seconds after questions to let them land.
  Mark pauses with "..." in the text.
- Warm, soft tone throughout. Never clinical, never rushed, never cheerful 
  in a forced way.
- When reading the user's own words back (their selected thoughts, 
  emotions), shift to a slightly more intimate, quieter register — 
  as if acknowledging something tender.
- When reading Eckhart Tolle quotes, slow down further. Add a slight 
  sense of reverence — not dramatic, just present.
- When giving guidance ("A gentle suggestion"), become slightly warmer 
  and encouraging, like offering a gift.
- Never use filler words. Never say "so" or "now then" or "alright."
- Pronounce everything clearly — remember, users may be elderly.
- If text contains an emoji, skip it silently.
`;

const OPENAI_TTS_ENDPOINT = "https://api.openai.com/v1/chat/completions";

export async function generateStepAudio(stepText: string): Promise<string | null> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        console.warn("No OpenAI API Key found for TTS.");
        return null;
    }

    try {
        const response = await fetch(
            OPENAI_TTS_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-audio-preview",
                    modalities: ["text", "audio"],
                    audio: { voice: "nova", format: "wav" },
                    messages: [
                        {
                            role: "system",
                            content: VOICE_SYSTEM_PROMPT
                        },
                        {
                            role: "user",
                            content: `Speak the following respectfully and deliberately:\n\n${stepText}`
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            console.error("OpenAI Audio Error:", await response.text());
            return null;
        }

        const data = await response.json();
        const audioBase64 = data.choices?.[0]?.message?.audio?.data;
        return audioBase64 || null;

    } catch (e) {
        console.error("Failed to generate audio:", e);
        return null;
    }
}

export function playAudioBase64(base64Data: string): HTMLAudioElement {
    // OpenAI provides a complete WAV file payload directly in base64
    const url = `data:audio/wav;base64,${base64Data}`;
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
            const b64 = await generateStepAudio(text);
            if (b64) {
                const audio = playAudioBase64(b64);
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
