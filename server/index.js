const express = require('express');
const cors = require('cors');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { GoogleGenerativeAI } = require('@google-generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const client = new SecretManagerServiceClient();
const projectName = 'awakened-path-2026';

let genAI;
let model;

async function getSecret() {
    const [version] = await client.accessSecretVersion({
        name: `projects/${projectName}/secrets/GEMINI_API_KEY/versions/latest`,
    });
    return version.payload.data.toString();
}

async function initAI() {
    try {
        const apiKey = await getSecret();
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
                Act as a Presence Coach based on 'The Power of Now' by Eckhart Tolle.
                Your goal is to help the user witness the 'voice in their head'.
                When the user shares a thought or emotion, reflect it back from the perspective of the Witness.
                
                Guidelines:
                1. Be compassionate and non-judgmental.
                2. Use short, calming, and focused responses.
                3. Encourage noticing the 'gap' between thought and awareness.
                4. Provide one immediate 'Zen' action to return to the Now.
            `
        });
        console.log("AI initialized with secret key.");
    } catch (err) {
        console.error("Failed to Initialize AI:", err);
    }
}

initAI();

app.post('/api/witness', async (req, res) => {
    const { thought } = req.body;
    if (!model) return res.status(503).json({ error: "AI not ready" });

    try {
        const result = await model.generateContent(thought);
        const response = await result.response;
        res.json({ reflection: response.text() });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "The Witness is silent for a moment." });
    }
});

app.post('/api/grounding', async (req, res) => {
    const { emotion } = req.body;
    if (!model) return res.status(503).json({ error: "AI not ready" });

    const prompt = `The user is in a state of: "${emotion}". Generate a customized 1-minute 'No-Mind' grounding exercise focusing on sensory awareness.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ exercise: response.text() });
    } catch (error) {
        res.status(500).json({ error: "Feel your breath right now." });
    }
});

// 🎙️ VOICE GUIDANCE — GEMINI 2.5 FLASH TTS
const VOICE_PERSONA = `
AUDIO PROFILE:
You are a gentle, warm spiritual guide. Your voice is that of
a kind, wise woman in her 50s — like a trusted therapist in a
quiet, safe room. You have deep empathy but never pity.
Your tone carries natural gravitas without heaviness.

SCENE:
A sacred, quiet space. Evening light. The listener is doing
their daily reflection journal. They are vulnerable and open.
This is not a podcast — it is an intimate, one-on-one moment
of guided self-awareness. A compassionate presence.

DIRECTOR'S NOTES:
- Speak slowly and deliberately. 120-130 words per minute.
  Normal speech is 150-160 wpm. Leave SPACE between sentences.
- Use natural pauses of 1-2 seconds after questions.
  Render "..." as a gentle breathing pause.
- Warm, soft tone throughout. Never clinical, never rushed,
  never cheerful in a forced way. Never patronizing.
- When reading back the user's own words (their thoughts,
  emotions), shift to a slightly more intimate, quieter
  register — like acknowledging something tender and true.
- When reading Eckhart Tolle quotes, slow down further.
  A slight sense of reverence — not dramatic, just present.
- When giving guidance ("A gentle suggestion"), become
  slightly warmer and encouraging, like offering a gift.
- Never use filler words. No "so" or "now then" or "alright."
- Pronounce everything clearly.
- Skip any emoji characters silently.
- End each narration by letting the last word breathe.
`;

app.post('/api/voice', async (req, res) => {
    const { text, voice = "Aoede" } = req.body;

    try {
        const apiKey = await getSecret();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${VOICE_PERSONA}\n\nSpeak the following:\n\n${text}`
                    }]
                }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voice }
                        }
                    }
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini TTS Error:", errText);
            return res.status(response.status).json({ error: "Failed to generate voice" });
        }

        const data = await response.json();
        const audioBase64 = data.candidates[0].content.parts[0].inlineData.data;
        res.json({ audio: audioBase64 });
    } catch (error) {
        console.error("Voice Route Error:", error);
        res.status(500).json({ error: "Silence is okay." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
