import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyDau-Q6HiBlp2NJ5H1u1GMyfLnUIoLd9aQ",
    authDomain: "awakened-path-2026.firebaseapp.com",
    projectId: "awakened-path-2026",
    storageBucket: "awakened-path-2026.firebasestorage.app",
    messagingSenderId: "264513105226",
    appId: "1:264513105226:web:c98c2198afc04f1eefe5b3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
