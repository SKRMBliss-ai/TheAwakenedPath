import { useEffect, useState } from 'react';

/**
 * HOOK: usePresenceScheduler
 * Automatically triggers 'Gap' awareness reminders at routine intervals.
 * Routine Activities: Washing hands, Entering a room, Waiting for a door.
 */

export function usePresenceScheduler() {
    const [lastReminder, setLastReminder] = useState<string | null>(null);

    const GAP_ACTIVITIES = [
        "Washing your hands",
        "Walking up the stairs",
        "Waiting for the kettle",
        "Entering a new room",
        "Checking your phone"
    ];

    useEffect(() => {
        // Simple logic: Trigger a reminder every 30 minutes of app usage
        // or when the user performs a specific action (simulated here)
        const interval = setInterval(() => {
            const randomActivity = GAP_ACTIVITIES[Math.floor(Math.random() * GAP_ACTIVITIES.length)];
            setLastReminder(randomActivity);

            // Show a browser notification if permitted
            if (Notification.permission === "granted") {
                new Notification("Power of Now: GAP", {
                    body: `Be present with: ${randomActivity}. Feel the sense of 'being' behind the doing.`,
                    icon: "/sparkles.png"
                });
            }
        }, 30 * 60 * 1000); // 30 mins

        return () => clearInterval(interval);
    }, []);

    const requestPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    };

    return { lastReminder, requestPermission };
}
