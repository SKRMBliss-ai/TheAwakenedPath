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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
