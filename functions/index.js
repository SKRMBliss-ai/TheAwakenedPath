const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Define the secret created in Google Cloud Secret Manager
const geminiKey = defineSecret("GEMINI_API_KEY");

exports.witnessPresence = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    const { thought } = req.body;
    console.log("Received thought:", thought);

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
        console.log("API Key present (length):", apiKey.length);

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

        console.log("Generating content with Gemini...");
        const result = await model.generateContent(thought);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini response generated successfully.");

        res.json({ reflection: text });
    } catch (error) {
        console.error("Gemini API Error Details:", error);
        res.status(500).send("The Witness is silent for a moment. (Error: " + error.message + ")");
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
