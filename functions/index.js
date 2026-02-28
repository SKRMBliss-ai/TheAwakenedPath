const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const textToSpeech = require("@google-cloud/text-to-speech");

// Define the secret created in Google Cloud Secret Manager
const geminiKey = defineSecret("AWAKENED_PATH_GEMINI_KEY");
const openAiKey = defineSecret("OPENAI_API_KEY");

// Text-to-Speech Client
const ttsClient = new textToSpeech.TextToSpeechClient();

/**
 * VOICE ENGINE: Tier 0 (Gemini Multimodal TTS)
 * Highly expressive, human-like, detects tone instructions.
 */
async function synthesizeGemini(text, gender, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const voiceName = gender === 'MALE' ? 'Charon' : 'Aoede';

    // Director instructions for the Multimodal engine
    const prompt = `
        (Voice: ${voiceName})
        Read this meditation script with a slow, spiritual, and very human pace. 
        Add subtle pauses (1-2s) where appropriate. 
        Focus on warmth and presence.
        
        Script: "${text}"
    `;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
            }
        }
    });

    const response = await result.response;
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part) throw new Error("GEMINI_AUDIO_PART_NOT_FOUND");

    return Buffer.from(part.inlineData.data, 'base64');
}

async function synthesizeOpenAI(text, apiKey) {
    const VOICE_SYSTEM_PROMPT = `
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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
                { role: "system", content: VOICE_SYSTEM_PROMPT },
                { role: "user", content: `Speak the following respectfully and deliberately:\n\n${text}` }
            ]
        })
    });

    if (!response.ok) {
        throw new Error("OpenAI Audio Error: " + await response.text());
    }

    const data = await response.json();
    const audioBase64 = data.choices?.[0]?.message?.audio?.data;
    if (!audioBase64) throw new Error("No audio data returned from OpenAI");

    return Buffer.from(audioBase64, 'base64');
}

exports.textToSpeech = onRequest({ secrets: [geminiKey, openAiKey], cors: true }, async (req, res) => {
    const { text, gender = 'FEMALE', useOpenAI = false } = req.body;

    if (!text) return res.status(400).send("No text provided.");

    // If frontend requests OpenAI specifically
    if (useOpenAI) {
        try {
            console.log("Attempting OpenAI GPT-4o Audio");
            const audioBuffer = await synthesizeOpenAI(text, openAiKey.value());
            res.set('Content-Type', 'audio/wav');
            return res.send(audioBuffer);
        } catch (e) {
            console.warn("OpenAI Error, falling back to Gemini:", e.message);
            // Fall through to the rest of the logic below which starts with Gemini Tier 0
        }
    }

    // Voice Tier 1: Vertex / Studio (Chirp 3 HD) - High fidelity, emotional
    const TIER_1_VOICE = gender === 'MALE' ? 'en-US-Chirp3-HD-Achird' : 'en-US-Chirp3-HD-Aoede';

    // Voice Tier 2: Neural2 (DeepMind) - Very human-like
    const TIER_2_VOICE = gender === 'MALE' ? 'en-US-Neural2-D' : 'en-US-Neural2-F';

    // Function to add meditative pauses and rhythmic breaks
    function meditationify(rawText) {
        // Add 2s break after sentences for deep absorption
        let ssml = rawText.replace(/([.?!])\s+/g, '$1 <break time="2000ms"/> ');
        // Add 1s break after commas/semicolons
        ssml = ssml.replace(/([,;])\s+/g, '$1 <break time="1000ms"/> ');
        return `<speak>${ssml}</speak>`;
    }

    const ssmlContent = meditationify(text);

    async function synthesize(voiceName) {
        const request = {
            input: { ssml: ssmlContent },
            voice: { languageCode: 'en-US', name: voiceName },
            audioConfig: {
                audioEncoding: 'MP3',
                pitch: -2.5,          // Lower pitch for resonance
                speakingRate: 0.85,   // Slightly faster for better flow (from 0.8)
                volumeGainDb: 2.0     // Slight boost for clarity at low volume
            },
        };
        const [response] = await ttsClient.synthesizeSpeech(request);
        return response.audioContent;
    }

    try {
        console.log("Attempting Tier 0: Gemini Multimodal TTS");
        const audio = await synthesizeGemini(text, gender, geminiKey.value());
        res.set('Content-Type', 'audio/mpeg');
        return res.send(audio);
    } catch (geminiError) {
        console.warn("Tier 0 (Gemini TTS) Error. Falling back to Tier 1.", geminiError.message);
        try {
            console.log(`Attempting Tier 1 Meditative Voice: ${TIER_1_VOICE}`);
            const audio = await synthesize(TIER_1_VOICE);
            res.set('Content-Type', 'audio/mpeg');
            return res.send(audio);
        } catch (tier1Error) {
            console.warn("Tier 1 (Vertex) Limit reached or error. Falling back to Tier 2.", tier1Error.message);

            try {
                console.log(`Attempting Tier 2 Voice: ${TIER_2_VOICE}`);
                const audio = await synthesize(TIER_2_VOICE);
                res.set('Content-Type', 'audio/mpeg');
                return res.send(audio);
            } catch (tier2Error) {
                console.error("All backend voice tiers exhausted.", tier2Error.message);
                res.status(429).send("Sage is resting. All neural pathways full.");
            }
        }
    }
});

exports.witnessPresence = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    const { thought } = req.body;
    // ... (rest of the file follows)
    if (!thought) {
        console.warn("No thought provided in request.");
        return res.status(400).send("No thought shared.");
    }

    try {
        const apiKey = geminiKey.value();
        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY secret is missing or empty.");
            throw new Error("Missing API Key");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
                Act as a Presence Coach based on 'The Power of Now'.
                Witness the 'voice in the head'.
                Reflect back from the perspective of the Witness.
                Guidelines: Compassionate, non-judgmental, focused on the 'gap', provide one 'Zen' action.
            `
        });

        const result = await model.generateContent(thought);
        const response = await result.response;
        const text = response.text();

        res.json({ reflection: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).send("The Witness is silent.");
    }
});

exports.getGrounding = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    const { emotion } = req.body;

    try {
        const genAI = new GoogleGenerativeAI(geminiKey.value());
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `The user is in a state of: "${emotion}". Generate a customized 1-minute 'No-Mind' grounding exercise.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ exercise: response.text() });
    } catch (error) {
        res.status(500).send("Feel your breath now.");
    }
});
exports.getDailyMeditation = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    const { dayNumber = 1 } = req.body;

    try {
        const genAI = new GoogleGenerativeAI(geminiKey.value());
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `
                You are a Presence Master. Generate a fresh, experiential meditation script for Day ${dayNumber}.
                Focus: A specific anchor to the 'Now' (senses, breath, inner body, or space).
                Guidelines:
                - Use a poetic, minimalist, and non-duplicate tone.
                - Structure as 5 short steps.
                - Total duration approx 2-3 minutes.
                - Include "human" elements: use ellipses (...) for pauses, exclamation (!) for subtle emphasis.
                - Return JSON format: { "title": "...", "steps": [ { "title": "Step 1", "instructions": ["point 1", "point 2"], "audioScript": "..." }, ... ] }
            `
        });

        const prompt = `Generate Day ${dayNumber} Meditation. Focus on a fresh gateway to Presence that feels lived, not read.`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const response = await result.response;
        const text = response.text();

        // Clean up any potential markdown code blocks if the AI includes them
        const cleanedJson = text.replace(/```json|```/gi, '').trim();
        res.json(JSON.parse(cleanedJson));
    } catch (error) {
        console.error("Daily Script Error:", error);
        res.status(500).send("Return to silence.");
    }
});

exports.analyzeEmotion = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.json({ emotion: "NEUTRAL" });

    try {
        const genAI = new GoogleGenerativeAI(geminiKey.value());
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Analyze the emotional resonance of this text: "${text}". 
        Return exactly ONE word from this list that best matches the overarching feeling: CALM, JOY, FOCUS, PANIC, ANGER, SAD, NEUTRAL.
        Do not add any markup or markdown. Just the single word.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ emotion: response.text().trim().toUpperCase() });
    } catch (error) {
        res.status(500).json({ emotion: "NEUTRAL" });
    }
});

exports.pingDaily = onRequest((req, res) => res.send("Zen Ping Successful"));
