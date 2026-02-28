const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const textToSpeech = require("@google-cloud/text-to-speech");

// Define the secret created in Google Cloud Secret Manager
const geminiKey = defineSecret("AWAKENED_PATH_GEMINI_KEY");

// Text-to-Speech Client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Gemini direct HTTP audio generation is not supported in the stable v1beta API yet.
// We are routing directly to Google Cloud Text-To-Speech (LM Journey Voices).

exports.textToSpeech = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    let { text, promptContext, gender = 'FEMALE' } = req.body;

    if (!text && !promptContext) return res.status(400).send("No text or context provided.");

    // Voice Tier 1: Journey Voices (Highly expressive LM-based voices equivalent to Gemini Native)
    const TIER_1_VOICE = gender === 'MALE' ? 'en-US-Journey-D' : 'en-US-Journey-F';

    // Voice Tier 2: Studio / Neural (DeepMind) - Very human-like fallbacks
    const TIER_2_VOICE = gender === 'MALE' ? 'en-US-Studio-Q' : 'en-US-Studio-O';

    // If context is provided, use Gemini to intelligently generate the spoken script
    if (promptContext) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey.value());
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: `
                    You are a compassionate, deeply intuitive, and highly human spiritual guide communicating via voice.
                    The user has provided context about what is happening on their screen or in their mind.
                    Your goal is to generate the EXPERIENTIAL AUDIO SCRIPT to guide them in this exact moment.

                    CRITICAL VOICE RULES:
                    1. DO NOT ever use ellipses ( "..." ) because the Google TTS engine will read them out loud as "dot dot dot". This ruins the immersion!
                    2. Instead, use commas (,) for short breath pauses and periods (.) for reflective pauses.
                    3. Do not include quotes, stage directions, or speaker labels. Return ONLY the spoken words.
                    4. Keep it relatively short (1 to 3 sentences max) unless instructed otherwise.
                    5. Be warm, empathetic, and speak directly to the user (e.g. "Ah, I see you chose...", "Notice how that feels...").
                `
            });
            const result = await model.generateContent(promptContext);
            const response = await result.response;
            text = response.text().trim();
            console.log("Dynamically generated intelligent voice script:", text);
        } catch (e) {
            console.warn("Failed to generate dynamic context voice, falling back to basic if present.", e.message);
            if (!text) return res.status(500).send("Failed to synthesize dynamic voice.");
        }
    }

    // Function to add meditative pauses and rhythmic breaks
    function meditationify(rawText) {
        // Strip any accidental ellipses from the raw text to strictly prevent "dot dot dot" sound
        let cleanText = rawText.replace(/\.{2,}/g, '.');
        // Add 2s break after sentences for deep absorption
        let ssml = cleanText.replace(/([.?!])\s+/g, '$1 <break time="1500ms"/> ');
        // Add 1s break after commas/semicolons
        ssml = ssml.replace(/([,;])\s+/g, '$1 <break time="800ms"/> ');
        return `<speak>${ssml}</speak>`;
    }

    const ssmlContent = meditationify(text);

    async function synthesize(voiceName, isJourney) {
        const request = {
            input: isJourney ? { text: text } : { ssml: ssmlContent },
            voice: { languageCode: 'en-US', name: voiceName },
            audioConfig: {
                audioEncoding: 'MP3',
            },
        };

        if (!isJourney) {
            request.audioConfig.speakingRate = 0.85;
            request.audioConfig.volumeGainDb = 2.0;
        }

        const [response] = await ttsClient.synthesizeSpeech(request);
        return response.audioContent;
    }

    try {
        console.log(`Attempting Tier 1 Meditative Voice: ${TIER_1_VOICE}`);
        const audio = await synthesize(TIER_1_VOICE, true);
        res.set('Content-Type', 'audio/mpeg');
        return res.send(audio);
    } catch (tier1Error) {
        console.warn("Tier 1 (Journey) Limit reached or error. Falling back to Tier 2.", tier1Error.message);

        try {
            console.log(`Attempting Tier 2 Voice: ${TIER_2_VOICE}`);
            const audio = await synthesize(TIER_2_VOICE, false);
            res.set('Content-Type', 'audio/mpeg');
            return res.send(audio);
        } catch (tier2Error) {
            console.error("All backend voice tiers exhausted.", tier2Error.message);
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
