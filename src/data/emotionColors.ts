export const EMOTION_COLORS: Record<string, string> = {
    // Anxiety group (orange)
    Anxiety: "#FFB74D", Pressure: "#FFB74D", Unease: "#FFB74D", Vigilance: "#FFB74D",
    // Sadness group (blue)
    Sadness: "#90CAF9", Loneliness: "#90CAF9", Discouragement: "#90CAF9",
    // Anger group (red)
    Irritation: "#E57373", Anger: "#E57373", Resentment: "#E57373",
    // Shame group (purple)
    Shame: "#CE93D8", Guilt: "#CE93D8", Insecurity: "#CE93D8",
    // Exhaustion group (green)
    Detachment: "#A5D6A7", Flatness: "#A5D6A7",
    // Peace group (teal)
    Calm: "#80CBC4", Content: "#80CBC4", Relieved: "#80CBC4",
};

export const MOOD_META: Record<string, { label: string; emoji: string }> = {
    "#FFB74D": { label: "Anxiety", emoji: "😰" },
    "#90CAF9": { label: "Sadness", emoji: "😢" },
    "#E57373": { label: "Anger", emoji: "😤" },
    "#CE93D8": { label: "Shame", emoji: "😳" },
    "#A5D6A7": { label: "Exhaustion", emoji: "😴" },
    "#80CBC4": { label: "Peace", emoji: "😌" },
};
