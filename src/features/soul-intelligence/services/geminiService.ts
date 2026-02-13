/**
 * SOUL INTELLIGENCE SERVICE
 * Refactored to use Secure Backend Proxy (Firebase Functions)
 * This ensures the Gemini API Key remains secret in Google Cloud Secret Manager.
 */

const API_BASE_URL = import.meta.env.PROD
    ? "" // Relative path works in production due to Firebase Hosting rewrites
    : "http://localhost:5001/awakened-path-2026/us-central1"; // Local emulator path

export async function getWitnessingReflection(userInput: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/witness`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thought: userInput })
        });

        if (!response.ok) throw new Error("Backend silent");

        const data = await response.json();
        return data.reflection;
    } catch (error) {
        console.error("Proxy Error:", error);
        return "The Witness is silent for a moment. Just stay present.";
    }
}

export async function getNoMindGrounding(emotionalInput: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/grounding`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emotion: emotionalInput })
        });

        if (!response.ok) throw new Error("Backend silent");

        const data = await response.json();
        return data.exercise;
    } catch (error) {
        console.error("Proxy Error:", error);
        return "The anchor is within. Feel your breath, the only thing that is happening right now.";
    }
}
