const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const textToSpeech = require("@google-cloud/text-to-speech");

// Define the secret created in Google Cloud Secret Manager
const geminiKey = defineSecret("AWAKENED_PATH_GEMINI_KEY");

// Text-to-Speech Client
const ttsClient = new textToSpeech.TextToSpeechClient();

exports.textToSpeech = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    const { text, gender = 'FEMALE' } = req.body;

    if (!text) return res.status(400).send("No text provided.");

    // Voice Tier 1: Vertex / Studio (Chirp 3 HD) - High fidelity, emotional
    const TIER_1_VOICE = gender === 'MALE' ? 'en-US-Chirp3-HD-Achird' : 'en-US-Chirp3-HD-Aoede';

    // Voice Tier 2: Neural2 (DeepMind) - Very human-like
    const TIER_2_VOICE = gender === 'MALE' ? 'en-US-Neural2-D' : 'en-US-Neural2-F';

    // Function to add meditative pauses and rhythmic breaks
    function meditationify(rawText) {
        // Add 1.5s break after sentences (Reduced from 2.5s to prevent confusion)
        let ssml = rawText.replace(/([.?!])\s+/g, '$1 <break time="1500ms"/> ');
        // Add 0.8s break after commas/semicolons (Reduced from 1.2s)
        ssml = ssml.replace(/([,;])\s+/g, '$1 <break time="800ms"/> ');
        // Wrap in speak tag
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
        console.log(`Attempting Tier 1 Meditative Voice: ${TIER_1_VOICE}`);
        const audio = await synthesize(TIER_1_VOICE);
        res.set('Content-Type', 'audio/mpeg');
        return res.send(audio);
    } catch (tier1Error) {
        console.warn("Tier 1 (Vertex) Limit reached or error. Falling back to Tier 2 (Neural2).", tier1Error.message);

        try {
            console.log(`Attempting Tier 2 Voice: ${TIER_2_VOICE}`);
            const audio = await synthesize(TIER_2_VOICE);
            res.set('Content-Type', 'audio/mpeg');
            return res.send(audio);
        } catch (tier2Error) {
            console.error("All backend voice tiers exhausted.", tier2Error.message);
            // Return 429 or 503 to signal "Quota Exhausted" to frontend
            res.status(429).send("Sage is resting. All neural pathways full.");
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
