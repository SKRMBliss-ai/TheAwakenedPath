import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
const getAuthDomain = () => {
    if (typeof window === 'undefined') return "awakened-path-2026.firebaseapp.com";
    const hostname = window.location.hostname;
    if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')
    ) {
        return "awakened-path-2026.firebaseapp.com";
    }
    return hostname;
};

const firebaseConfig = {
    apiKey: "AIzaSyDau-Q6HiBlp2NJ5H1u1GMyfLnUIoLd9aQ",
    authDomain: getAuthDomain(),
    projectId: "awakened-path-2026",
    storageBucket: "awakened-path-2026.firebasestorage.app",
    messagingSenderId: "264513105226",
    appId: "1:264513105226:web:c98c2198afc04f1eefe5b3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'us-central1');

export default app;
