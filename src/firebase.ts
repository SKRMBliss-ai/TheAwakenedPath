import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyDau-Q6HiBlp2NJ5H1u1GMyfLnUIoLd9aQ",
    authDomain: "awakened-path-2026.firebaseapp.com",
    projectId: "awakened-path-2026",
    storageBucket: "awakened-path-2026.firebasestorage.app",
    messagingSenderId: "264513105226",
    appId: "1:264513105226:web:c98c2198afc04f1eefe5b3"
};

const app = initializeApp(firebaseConfig);

/* App Check — attests that a call came from this web app rather than a script.
 *
 * It is what stops someone curling the callable endpoints in a loop, which
 * matters most for siteChat: that one spends Gemini quota on every request.
 *
 * Deliberately opt-in via env so this file is safe to ship before the key
 * exists. Without VITE_APPCHECK_SITE_KEY nothing initialises and every call
 * behaves exactly as it does today.
 *
 * To turn on: register a reCAPTCHA v3 site key under Firebase console → App
 * Check, set VITE_APPCHECK_SITE_KEY, deploy, confirm verified requests appear
 * in the App Check metrics, and only then flip CHAT_ENFORCE_APP_CHECK in
 * functions/index.js. Enforcing before tokens are live rejects real visitors.
 */
const appCheckSiteKey = import.meta.env.VITE_APPCHECK_SITE_KEY;
if (appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    // Lets a returning visitor reuse an attestation instead of re-running
    // reCAPTCHA on every message.
    isTokenAutoRefreshEnabled: true,
  });
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'us-central1');

export default app;
