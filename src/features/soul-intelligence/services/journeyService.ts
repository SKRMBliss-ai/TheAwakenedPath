import { db } from "../../../firebase";
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp } from "firebase/firestore";

/**
 * SERVICE: JourneyService
 * Handles persistence of user awareness progress and meditation sessions.
 */

export interface JourneyEntry {
    userId: string;
    activityId: number;
    activityTitle: string;
    xpEarned: number;
    timestamp: any;
    reflection?: string;
}

export const saveJourneyEntry = async (userId: string, activity: any, reflection?: string) => {
    try {
        const docRef = await addDoc(collection(db, "users", userId, "journey"), {
            activityId: activity.id,
            activityTitle: activity.title,
            xpEarned: activity.xp,
            reflection: reflection || "",
            timestamp: serverTimestamp()
        });
        console.log("Journey saved:", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error saving journey:", e);
        return null;
    }
};

export const getJourneyHistory = async (userId: string) => {
    try {
        const q = query(
            collection(db, "users", userId, "journey"),
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("Error fetching journey:", e);
        return [];
    }
};
