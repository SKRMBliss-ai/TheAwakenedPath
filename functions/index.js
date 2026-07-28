const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const functionsV1 = require("firebase-functions/v1");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const textToSpeech = require("@google-cloud/text-to-speech");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

if (admin.apps.length === 0) {
    admin.initializeApp({
        storageBucket: 'awakened-path-2026.firebasestorage.app'
    });
}

const db = admin.firestore();

// SECURITY: Single source of truth for admins. Helper enforces email_verified=true
// to prevent privilege escalation via unverified Firebase Auth signups.
const ADMIN_EMAILS = [
    'shrutikhungar@gmail.com',
    'simkatyal1@gmail.com',
    'rashmi.purbey@gmail.com',
    'smriti.duggal@gmail.com',
    'skrmblissai@gmail.com'
];
function isAdminRequest(request) {
    const tok = request && request.auth && request.auth.token;
    if (!tok) return false;
    if (tok.email_verified !== true) return false;
    return ADMIN_EMAILS.includes((tok.email || '').toLowerCase());
}
// Admin/team addresses must never be suppressed — they monitor and test the
// system, so the unsubscribe endpoint refuses them and the senders ignore any
// stale unsubscribed flag on them (self-heals an admin unsubscribed by testing).
const isAdminEmail = (e) => !!e && ADMIN_EMAILS.includes(String(e).toLowerCase());

// Define the secrets created in Google Cloud Secret Manager
const geminiKey = defineSecret("AWAKENED_PATH_GEMINI_KEY");
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");
const emailUser = defineSecret("EMAIL_USER");
const emailPass = defineSecret("EMAIL_PASS");
const youtubeApiKey = defineSecret("YOUTUBE_API_KEY");
// Razorpay webhook signing secret — was hard-coded as "YOUR_WEBHOOK_SECRET" before, breaking all webhook signature checks
const razorpayWebhookSecret = defineSecret("RAZORPAY_WEBHOOK_SECRET");

// Lead-finder secrets — Google Custom Search (Reddit uses public JSON, no key needed)
const googleSearchKey = defineSecret("GOOGLE_SEARCH_API_KEY");
const googleSearchCx = defineSecret("GOOGLE_SEARCH_CX");

// JaaS (8x8 Jitsi-as-a-Service) — App ID + API-key id are not strictly secret, but
// stored here for one consistent config mechanism. The private key MUST stay secret;
// it is what lets us mint per-user access tokens so end users never log in to Jitsi.
const jaasAppId = defineSecret("JAAS_APP_ID");
const jaasKid = defineSecret("JAAS_KID");
const jaasPrivateKey = defineSecret("JAAS_PRIVATE_KEY");

// Meditation hosts get a moderator token (can share video/screen, mute others, etc.).
const MEDITATION_MODERATOR_EMAILS = [
  "skrmblissai@gmail.com",
  "shrutikhungar@gmail.com",
  "simkatyal1@gmail.com",
  "smriti.duggal@gmail.com",
  "rashmi.purbey@gmail.com",
];

const b64url = (input) =>
  Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

/**
 * Mints a short-lived JaaS access token for the signed-in Firebase user, so the
 * meditation room can embed Jitsi WITHOUT any separate Jitsi login. The private
 * key never leaves the server. Hosts (MEDITATION_MODERATOR_EMAILS) get moderator
 * rights. Called as GET /api/jitsi-token with a Firebase ID token in the
 * Authorization: Bearer <idToken> header.
 */
exports.getJitsiToken = onRequest(
  { secrets: [jaasAppId, jaasKid, jaasPrivateKey], cors: true },
  async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
      if (!idToken) return res.status(401).json({ error: "Missing auth token" });

      let decoded;
      try {
        decoded = await admin.auth().verifyIdToken(idToken);
      } catch {
        return res.status(401).json({ error: "Invalid auth token" });
      }

      const appId = (jaasAppId.value() || "").trim();
      const kid = (jaasKid.value() || "").trim();
      const privateKey = jaasPrivateKey.value();
      if (!appId || !kid || !privateKey) {
        return res.status(500).json({ error: "JaaS not configured" });
      }

      const room = (req.query.room || "DailyMeditation").toString();
      const email = (decoded.email || "").toLowerCase();
      const isModerator = MEDITATION_MODERATOR_EMAILS.includes(email);
      const now = Math.floor(Date.now() / 1000);

      const header = { alg: "RS256", kid, typ: "JWT" };
      const payload = {
        aud: "jitsi",
        iss: "chat",
        sub: appId,
        room: "*",
        exp: now + 3 * 60 * 60,
        nbf: now - 10,
        context: {
          user: {
            id: decoded.uid,
            name: decoded.name || decoded.email || "Practitioner",
            email: decoded.email || undefined,
            avatar: decoded.picture || undefined,
            moderator: isModerator ? "true" : "false",
          },
          features: {
            livestreaming: "false",
            recording: isModerator ? "true" : "false",
            transcription: "false",
            "outbound-call": "false",
          },
        },
      };

      const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
      const signer = crypto.createSign("RSA-SHA256");
      signer.update(signingInput);
      signer.end();
      const signature = signer
        .sign(privateKey)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      return res.json({ jwt: `${signingInput}.${signature}`, appId, room, moderator: isModerator });
    } catch (e) {
      console.error("[getJitsiToken] error:", e);
      return res.status(500).json({ error: "Token generation failed" });
    }
  }
);

// Text-to-Speech Client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Pricing Configuration (Keep in sync with frontend)
const COURSE_PRICES = {
    "emotion_feelings_course": 4.99,
    "wisdom_untethered": 9,
    "all_access": 199.99,
    "track_1": 14.99,
    "observer-echo": 14.99,
    "gratitude-flow": 14.99,
    "gratitude-flow-harmonic": 14.99,
    "cellular-healing": 14.99,
    "om-vacuum": 14.99,
    "become-the-watcher": 19.99,
    "worry-small-1": 14.99,
    "worry-small-2": 14.99,
    "the-watcher-identity": 14.99,
    "tired-of-searching-guru": 14.99,
    "track_2": 14.99,
    "you-are-space": 14.99
};

const COURSE_PRICES_INR = {
    "emotion_feelings_course": 415,
    "wisdom_untethered": 799,
    "all_access": 14999,
    "track_1": 899,
    "observer-echo": 899,
    "gratitude-flow": 899,
    "gratitude-flow-harmonic": 899,
    "cellular-healing": 899,
    "om-vacuum": 899,
    "become-the-watcher": 1199,
    "worry-small-1": 899,
    "worry-small-2": 899,
    "the-watcher-identity": 899,
    "tired-of-searching-guru": 899,
    "track_2": 899,
    "you-are-space": 899
};

// Multi-currency pricing. INR/USD tables above cover every course; the extra
// currencies below are for the actively-sold course(s). Any course/currency not
// listed falls back to USD so checkout can never break. Keep the VALUES in sync
// with the frontend (checkoutPriceLabel in EmotionFeelingsCourse.tsx).
const COURSE_PRICES_BY_CURRENCY = {
    INR: COURSE_PRICES_INR,
    USD: COURSE_PRICES,
    EUR: { "emotion_feelings_course": 4.99 },
    GBP: { "emotion_feelings_course": 3.99 },
    CAD: { "emotion_feelings_course": 6.99 },
    AUD: { "emotion_feelings_course": 7.99 },
    AED: { "emotion_feelings_course": 18 },
    SGD: { "emotion_feelings_course": 6.99 },
};

// Resolve the charge currency + amount for a course. Falls back to USD when the
// requested currency isn't priced for that course.
function resolveCoursePrice(courseId, requestedCurrency) {
    const cur = String(requestedCurrency || "USD").toUpperCase();
    const table = COURSE_PRICES_BY_CURRENCY[cur];
    if (table && table[courseId] != null) return { currency: cur, amount: table[courseId] };
    return { currency: "USD", amount: COURSE_PRICES[courseId] };
}

// ─── Pay-What-You-Want products ────────────────────────────────────────────
// The buyer picks their own amount (a slider on the frontend); the server only
// enforces a floor per currency so checkout can never be $0 or negative. Two
// grant shapes: 'course' (permanent unlock, same as fixed-price courses) and
// 'membership' (adds/extends a time-limited membershipUntil on the profile —
// Mind Gym premium without a recurring Razorpay subscription, so any amount
// works and renewal is just "buy again").
const PWYW_PRODUCTS = {
    emotion_feelings_course: {
        grantType: "course",
        suggested: { USD: 4.99, INR: 415, EUR: 4.99, GBP: 3.99, CAD: 6.99, AUD: 7.99, AED: 18, SGD: 6.99 },
        min: { USD: 2, INR: 99, EUR: 2, GBP: 2, CAD: 3, AUD: 3, AED: 8, SGD: 3 },
    },
    membership_monthly: {
        grantType: "membership",
        days: 30,
        suggested: { USD: 3, INR: 240, EUR: 3, GBP: 3, CAD: 4, AUD: 4, AED: 12, SGD: 4 },
        min: { USD: 2, INR: 99, EUR: 2, GBP: 2, CAD: 3, AUD: 3, AED: 8, SGD: 3 },
    },
    membership_yearly: {
        grantType: "membership",
        days: 365,
        suggested: { USD: 30, INR: 2400, EUR: 30, GBP: 25, CAD: 40, AUD: 45, AED: 110, SGD: 40 },
        min: { USD: 12, INR: 999, EUR: 12, GBP: 10, CAD: 16, AUD: 18, AED: 44, SGD: 16 },
    },
};

// Clamp a client-chosen amount to the product's floor for the resolved charge
// currency. Falls back to the currency's suggested amount if none/invalid was
// sent, and to USD if the requested currency isn't priced for this product.
function resolvePwywAmount(productId, requestedCurrency, requestedAmount) {
    const product = PWYW_PRODUCTS[productId];
    if (!product) return null;
    const reqCur = String(requestedCurrency || "USD").toUpperCase();
    const chargeCurrency = product.min[reqCur] != null ? reqCur : "USD";
    const min = product.min[chargeCurrency];
    let amount = Number(requestedAmount);
    if (!Number.isFinite(amount) || amount <= 0) amount = product.suggested[chargeCurrency] ?? min;
    amount = Math.max(amount, min);
    amount = chargeCurrency === "INR" || chargeCurrency === "JPY" ? Math.round(amount) : Math.round(amount * 100) / 100;
    return { currency: chargeCurrency, amount, grantType: product.grantType, days: product.days || null };
}

// Extend (not replace) a membership: stacks from the LATER of "now" or the
// current expiry, so buying more time before/after lapsing both work as
// expected instead of a second purchase ever shortening access.
function extendMembershipUntilMs(currentTimestamp, days) {
    const now = Date.now();
    const base = currentTimestamp && typeof currentTimestamp.toMillis === "function"
        ? Math.max(currentTimestamp.toMillis(), now)
        : now;
    return base + days * 24 * 60 * 60 * 1000;
}

const SUBSCRIPTION_PLANS = {
    "premium_monthly": {
        name: "Mind Gym Premium",
        description: "Monthly recurring subscription for full application access",
        amount: 9.99, // USD
        period: "monthly",
        interval: 1,
        total_count: 120 // 10 years max
    },
    "premium_yearly": {
        name: "Mind Gym Premium (Annual)",
        description: "Yearly recurring subscription for full application access",
        amount: 99.90, // USD
        period: "yearly",
        interval: 1,
        total_count: 10 // 10 years max
    }
};

const SUBSCRIPTION_PLANS_INR = {
    "premium_monthly": {
        name: "Mind Gym Premium (INR)",
        description: "Monthly recurring subscription for full application access",
        amount: 799, // INR
        period: "monthly",
        interval: 1,
        total_count: 120
    },
    "premium_yearly": {
        name: "Mind Gym Premium Annual (INR)",
        description: "Yearly recurring subscription for full application access",
        amount: 7999, // INR
        period: "yearly",
        interval: 1,
        total_count: 10
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Daily Practice Rotation — 7 practices, one per day of the week (Sun→Sat)
// Mirrors the practiceLibrary on the frontend.
// ─────────────────────────────────────────────────────────────────────────────
const DAILY_PRACTICE_ROTATION = [
    // 0 = Sunday
    {
        q: 'question1',
        name: '"I Can Handle This" Redirect',
        tagline: 'Use the higher mind to lift what the lower mind is dragging down.',
        duration: '~30 seconds when triggered',
        teaser: 'One real moment of redirection is all it takes. You will know exactly when it is.'
    },
    // 1 = Monday
    {
        q: 'question2',
        name: 'The Radio Check',
        tagline: 'You are the listener in the room. You are not the radio.',
        duration: '2 minutes',
        teaser: 'What you notice in the first 30 seconds of silence will surprise you.'
    },
    // 2 = Tuesday
    {
        q: 'question3',
        name: 'The One-Second Cosmic Pause',
        tagline: 'Pause. Relax. Release. Three times today, for just one breath.',
        duration: '1 minute total',
        teaser: 'A single breath can change your entire day. We will show you where to place it.'
    },
    // 3 = Wednesday
    {
        q: 'question4',
        name: 'The Silent Observation',
        tagline: 'Notice the stillness behind the movement.',
        duration: '1 minute',
        teaser: 'The space was always there. Tonight you will actually feel it.'
    },
    // 4 = Thursday
    {
        q: 'question5',
        name: 'The Clarity Sit',
        tagline: 'Sit comfortably within — despite any noise the mind is making.',
        duration: '3 minutes',
        teaser: 'You will be surprised how quickly the noise settles when you stop fighting it.'
    },
    // 5 = Friday
    {
        q: 'question6',
        name: 'The Guilt Witness',
        tagline: 'The one who sees the guilt is not the one who is guilty.',
        duration: '2 minutes',
        teaser: 'There is a part of you that has never felt guilty a single day of its life.'
    },
    // 6 = Saturday
    {
        q: 'question7',
        name: 'The Noticing Celebration',
        tagline: 'Measure progress by how quickly you catch yourself, not by years of silence.',
        duration: '3 minutes',
        teaser: 'You will catch yourself mid-thought tonight and feel something unexpected — pride.'
    },
];

/**
 * Returns today's practice based on day of week.
 */
// ─────────────────────────────────────────────────────────────────────────────
// Daily Mind Gym · Daily Practices — Small, powerful anchors for the day.
// ─────────────────────────────────────────────────────────────────────────────
const DAILY_REMINDERS = [
    "Peace is a Choice. Not a State.",
    "You are the Witness, not the Voice.",
    "Relax in the face of everything.",
    "The mind is a tool, not the master.",
    "Silence is your natural home.",
    "Nothing can touch the true You.",
    "Flow with Life, do not fight it."
];

function getTodaysReminder() {
    const day = new Date().getDay();
    return DAILY_REMINDERS[day];
}

function getTodaysPractice() {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return DAILY_PRACTICE_ROTATION[dayOfWeek];
}

// 7 rotating subject lines — one per day of week
// No emojis in subjects — emoji is a strong Gmail Promotions classifier.
// Clear, direct — tells the reader what they get, not a riddle.
const DAILY_SUBJECTS = [
    'Your Sunday guide: How to quiet your mind tonight',           // Sun
    'Today\'s article: Why your brain won\'t stop overthinking',   // Mon
    'This week\'s practice: 4 steps to feel calmer in 5 minutes', // Tue
    'New guide: How to stop anxiety before it starts',             // Wed
    'Today\'s read: The science of being present',                 // Thu
    'Your Friday guide: How to process emotions without being overwhelmed', // Fri
    'Weekend practice: Meditation for people who can\'t sit still', // Sat
];

// Daily YouTube rotation (Sun->Sat) from Soulful Intelligence Studio.
const DAILY_VIDEO_ROTATION = [
    { id: "rLXnxzq_Dlk", title: "The Witness Practice", focus: "Return to the watcher behind thought." },
    { id: "cGfM9JwzY8s", title: "Relax and Release", focus: "Soften resistance and let the moment move through." },
    { id: "l0Hq6YQv4zA", title: "One Breath Presence", focus: "Use one conscious breath to reset attention." },
    { id: "bqQ9fN7b2XM", title: "Silent Observation", focus: "Feel the stillness beneath mental movement." },
    { id: "VgQx7S8kT3A", title: "Inner Clarity Sit", focus: "Sit as awareness while the mind settles itself." },
    { id: "xA0m8uY2kNQ", title: "Witnessing Emotions", focus: "Observe feelings without becoming them." },
    { id: "Qh7Jk2Pz6LM", title: "Celebrate Noticing", focus: "Treat each moment of awareness as progress." }
];

function getTodaysVideo() {
    const day = new Date().getDay();
    return DAILY_VIDEO_ROTATION[day];
}

function parseYouTubeDurationToSeconds(iso) {
    if (!iso || typeof iso !== 'string') return 0;
    const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
    if (!m) return 0;
    const h = parseInt(m[1] || '0', 10);
    const min = parseInt(m[2] || '0', 10);
    const sec = parseInt(m[3] || '0', 10);
    return (h * 3600) + (min * 60) + sec;
}

function httpsGetJsonWithHeaders(url, headers) {
    return new Promise((resolve, reject) => {
        const https = require('https');
        const req = https.get(url, { headers: headers || {} }, (res) => {
            let raw = '';
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    const snippet = (raw || '').slice(0, 700);
                    const err = new Error(`HTTP ${res.statusCode} from ${url.split('?')[0]} :: ${snippet}`);
                    err.responseBody = raw;
                    return reject(err);
                }
                try {
                    resolve(JSON.parse(raw));
                } catch (e) {
                    reject(new Error(`Invalid JSON response: ${e.message}`));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => req.destroy(new Error('Request timeout')));
    });
}

// Resolve the studio's YouTube handle to its "uploads" playlist id. Handles
// the case where forHandle returns nothing by falling back to channel search.
async function resolveUploadsPlaylistId(youtubeKey, handle) {
    const ua = { 'User-Agent': 'MindGym/1.0' };
    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(youtubeKey)}`;
    const channelsData = await httpsGetJsonWithHeaders(channelsUrl, ua);
    const item = channelsData && channelsData.items && channelsData.items[0];
    let uploads = item && item.contentDetails && item.contentDetails.relatedPlaylists && item.contentDetails.relatedPlaylists.uploads;
    if (uploads) return uploads;

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent('Soulful Intelligence Studio')}&key=${encodeURIComponent(youtubeKey)}`;
    const searchData = await httpsGetJsonWithHeaders(searchUrl, ua);
    const channelId = searchData && searchData.items && searchData.items[0] && searchData.items[0].snippet && searchData.items[0].snippet.channelId;
    if (!channelId) return null;
    const byIdUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(youtubeKey)}`;
    const byId = await httpsGetJsonWithHeaders(byIdUrl, ua);
    const byIdItem = byId && byId.items && byId.items[0];
    return (byIdItem && byIdItem.contentDetails && byIdItem.contentDetails.relatedPlaylists && byIdItem.contentDetails.relatedPlaylists.uploads) || null;
}

/**
 * Latest public uploads for the studio channel, for the "Latest from YouTube"
 * strip on the home page.
 *
 * Cached in Firestore for 6h: the YouTube Data API has a hard daily quota, and
 * this is called on every anonymous home-page view — uncached it would burn the
 * quota within hours and start returning empty. On any API failure we serve the
 * last good cache (even if stale) rather than showing an empty section.
 */
exports.getLatestVideos = onRequest({ secrets: [youtubeApiKey], cors: true }, async (req, res) => {
    const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
    const max = Math.min(Math.max(parseInt(req.query.max, 10) || 6, 1), 12);
    const cacheRef = db.collection('cache').doc('latest_youtube_videos');

    let cached = null;
    try {
        const snap = await cacheRef.get();
        if (snap.exists) cached = snap.data();
    } catch (e) {
        console.warn('[getLatestVideos] cache read failed:', e.message);
    }

    const cacheAge = cached && cached.fetchedAt && cached.fetchedAt.toMillis
        ? Date.now() - cached.fetchedAt.toMillis()
        : Infinity;
    // A payload written before a field was added is stale regardless of age —
    // otherwise a schema change silently serves the old shape for a full TTL.
    const cacheHasCurrentShape = !!(cached && Array.isArray(cached.videos)
        && cached.videos.length && 'durationSec' in cached.videos[0]);
    if (cached && Array.isArray(cached.videos) && cached.videos.length
        && cacheAge < CACHE_TTL_MS && cacheHasCurrentShape) {
        res.set('Cache-Control', 'public, max-age=1800');
        return res.json({ videos: cached.videos.slice(0, max), cached: true });
    }

    try {
        const key = youtubeApiKey.value();
        if (!key) throw new Error('YOUTUBE_API_KEY not configured');

        const uploads = await resolveUploadsPlaylistId(key, '@SoulfulIntelligenceStudio');
        if (!uploads) throw new Error('Could not resolve uploads playlist');

        const ua = { 'User-Agent': 'MindGym/1.0' };
        const listUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploads)}&maxResults=20&key=${encodeURIComponent(key)}`;
        const listData = await httpsGetJsonWithHeaders(listUrl, ua);

        const candidates = ((listData && listData.items) || []).map((it) => {
            const s = it && it.snippet;
            const vid = s && s.resourceId && s.resourceId.videoId;
            const t = s && s.thumbnails;
            return vid ? {
                id: vid,
                title: (s && s.title) || '',
                publishedAt: (s && s.publishedAt) || null,
                thumb: (t && t.maxres && t.maxres.url) || (t && t.high && t.high.url)
                    || (t && t.medium && t.medium.url) || (t && t.default && t.default.url) || null,
            } : null;
        }).filter(Boolean);

        if (!candidates.length) throw new Error('No playlist items returned');

        // Keep only public, non-live, non-Shorts videos (same rules the daily
        // email uses) so the home strip shows real long-form content.
        const ids = candidates.map(v => v.id).slice(0, 20);
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=status,snippet,contentDetails&id=${encodeURIComponent(ids.join(','))}&key=${encodeURIComponent(key)}`;
        const videosData = await httpsGetJsonWithHeaders(videosUrl, ua);

        const allowed = new Set();
        // Duration is already parsed here for the Shorts filter, so keep it and
        // hand it to the client — the videos section shows a runtime badge.
        const durations = new Map();
        ((videosData && videosData.items) || []).forEach((v) => {
            const isPublic = v.status && v.status.privacyStatus === 'public';
            const broadcast = (v.snippet && v.snippet.liveBroadcastContent) || 'none';
            const title = ((v.snippet && v.snippet.title) || '').toLowerCase();
            const durationSec = parseYouTubeDurationToSeconds(v.contentDetails && v.contentDetails.duration);
            const isShort = title.includes('#shorts') || (durationSec > 0 && durationSec <= 75);
            if (isPublic && broadcast === 'none' && !isShort) {
                allowed.add(v.id);
                durations.set(v.id, durationSec);
            }
        });

        const videos = candidates
            .filter(v => allowed.has(v.id))
            .map(v => ({ ...v, durationSec: durations.get(v.id) || 0 }))
            .slice(0, 12);
        if (!videos.length) throw new Error('No eligible videos after filtering');

        await cacheRef.set({ videos, fetchedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

        res.set('Cache-Control', 'public, max-age=1800');
        return res.json({ videos: videos.slice(0, max), cached: false });
    } catch (err) {
        console.error('[getLatestVideos] failed:', err.message);
        // Stale cache beats an empty section.
        if (cached && Array.isArray(cached.videos) && cached.videos.length) {
            return res.json({ videos: cached.videos.slice(0, max), cached: true, stale: true });
        }
        return res.status(200).json({ videos: [], error: 'unavailable' });
    }
});

async function getDailyYoutubeVideo(youtubeKey, firestoreDb) {
    if (!youtubeKey) return getTodaysVideo();

    const fallback = getTodaysVideo();
    const handle = '@SoulfulIntelligenceStudio';
    try {
        // 0) Get video IDs sent in the last 3 days so we can avoid repeating them
        const recentlySentIds = new Set();
        if (firestoreDb) {
            try {
                const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                const blastsSnap = await firestoreDb.collection('email_blasts')
                    .where('sentAt', '>=', threeDaysAgo)
                    .where('videoId', '!=', null)
                    .get();
                blastsSnap.docs.forEach(d => {
                    const vid = d.data().videoId;
                    if (vid) recentlySentIds.add(vid);
                });
                console.log('[YouTube] Recently sent video IDs (last 3 days):', [...recentlySentIds]);
            } catch (e) {
                console.log('[YouTube] Could not query recent blasts:', e.message);
            }
        }

        // 1) Resolve handle -> uploads playlist
        const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(handle)}&key=${encodeURIComponent(youtubeKey)}`;
        console.log('[YouTube] Resolving channel with handle:', handle);
        const channelsData = await httpsGetJsonWithHeaders(channelsUrl, {
            'User-Agent': 'MindGym/1.0'
        });
        const channelItem = channelsData && channelsData.items && channelsData.items[0];
        let uploadsPlaylistId = channelItem && channelItem.contentDetails && channelItem.contentDetails.relatedPlaylists && channelItem.contentDetails.relatedPlaylists.uploads;

        // Fallback: resolve channel via search endpoint if forHandle fails/returns none.
        if (!uploadsPlaylistId) {
            console.log('[YouTube] Handle lookup returned no uploads playlist, trying search fallback.');
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent('Soulful Intelligence Studio')}&key=${encodeURIComponent(youtubeKey)}`;
            const searchData = await httpsGetJsonWithHeaders(searchUrl, {
                'User-Agent': 'MindGym/1.0'
            });
            const channelId = searchData && searchData.items && searchData.items[0] && searchData.items[0].snippet && searchData.items[0].snippet.channelId;
            if (!channelId) {
                console.log('[YouTube] Search fallback failed to resolve channel id.');
                return fallback;
            }
            const channelsByIdUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(youtubeKey)}`;
            const channelsById = await httpsGetJsonWithHeaders(channelsByIdUrl, {
                'User-Agent': 'MindGym/1.0'
            });
            const byIdItem = channelsById && channelsById.items && channelsById.items[0];
            uploadsPlaylistId = byIdItem && byIdItem.contentDetails && byIdItem.contentDetails.relatedPlaylists && byIdItem.contentDetails.relatedPlaylists.uploads;
            if (!uploadsPlaylistId) {
                console.log('[YouTube] Could not resolve uploads playlist from channel id fallback.');
                return fallback;
            }
        }
        console.log('[YouTube] uploadsPlaylistId:', uploadsPlaylistId);

        // 2) Read latest uploads from channel uploads playlist (fetch more to have fallbacks)
        const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=25&key=${encodeURIComponent(youtubeKey)}`;
        const playlistData = await httpsGetJsonWithHeaders(playlistItemsUrl, {
            'User-Agent': 'MindGym/1.0'
        });

        const playlistVideos = ((playlistData && playlistData.items) || [])
            .map((item) => {
                const snippet = item && item.snippet;
                const resource = snippet && snippet.resourceId;
                const videoId = resource && resource.videoId;
                const title = (snippet && snippet.title) || '';
                const thumbs = snippet && snippet.thumbnails;
                const thumb =
                    (thumbs && thumbs.maxres && thumbs.maxres.url) ||
                    (thumbs && thumbs.high && thumbs.high.url) ||
                    (thumbs && thumbs.medium && thumbs.medium.url) ||
                    (thumbs && thumbs.default && thumbs.default.url) ||
                    null;
                return videoId ? { id: videoId, title, thumb } : null;
            })
            .filter(Boolean);

        if (!playlistVideos.length) return fallback;

        // 3) Validate: fetch status + snippet + contentDetails + statistics for all candidates
        const ids = playlistVideos.map(v => v.id).slice(0, 25);
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=status,snippet,contentDetails,statistics&id=${encodeURIComponent(ids.join(','))}&key=${encodeURIComponent(youtubeKey)}`;
        const videosData = await httpsGetJsonWithHeaders(videosUrl, {
            'User-Agent': 'MindGym/1.0'
        });

        // Build a stats map keyed by id for quick lookup
        const statsMap = {};
        ((videosData && videosData.items) || []).forEach((v) => {
            const isPublic = v.status && v.status.privacyStatus === 'public';
            const broadcastStatus = (v.snippet && v.snippet.liveBroadcastContent) || 'none';
            const isLiveOrScheduled = broadcastStatus === 'live' || broadcastStatus === 'upcoming';
            const title = ((v.snippet && v.snippet.title) || '').toLowerCase();
            const durationSec = parseYouTubeDurationToSeconds(v.contentDetails && v.contentDetails.duration);
            const isShortByTitle = title.includes('#shorts') || title.includes(' shorts');
            const isShortByLength = durationSec > 0 && durationSec <= 75;
            if (isLiveOrScheduled) {
                console.log(`[YouTube] Skipping ${broadcastStatus} video: ${v.id} - ${v.snippet && v.snippet.title}`);
            }
            if (isPublic && !isLiveOrScheduled && !isShortByTitle && !isShortByLength) {
                statsMap[v.id] = {
                    viewCount: parseInt((v.statistics && v.statistics.viewCount) || '0', 10),
                    likeCount: parseInt((v.statistics && v.statistics.likeCount) || '0', 10),
                };
            }
        });

        // Filter playlist to only valid candidates (public, not live/scheduled, not shorts)
        const validVideos = playlistVideos.filter(v => statsMap[v.id]);
        if (!validVideos.length) {
            console.log('[YouTube] No valid public videos found; using fallback.');
            return fallback;
        }

        // 4) Smart selection:
        //    a) Latest video not sent in last 3 days  → use it
        //    b) If latest was sent → best by views not sent in last 3 days
        //    c) If all top by views also sent → next best by views (even if sent before)
        const latestVideo = validVideos[0]; // playlist is newest-first

        let pick;
        if (!recentlySentIds.has(latestVideo.id)) {
            // Latest is fresh — use it
            pick = latestVideo;
            console.log('[YouTube] Using latest video (not recently sent):', pick.id, pick.title);
        } else {
            console.log('[YouTube] Latest video was recently sent:', latestVideo.id, '— looking for best performer.');
            // Sort all valid videos by viewCount descending
            const byViews = [...validVideos].sort((a, b) =>
                (statsMap[b.id].viewCount || 0) - (statsMap[a.id].viewCount || 0)
            );
            // Find best not sent recently
            pick = byViews.find(v => !recentlySentIds.has(v.id));
            if (pick) {
                console.log(`[YouTube] Using best performer not recently sent: ${pick.id} (${statsMap[pick.id].viewCount} views) - ${pick.title}`);
            } else {
                // All top performers were also sent — just pick the highest-viewed regardless
                pick = byViews[0];
                console.log(`[YouTube] All candidates recently sent; using top by views: ${pick.id} (${statsMap[pick.id].viewCount} views) - ${pick.title}`);
            }
        }

        return {
            id: pick.id,
            title: pick.title || fallback.title,
            focus: fallback.focus,
            thumb: pick.thumb || `https://img.youtube.com/vi/${pick.id}/hqdefault.jpg`,
            viewCount: statsMap[pick.id] ? statsMap[pick.id].viewCount : 0,
        };
    } catch (e) {
        console.error('YouTube API fetch failed, using fallback rotation:', e.message);
        if (e && e.responseBody) {
            console.error('[YouTube] API error response body:', String(e.responseBody).slice(0, 900));
        }
        return fallback;
    }
}

/**
 * Creates a Razorpay Order
 */
exports.createRazorpayOrder = onRequest({ secrets: [razorpayKeyId, razorpayKeySecret], cors: true }, async (req, res) => {
    const { courseId, userId, currency = "USD", guestEmail, guestPhone, amount: clientAmount } = req.body;

    // 1. Resolve price + charge currency. PWYW products (course-only donation,
    //    membership monthly/yearly) take the buyer's own amount, clamped to a
    //    floor; everything else keeps its fixed server-side price — no
    //    regression for wisdom_untethered, all_access, soundscape tracks, etc.
    const pwyw = resolvePwywAmount(courseId, currency, clientAmount);
    let chargeCurrency, amount, grantType = "course", membershipDays = null;
    if (pwyw) {
        chargeCurrency = pwyw.currency;
        amount = pwyw.amount;
        grantType = pwyw.grantType;
        membershipDays = pwyw.days;
    } else {
        const resolved = resolveCoursePrice(courseId, currency);
        chargeCurrency = resolved.currency;
        amount = resolved.amount;
    }

    if (amount == null) {
        return res.status(400).send("Invalid or missing courseId");
    }

    try {
        const razorpay = new Razorpay({
            key_id: razorpayKeyId.value(),
            key_secret: razorpayKeySecret.value(),
        });

        const buildOptions = (cur, amt) => ({
            amount: Math.round(amt * 100), // In cents/paise
            currency: cur,
            receipt: `r_${courseId.substring(0, 20)}_${Date.now()}`,
            notes: {
                courseId: courseId,
                userId: userId || "anonymous",
                currency: cur,
                grantType,
                membershipDays: membershipDays ? String(membershipDays) : "",
                // Captured on our page → reliable guest key even if the buyer skips
                // the email field inside the Razorpay widget (e.g. UPI-only).
                guestEmail: String(guestEmail || "").toLowerCase().trim(),
                guestPhone: String(guestPhone || "").trim()
            }
        });

        let order;
        try {
            order = await razorpay.orders.create(buildOptions(chargeCurrency, amount));
        } catch (curErr) {
            // A presentment currency the Razorpay account isn't enabled for will
            // fail here — fall back to USD so checkout still completes instead of
            // erroring out. (Enable the currency in Razorpay to charge it natively.)
            if (chargeCurrency !== "USD") {
                console.warn(`Currency ${chargeCurrency} rejected by Razorpay; falling back to USD.`, curErr?.error?.description || curErr?.message);
                chargeCurrency = "USD";
                amount = pwyw ? resolvePwywAmount(courseId, "USD", clientAmount).amount : COURSE_PRICES[courseId];
                order = await razorpay.orders.create(buildOptions("USD", amount));
            } else {
                throw curErr;
            }
        }

        // Return the publishable key_id (from Secret Manager) so the browser
        // never needs it baked in at build time via a .env / VITE_ var.
        res.json({ ...order, key_id: razorpayKeyId.value() });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).send("Failed to create payment order");
    }
});

/**
 * Verifies Razorpay Payment Signature and grants access
 */
exports.verifyRazorpayPayment = onRequest({ secrets: [razorpayKeyId, razorpayKeySecret, emailUser, emailPass], cors: true }, async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        userId,
        courseId
    } = req.body;

    if (!userId || !courseId || !razorpay_signature) {
        return res.status(400).send("Missing verification parameters");
    }

    try {
        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret.value())
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).send("Invalid payment signature");
        }

        // 2. Fetch order to verify details haven't been tampered with
        const razorpay = new Razorpay({
            key_id: razorpayKeyId.value(),
            key_secret: razorpayKeySecret.value(),
        });
        
        const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
        
        // Ensure the paid order was indeed for this user and this course
        // (Bypass userId check if they are guest_pending)
        if ((rzpOrder.notes.userId !== userId && userId !== 'guest_pending') || rzpOrder.notes.courseId !== courseId) {
            return res.status(400).send("Order data mismatch. Discrepancy detected.");
        }

        // 3. Grant Access in Firestore — 'membership' extends membershipUntil
        //    (Mind Gym premium, any PWYW amount); 'course' unlocks permanently
        //    via purchasedCourses (unchanged, fixed-price and PWYW course alike).
        let userEmail = null;
        const grantType = rzpOrder.notes.grantType === 'membership' ? 'membership' : 'course';
        const membershipDays = parseInt(rzpOrder.notes.membershipDays || '0', 10) || null;
        const isGuest = userId === 'guest_pending' || userId.startsWith('guest_');
        if (isGuest) {
            const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
            // Prefer the email WE captured on our page (order notes) — reliable even
            // if the buyer skipped the email field in the widget. Fall back to
            // Razorpay's, ignoring its "void@razorpay.com" placeholder. Normalised
            // (lowercase) so it matches the email at signup for account-linking.
            const notesEmail = String(rzpOrder.notes.guestEmail || '').toLowerCase().trim();
            const rzpEmail = String(rzpPayment.email || '').toLowerCase().trim();
            userEmail = notesEmail || (rzpEmail !== 'void@razorpay.com' ? rzpEmail : '');
            const guestPhone = String(rzpOrder.notes.guestPhone || rzpPayment.contact || '').trim();

            if (userEmail) {
                const guestRef = db.collection("guestPurchases").doc(userEmail);
                if (grantType === 'membership' && membershipDays) {
                    const guestSnap = await guestRef.get();
                    const newUntilMs = extendMembershipUntilMs(guestSnap.exists ? guestSnap.data().membershipUntil : null, membershipDays);
                    await guestRef.set({
                        email: userEmail,
                        phone: guestPhone,
                        membershipUntil: admin.firestore.Timestamp.fromMillis(newUntilMs),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } else {
                    const updateData = {
                        email: userEmail,
                        phone: guestPhone,
                        purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    };
                    if (COURSE_PRICES[courseId] && courseId !== 'wisdom_untethered' && courseId !== 'all_access') {
                        updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(courseId);
                    }
                    await guestRef.set(updateData, { merge: true });
                }
            }
        } else {
            const userRef = db.collection("users").doc(userId);

            // Fetch user to get email for welcome notification (and current
            // membershipUntil, when extending).
            const userDoc = await userRef.get();
            userEmail = userDoc.exists ? userDoc.data().email : null;

            if (grantType === 'membership' && membershipDays) {
                const newUntilMs = extendMembershipUntilMs(userDoc.exists ? userDoc.data().membershipUntil : null, membershipDays);
                await userRef.set({
                    membershipUntil: admin.firestore.Timestamp.fromMillis(newUntilMs),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } else {
                const updateData = {
                    purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };
                // If it's a soundscape track, also add to ownedTracks
                if (COURSE_PRICES[courseId] && courseId !== 'wisdom_untethered' && courseId !== 'all_access') {
                    updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(courseId);
                }
                await userRef.set(updateData, { merge: true });
            }
        }

        // Send the right email: guests must be told to sign up with THIS email
        // to unlock; existing users get the standard welcome.
        if (userEmail) {
            try {
                if (isGuest) {
                    await sendGuestAccessEmail(userEmail);
                } else {
                    const planName = grantType === 'membership'
                        ? (membershipDays && membershipDays >= 300 ? 'Mind Gym Membership (Yearly)' : 'Mind Gym Membership (Monthly)')
                        : (courseId === 'all_access' ? 'Premium (Lifetime)' : courseId);
                    await sendWelcomeEmail(userEmail, planName);
                }
            } catch (emailErr) {
                console.error("Failed to send access email:", emailErr);
            }
        }

        // 4. Log the transaction (Atomic/Secure) — record the actual paid amount &
        //    currency from the Razorpay order, not the USD price map (was wrong for INR).
        const paidCurrency = rzpOrder.currency || (rzpOrder.notes && rzpOrder.notes.currency) || 'USD';
        const paidAmountMajor = typeof rzpOrder.amount === 'number' ? rzpOrder.amount / 100 : null;
        await db.collection("transactions").doc(razorpay_payment_id).set({
            userId,
            courseId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: paidAmountMajor,
            currency: paidCurrency,
            status: "SUCCESS",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: "Access granted" });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).send("Verification failed");
    }
});

/**
 * Creates a Razorpay Subscription
 */
exports.createRazorpaySubscription = onRequest({ secrets: [razorpayKeyId, razorpayKeySecret], cors: true }, async (req, res) => {
    const { userId, planId = "premium_monthly", currency = "USD" } = req.body;

    if (!userId) {
        return res.status(400).send("Missing userId");
    }

    const plansMap = currency === "INR" ? SUBSCRIPTION_PLANS_INR : SUBSCRIPTION_PLANS;
    const planConfig = plansMap[planId];
    if (!planConfig) {
        return res.status(400).send("Invalid planId or currency");
    }

    try {
        const razorpay = new Razorpay({
            key_id: razorpayKeyId.value(),
            key_secret: razorpayKeySecret.value(),
        });

        const backendPlanId = `${planId}_${currency}`;

        // 1. Get or Create Plan
        let rzpPlanId;
        const plans = await razorpay.plans.all();
        const existingPlan = plans.items.find(p => p.notes?.internal_id === backendPlanId);

        if (existingPlan) {
            rzpPlanId = existingPlan.id;
        } else {
            const newPlan = await razorpay.plans.create({
                period: planConfig.period,
                interval: planConfig.interval,
                item: {
                    name: planConfig.name,
                    amount: Math.round(planConfig.amount * 100),
                    currency: currency,
                    description: planConfig.description
                },
                notes: {
                    internal_id: backendPlanId
                }
            });
            rzpPlanId = newPlan.id;
        }

        // 2. Create Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: rzpPlanId,
            customer_notify: 1,
            total_count: planConfig.total_count,
            notes: {
                userId: userId,
                planId: planId
            }
        });

        res.json({ ...subscription, key_id: razorpayKeyId.value() });
    } catch (error) {
        console.error("Razorpay Subscription Error:", error);
        res.status(500).send("Failed to create subscription");
    }
});

/**
 * Verifies Razorpay Subscription Payment
 */
exports.verifyRazorpaySubscription = onRequest({ secrets: [razorpayKeyId, razorpayKeySecret, emailUser, emailPass], cors: true }, async (req, res) => {
    const { 
        razorpay_payment_id, 
        razorpay_subscription_id, 
        razorpay_signature,
        userId
    } = req.body;

    if (!userId || !razorpay_signature || !razorpay_subscription_id) {
        return res.status(400).send("Missing verification parameters");
    }

    try {
        // 1. Verify Signature
        const body = razorpay_payment_id + "|" + razorpay_subscription_id;
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret.value())
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).send("Invalid subscription signature");
        }

        // SECURITY: Without this check, a single legit subscription could be
        // replayed to grant premium to ANY userId in the request body.
        const razorpay = new Razorpay({
            key_id: razorpayKeyId.value(),
            key_secret: razorpayKeySecret.value(),
        });
        const rzpSub = await razorpay.subscriptions.fetch(razorpay_subscription_id);
        if (!rzpSub || !rzpSub.notes || rzpSub.notes.userId !== userId) {
            return res.status(400).send("Subscription / user mismatch.");
        }

        // 2. Grant Access in Firestore
        const userRef = db.collection("users").doc(userId);

        // Fetch user to get email for welcome notification
        const userDoc = await userRef.get();
        const userEmail = userDoc.exists ? userDoc.data().email : null;

        await userRef.set({
            subscriptionStatus: "ACTIVE",
            subscriptionId: razorpay_subscription_id,
            purchasedCourses: admin.firestore.FieldValue.arrayUnion("all_access"),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Send Welcome Email (Only if this is the start of a new subscription)
        // Note: For recurring webhook events we wouldn't want to send this every month. 
        // But verifyRazorpaySubscription is only called from Frontend explicitly upon STARTING the subscription.
        if (userEmail) {
            try {
                await sendWelcomeEmail(userEmail, "Premium Subscription");
            } catch (emailErr) {
                console.error("Failed to send welcome subscription email:", emailErr);
            }
        }

        // 3. Log transaction — pull amount/currency from the actual subscription plan
        //    (was hard-coded to 9.99, wrong for INR plans and any future plan changes).
        let subAmountMajor = null;
        let subCurrency = null;
        try {
            const plan = await razorpay.plans.fetch(rzpSub.plan_id);
            if (plan && plan.item) {
                subAmountMajor = typeof plan.item.amount === 'number' ? plan.item.amount / 100 : null;
                subCurrency = plan.item.currency || null;
            }
        } catch (e) {
            console.warn("Could not fetch plan for transaction log:", e && e.message);
        }
        await db.collection("transactions").doc(razorpay_payment_id).set({
            userId,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySubscriptionId: razorpay_subscription_id,
            amount: subAmountMajor,
            currency: subCurrency,
            type: "SUBSCRIPTION_START",
            status: "SUCCESS",
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: "Subscription activated" });
    } catch (error) {
        console.error("Subscription Verification Error:", error);
        res.status(500).send("Verification failed");
    }
});

/**
 * Optional: Razorpay Webhook for async capture (Robustness)
 * You would point https://your-app.web.app/api/razorpay-webhook to this in Razorpay Dashboard
 */
exports.razorpayWebhook = onRequest({ secrets: [razorpayKeyId, razorpayKeySecret, razorpayWebhookSecret, emailUser, emailPass], cors: false }, async (req, res) => {
    let secret = '';
    try { secret = razorpayWebhookSecret.value(); } catch (_) { secret = ''; }
    if (!secret) {
        console.error("[razorpayWebhook] RAZORPAY_WEBHOOK_SECRET not configured — rejecting all webhook calls.");
        return res.status(500).send("Webhook not configured");
    }
    const signature = req.headers["x-razorpay-signature"];

    // 1. Verify Webhook Signature against the RAW request body. Razorpay signs
    //    the exact bytes it sent; re-serializing req.body (JSON.stringify) can
    //    differ and fail verification. Firebase exposes req.rawBody as a Buffer.
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(rawBody);
    const digest = shasum.digest("hex");

    if (signature !== digest) {
        return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
        const payment = payload.payment.entity;

        // For Razorpay Checkout, our identifying data (userId/courseId/guest info)
        // lives on the ORDER notes, not the payment — payment.notes is usually
        // empty. Fetch the order so the safety-net actually has what it needs.
        let notes = payment.notes || {};
        if ((!notes.courseId || !notes.userId) && payment.order_id) {
            try {
                const rp = new Razorpay({ key_id: razorpayKeyId.value(), key_secret: razorpayKeySecret.value() });
                const order = await rp.orders.fetch(payment.order_id);
                notes = { ...(order.notes || {}), ...notes };
            } catch (e) { console.error("[razorpayWebhook] order fetch failed:", e); }
        }
        const { userId, courseId, guestEmail, guestPhone } = notes;
        const grantType = notes.grantType === 'membership' ? 'membership' : 'course';
        const membershipDays = parseInt(notes.membershipDays || '0', 10) || null;

        if (userId && courseId) {
            // Idempotency: Razorpay may retry the webhook. Only run side effects
            // (esp. the guest email) the FIRST time we see this payment id.
            const txRef = db.collection("transactions").doc(payment.id);
            const alreadyProcessed = (await txRef.get()).exists;

            const isGuest = userId === 'guest_pending' || userId.startsWith('guest_');
            if (isGuest) {
                // Prefer the email WE captured (order notes); fall back to Razorpay's,
                // ignoring its "void@razorpay.com" placeholder.
                const rzpEmail = String(payment.email || '').toLowerCase().trim();
                const customerEmail = String(guestEmail || '').toLowerCase().trim()
                    || (rzpEmail !== 'void@razorpay.com' ? rzpEmail : '');
                const customerPhone = String(guestPhone || payment.contact || '').trim();
                if (customerEmail) {
                    const guestRef = db.collection("guestPurchases").doc(customerEmail);
                    if (grantType === 'membership' && membershipDays && !alreadyProcessed) {
                        const guestSnap = await guestRef.get();
                        const newUntilMs = extendMembershipUntilMs(guestSnap.exists ? guestSnap.data().membershipUntil : null, membershipDays);
                        await guestRef.set({
                            email: customerEmail,
                            phone: customerPhone,
                            membershipUntil: admin.firestore.Timestamp.fromMillis(newUntilMs),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    } else if (grantType !== 'membership') {
                        await guestRef.set({
                            email: customerEmail,
                            phone: customerPhone,
                            purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                    }
                    // Tell the guest to sign up with this email — but only once.
                    if (!alreadyProcessed) {
                        try { await sendGuestAccessEmail(customerEmail); }
                        catch (e) { console.error("[razorpayWebhook] guest email failed:", e); }
                    }
                }
            } else if (grantType === 'membership' && membershipDays) {
                // Only extend once per payment — a retried webhook must not double-add days.
                if (!alreadyProcessed) {
                    const userRef = db.collection("users").doc(userId);
                    const userDoc = await userRef.get();
                    const newUntilMs = extendMembershipUntilMs(userDoc.exists ? userDoc.data().membershipUntil : null, membershipDays);
                    await userRef.set({
                        membershipUntil: admin.firestore.Timestamp.fromMillis(newUntilMs),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            } else {
                const userRef = db.collection("users").doc(userId);
                await userRef.set({
                    purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }

            await txRef.set({
                userId,
                courseId,
                grantType,
                razorpayOrderId: payment.order_id,
                razorpayPaymentId: payment.id,
                amount: payment.amount / 100,
                status: "SUCCESS_WEBHOOK",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } else if (event === "subscription.charged") {
        const subscription = payload.subscription.entity;
        const payment = payload.payment.entity;
        const userId = subscription.notes?.userId;

        if (userId) {
            const userRef = db.collection("users").doc(userId);
            await userRef.set({
                subscriptionStatus: "ACTIVE",
                subscriptionId: subscription.id,
                purchasedCourses: admin.firestore.FieldValue.arrayUnion("all_access"),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            await db.collection("transactions").doc(payment.id).set({
                userId,
                razorpaySubscriptionId: subscription.id,
                razorpayPaymentId: payment.id,
                amount: payment.amount / 100,
                status: "SUCCESS_RENEWAL",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } else if (event === "subscription.cancelled" || event === "subscription.halted") {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes?.userId;

        if (userId) {
            const userRef = db.collection("users").doc(userId);
            await userRef.set({
                subscriptionStatus: "INACTIVE",
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    }

    res.json({ status: "ok" });
});

exports.textToSpeech = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    let { text, promptContext, gender = 'FEMALE', voice = 'Enceladus' } = req.body;
    const apiKey = geminiKey.value();

    console.log(`DEBUG: Quick Voice Request. Persona: ${voice}, Context: ${!!promptContext}`);

    if (!text && !promptContext) return res.status(400).send("No text or context provided.");

    // 1. Intelligent Script Generation (Step 3 or context-heavy)
    if (promptContext) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `
                Act as a Presence Coach.
                Generate a short 1-2 sentence spoken script for: ${promptContext}
                IMPORTANT: Return ONLY the spoken words. No ellipses (...). Use commas (,) for pauses.
            `;
            const result = await model.generateContent(prompt);
            text = (await result.response).text().trim();
        } catch (e) {
            console.error("Gemini fallback:", e.message);
        }
    }

    // 2. Synthesize with Neural Engine
    try {
        // Map simplified names to official IDs if needed, otherwise use passed ID
        let finalVoiceName = voice;
        if (voice === 'Enceladus' || voice === 'Charon' || voice === 'Zephyr') {
            finalVoiceName = 'en-US-Journey-D';
        } else if (voice === 'Despina' || voice === 'Algenib') {
            finalVoiceName = 'en-US-Journey-F';
        }
        
        // If gender is explicitly MALE and we have a generic voice, ensure we use a male journey voice
        if (gender === 'MALE' && (finalVoiceName === 'en-US-Journey-F' || !finalVoiceName)) {
            finalVoiceName = 'en-US-Journey-D';
        }

        // Final fallback to a high-quality neural voice if nothing else is determined
        if (!finalVoiceName) finalVoiceName = 'en-US-Journey-F';

        console.log(`[TTS] Synthesizing with Voice: ${finalVoiceName}, Gender: ${gender}`);

        const [response] = await ttsClient.synthesizeSpeech({
            input: { text: text },
            voice: { 
                languageCode: finalVoiceName.startsWith('en-GB') ? 'en-GB' : 'en-US', 
                name: finalVoiceName 
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.95 // Slightly faster than 0.9 to sound more natural but still calm
            },
        });

        res.set('Content-Type', 'audio/mpeg');
        return res.send(response.audioContent);
    } catch (error) {
        console.error("Voice Engine Failure:", error.message);
        res.status(500).send("Silence is okay.");
    }
});

exports.witnessPresence = onRequest({ secrets: [geminiKey], cors: true }, async (req, res) => {
    const { thought } = req.body;
    
    if (!thought) {
        console.warn("No thought provided in request.");
        return res.status(400).send("No thought shared.");
    }

    try {
        const apiKey = geminiKey.value();
        console.log("DEBUG: witnessPresence request. Secret present:", !!apiKey, apiKey ? `(Starts with: ${apiKey.substring(0, 6)}...)` : "");
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

exports.testEmail = onRequest({ secrets: [emailUser, emailPass], cors: true }, async (req, res) => {
    const { to } = req.query;
    if (!to) return res.status(400).send("Provide 'to' email address.");

    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: '"The Awakened Journal Test" <connect@skrmblissai.in>',
            to: to,
            subject: "Verification: The Path is Open",
            html: "<b>Success.</b> This email confirms that the automated reminder system is correctly configured."
        });
        res.send(`Test email sent to ${to}`);
    } catch (error) {
        console.error("Test Email Error:", error);
        res.status(500).send(`Failed: ${error.message}`);
    }
});

/**
 * Preview the full daily reminder email — sends to ?to= with today's live content.
 * Use this to QA the email design before the 8 PM scheduled send.
 */
exports.previewReminderEmail = onRequest({
    secrets: [emailUser, emailPass, geminiKey, youtubeApiKey],
    cors: true
}, async (req, res) => {
    const { to } = req.query;
    if (!to) return res.status(400).send("Provide 'to' email address.");

    try {
        const daily = await getDailyEmailContent(geminiKey.value());
        const todayPractice = getTodaysPractice();
        const todaySubject = DAILY_SUBJECTS[new Date().getDay()];
        const todayVideo = await getDailyYoutubeVideo(youtubeApiKey.value(), db);
        const videoUrl = `https://www.youtube.com/watch?v=${todayVideo.id}`;
        const videoThumb = todayVideo.thumb || `https://img.youtube.com/vi/${todayVideo.id}/hqdefault.jpg`;
        const transporter = getTransporter();

        const previewHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background-color:#F6F2EA; font-family: 'Georgia', serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F6F2EA;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFCF6;border:1px solid rgba(184, 151, 58, 0.35); border-radius: 12px; overflow: hidden;">
                    <!-- Glow Line -->
                    <tr><td style="background: linear-gradient(90deg, transparent, #B8973A, transparent); height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>

                    <tr>
                        <td style="padding:48px 48px 24px;text-align:center;">
                            <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#B8973A;margin:0 0 16px; opacity: 0.8;">Mind Gym · Daily Practice</p>
                            <h1 style="font-size:28px;font-weight:300;font-style:italic;color:#1E1912;margin:0;line-height:1.3; letter-spacing: 1px;">${daily.headline}</h1>
                            <div style="width:40px;height:1px;background:rgba(184, 151, 58, 0.3);margin:24px auto;"></div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 48px 32px;">
                            <p style="font-size:16px;line-height:1.8;color:rgba(30, 25, 18, 0.72);margin:0 0 24px; text-align: center; font-style: italic;">
                                &ldquo;${daily.quote}&rdquo;
                            </p>
                            <p style="font-size:15px;line-height:1.8;color:#2E261C;margin:0; opacity: 0.95;">${daily.explanation}</p>
                        </td>
                    </tr>

                    <!-- Daily YouTube Video -->
                    <tr>
                        <td style="padding:0 48px 24px;">
                            <div style="padding:24px; background: rgba(184, 151, 58, 0.04); border: 1px solid rgba(184, 151, 58, 0.25); border-radius: 12px;">
                                <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 14px;font-weight:700;">Today's Video</p>
                                <p style="font-size:22px;font-weight:600;color:#1E1912;margin:0 0 14px;line-height:1.35;">${todayVideo.title}</p>
                                <!-- Thumbnail with play button overlay -->
                                <div style="position:relative;line-height:0;border-radius:10px;overflow:hidden;">
                                    <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="display:block;line-height:0;">
                                        <img src="${videoThumb}" alt="Today's Soulful Intelligence Studio video" style="display:block;width:100%;max-width:100%;border-radius:10px;border:1px solid rgba(184,151,58,0.25);" />
                                    </a>
                                    <a href="${videoUrl}" target="_blank" rel="noopener noreferrer"
                                       style="position:absolute;top:50%;left:50%;margin-top:-40px;margin-left:-40px;
                                              width:80px;height:80px;background:rgba(0,0,0,0.62);
                                              border-radius:50%;border:3px solid rgba(255,255,255,0.92);
                                              display:block;text-align:center;line-height:80px;text-decoration:none;">
                                        <span style="display:inline-block;width:0;height:0;
                                                     border-top:15px solid transparent;
                                                     border-bottom:15px solid transparent;
                                                     border-left:26px solid #ffffff;
                                                     margin-top:25px;margin-left:6px;vertical-align:top;"></span>
                                    </a>
                                </div>
                                <p style="font-size:15px;line-height:1.7;color:#2E261C;margin:14px 0 0;">Watch on YouTube: <a href="${videoUrl}" style="color:#8B6A1A;text-decoration:none;font-weight:600;">Soulful Intelligence Studio ↗</a></p>
                            </div>
                        </td>
                    </tr>

                    <!-- Today's Practice Card -->
                    <tr>
                        <td style="padding:0 48px 24px;">
                            <div style="padding:32px; background: rgba(184, 151, 58, 0.06); border: 2px solid rgba(184, 151, 58, 0.35); border-radius: 12px;">
                                <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 16px;font-weight:700;">Practice from Today's Video</p>
                                <p style="font-size:26px;font-weight:400;font-style:italic;color:#1E1912;margin:0 0 12px;line-height:1.3;">${todayPractice.name}</p>
                                <p style="font-size:17px;line-height:1.75;color:#2E261C;margin:0 0 14px;font-weight:400;">${todayPractice.tagline}</p>
                                <p style="font-size:16px;line-height:1.7;color:#3A2E1E;margin:0 0 20px;"><strong style="color:#1E1912;">Video focus:</strong> ${todayVideo.focus}</p>
                                <span style="display:inline-block;font-size:13px;letter-spacing:1px;color:#B8973A;background:rgba(184,151,58,0.12);padding:8px 18px;border-radius:20px;border:1px solid rgba(184,151,58,0.3);font-weight:600;">${todayPractice.duration}</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Curiosity Gap -->
                    <tr>
                        <td style="padding:0 48px 32px;text-align:center;">
                            <p style="font-size:17px;line-height:1.9;color:rgba(46,38,28,0.85);font-style:italic;margin:0;font-weight:400;">${todayPractice.teaser}</p>
                        </td>
                    </tr>

                    <!-- Primary CTA -->
                    <tr>
                        <td style="padding:0 48px 20px;text-align:center;">
                            <a href="https://www.skrmblissai.in/mindgym" style="display:inline-block;padding:18px 48px;background:#B8973A;color:#0C0910;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;border-radius:4px;">Open Today's Practice &rarr; (5 min)</a>
                        </td>
                    </tr>

                    <!-- Secondary CTA — Free Journal Download -->
                    <tr>
                        <td style="padding:0 48px 48px;text-align:center;">
                            <div style="border:1px solid rgba(184,151,58,0.35);border-radius:12px;padding:20px 28px;background:rgba(184,151,58,0.04);display:inline-block;">
                                <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8973A;margin:0 0 8px;font-weight:700;">🎁 Free Resource</p>
                                <p style="font-size:16px;color:#1E1912;margin:0 0 14px;font-weight:500;line-height:1.4;">Download your free<br><strong>30-Day Now Practice Journal</strong></p>
                                <a href="https://www.skrmblissai.in/aboutmindgym" style="display:inline-block;padding:12px 32px;background:transparent;color:#B8973A;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;border:2px solid #B8973A;border-radius:4px;">Get Free Journal &darr;</a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:rgba(184,151,58,0.03);padding:32px 48px;border-top:1px solid rgba(184,151,58,0.2);text-align:center;">
                            <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(184, 151, 58, 0.8);margin:0 0 16px;">Mind Gym · Daily Practice · Preview</p>
                            <p style="font-size:10px;color:rgba(30, 25, 18, 0.6);margin:0;line-height:1.8;">
                                <a href="https://wa.me/918217581238" style="color:#B8973A;text-decoration:none;">WhatsApp Support</a>
                            </p>
                            <p style="font-size:10px;color:rgba(30, 25, 18, 0.6);margin:8px 0 0;line-height:1.8;">
                                By <a href="https://www.skrmblissai.in/twinsouls" style="color:#B8973A;text-decoration:none;">Twin Souls</a> &nbsp;&middot;&nbsp; 
                                <a href="https://www.youtube.com/@SoulfulIntelligenceStudio" style="color:#B8973A;text-decoration:none;">
                                    <img src="https://img.icons8.com/material-rounded/24/B8973A/youtube-play.png" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;" alt="YouTube" />
                                    Soulful Intelligence Studio
                                </a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        await transporter.sendMail({
            from: '"Mind Gym" <connect@skrmblissai.in>',
            to: to,
            subject: `[PREVIEW] ${todaySubject}`,
            html: previewHtml
        });

        res.send(`✅ Preview email sent to ${to} — Subject: [PREVIEW] ${todaySubject} — Practice: ${todayPractice.name}`);
    } catch (error) {
        console.error("Preview Email Error:", error);
        res.status(500).send(`Failed: ${error.message}`);
    }
});

/**
 * Helper to get nodemailer transporter
 */
const getTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtpout.secureserver.net',
        port: 465,
        secure: true,
        auth: {
            user: emailUser.value(),
            pass: emailPass.value(),
        },
    });
};

/**
 * Helper to send Welcome Email upon Payment/Subscription
 */
async function sendWelcomeEmail(toEmail, planName) {
    const transporter = getTransporter();
    
    // Using existing clean design token stylings mapped to inline-HTML
    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Mind Gym</title>
</head>
<body style="margin:0;padding:0;background:#f0ece4;">
    <!-- Preheader Text -->
    <div style="display:none;font-size:1px;color:#f0ece4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        Welcome to Mind Gym. The journey begins now.
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ece4;">
        <tr>
            <td align="center" style="padding:24px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FDFAF4;border:1px solid #E6C57D;">
                    <tr><td style="background:#B8973A;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    <tr>
                        <td style="padding:32px 40px 20px;text-align:center;">
                            <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 16px;">Mind Gym &middot; Access Granted</p>
                            <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:300;font-style:italic;color:#1C1814;margin:0;line-height:1.3;">Welcome to the<br>Deepest Journey.</h1>
                            <div style="width:40px;height:1px;background:#B8973A;margin:16px auto;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 40px 32px;text-align:center;">
                            <p style="font-family:Georgia,serif;font-size:15px;line-height:1.75;color:#3A342C;margin:0 0 20px;">Your gateway for <b>\${planName}</b> was successful.</p>
                            <p style="font-family:Georgia,serif;font-size:15px;line-height:1.75;color:#3A342C;margin:0 0 0;">Step beyond the noise. You now possess full access to the intelligence course, the practice room, and interactive journaling. As a premium member, remember that you also hold the key to <b>2 complimentary personal consultations</b>. Email us whenever you are ready.<br><br>Return to the app to begin.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

    await transporter.sendMail({
        from: '"Mind Gym" <connect@skrmblissai.in>',
        to: toEmail,
        subject: "Welcome: The Path is Open",
        html: emailTemplate
    });
}

/**
 * Guest checkout confirmation — the buyer has no account yet, so the ONE thing
 * they must do is create an account with THIS SAME email to unlock the course.
 */
async function sendGuestAccessEmail(toEmail) {
    const transporter = getTransporter();
    const signupUrl = 'https://www.skrmblissai.in/mindgym';
    await transporter.sendMail({
        from: '"Mind Gym" <connect@skrmblissai.in>',
        to: toEmail,
        subject: "Your purchase is confirmed — one step to unlock it",
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0ece4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ece4;">
      <tr><td align="center" style="padding:24px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FDFAF4;border:1px solid #E6C57D;">
          <tr><td style="background:#B8973A;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td style="padding:36px 40px;text-align:center;">
            <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 16px;">Mind Gym &middot; Payment Confirmed</p>
            <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:300;font-style:italic;color:#1C1814;margin:0 0 8px;line-height:1.3;">Thank you — you're in.</h1>
            <div style="width:40px;height:1px;background:#B8973A;margin:16px auto 24px;"></div>
            <p style="font-family:Georgia,serif;font-size:16px;color:#3A342C;line-height:1.6;margin:0 0 8px;">Your Emotion &amp; Feelings Course purchase is confirmed.</p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#3A342C;line-height:1.6;margin:0 0 28px;"><strong>One step to unlock it:</strong> create your free account using <strong>this exact email address</strong> (${toEmail}) and the course will appear automatically.</p>
            <a href="${signupUrl}" style="display:inline-block;padding:14px 34px;background:#1C1814;color:#E6C57D;text-decoration:none;font-family:Georgia,serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Create My Account</a>
            <p style="font-family:Georgia,serif;font-size:12px;color:#8A8272;line-height:1.6;margin:28px 0 0;">The introduction is available immediately, and a new episode unlocks each week. Questions? Just reply to this email or WhatsApp us at +91 82175 81238.</p>
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>`
    });
}

exports.forceTriggerEmail = onRequest({
    secrets: [emailUser, emailPass, geminiKey, youtubeApiKey],
    timeoutSeconds: 300
}, async (req, res) => {
    try {
        console.log(`Manually triggering daily reminders...`);
        await runReminderLogic(geminiKey.value(), youtubeApiKey.value(), true);
        res.send("Daily reminders triggered successfully.");
    } catch (e) {
        console.error(`FORCETRIGGER_ERROR:`, e);
        res.status(500).send(`Reminder trigger failed: ${e.message}`);
    }
});

/**
 * Scheduled Reminder: Weekdays at 9:15 AM IST (3:45 AM UTC).
 * Notifies all registered users 15 minutes before the 9:30 AM IST live wellness
 * session. No sessions (and no reminders) on Saturday/Sunday.
 */
exports.sendMeditationReminders = onSchedule({
    schedule: "45 3 * * 1-5", // 3:45 AM UTC = 9:15 AM IST, Monday–Friday
    timeZone: "UTC",
    secrets: [emailUser, emailPass]
}, async (event) => {
    try {
        const usersSnap = await db.collection("users").where("email", "!=", null).get();
        if (usersSnap.empty) { console.log("No users found."); return; }

        const transporter = getTransporter();

        // Verify SMTP connection FIRST — fail fast with a clear error if credentials are wrong
        try {
            await transporter.verify();
            console.log("SMTP connection verified OK.");
        } catch (smtpErr) {
            console.error("SMTP AUTH FAILED — emails will NOT be sent. Check EMAIL_USER / EMAIL_PASS secrets.", smtpErr.message);
            return; // stop here — no point attempting 100+ sends that will all fail
        }

        let sentCount = 0;
        let failedCount = 0;
        let skippedCount = 0;
        const failedEmails = [];

        const promises = usersSnap.docs.map(doc => {
            const data = doc.data();
            const emailAddr = data.email;

            // Exclude: missing email, unsubscribed users (checks BOTH field names for safety), hardcoded do-not-contact list
            if (
                !emailAddr ||
                (!isAdminEmail(emailAddr) && (
                    data.notificationsEnabled === false ||
                    data.unsubscribed === true ||
                    emailAddr.toLowerCase() === "rashmi.purbey@gmail.com" ||
                    emailAddr.toLowerCase() === "gerhard.niemann@gmail.com"
                ))
            ) {
                skippedCount++;
                return Promise.resolve();
            }

            const userId = doc.id;
            const personalizedHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Meditation Starting Soon</title>
</head>
<body style="margin:0;padding:40px 20px;font-family:Arial,sans-serif;background-color:#0a0d1a;color:#ffffff;text-align:center;">
    <div style="max-width:400px;margin:0 auto;background-color:#111827;padding:40px 20px;border-radius:16px;border:1px solid rgba(20,184,166,0.2);">
        <h2 style="margin:0 0 10px 0;font-size:24px;color:#facc15;font-weight:900;text-transform:uppercase;letter-spacing:1px;">
            Meditation Room<br/>is Opening
        </h2>
        <p style="margin:0 0 30px 0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.5;">
            The daily 15-minute silent practice starts in 15 minutes. No teacher. No student. Just presence.
        </p>
        <a href="https://awakened-path-2026.web.app/meditation" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right, #14b8a6, #5eead4);color:#042f2e;text-decoration:none;font-weight:bold;border-radius:24px;text-transform:uppercase;letter-spacing:2px;">
            JOIN MEDITATION &rarr;
        </a>
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId=${userId}&blastId=MEDITATION_REMINDER" style="color: rgba(255, 255, 255, 0.4); text-decoration: none; font-size: 10px;">Unsubscribe from reminders</a>
        </p>
    </div>
</body>
</html>`;

            return transporter.sendMail({
                from: '"Mind Gym" <connect@skrmblissai.in>',
                replyTo: 'connect@skrmblissai.in',
                to: emailAddr,
                subject: "Live Meditation starts in 15 minutes",
                html: personalizedHtml
            }).then(() => {
                sentCount++;
            }).catch(e => {
                failedCount++;
                failedEmails.push(emailAddr);
                console.error(`Failed to send to ${emailAddr}:`, e.message);
            });
        });

        await Promise.all(promises);

        // Clear, accurate summary log
        console.log(`=== Meditation Reminder Summary ===`);
        console.log(`✅ Sent:    ${sentCount}`);
        console.log(`⏭️  Skipped: ${skippedCount} (unsubscribed or excluded)`);
        console.log(`❌ Failed:  ${failedCount}`);
        if (failedEmails.length > 0) {
            console.error(`Failed addresses: ${failedEmails.join(", ")}`);
        }
    } catch (e) {
        console.error("Error in sendMeditationReminders:", e);
    }
});

exports.testMeditationReminderEmail = onRequest({
    secrets: [emailUser, emailPass],
    cors: true
}, async (req, res) => {
    const { to } = req.query;
    if (!to) return res.status(400).send("Provide 'to' email address.");

    try {
        const transporter = getTransporter();
        const userId = "TEST_USER_ID";
        const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Meditation Starting Soon</title>
</head>
<body style="margin:0;padding:40px 20px;font-family:Arial,sans-serif;background-color:#0a0d1a;color:#ffffff;text-align:center;">
    <div style="max-width:400px;margin:0 auto;background-color:#111827;padding:40px 20px;border-radius:16px;border:1px solid rgba(20,184,166,0.2);">
        <h2 style="margin:0 0 10px 0;font-size:24px;color:#facc15;font-weight:900;text-transform:uppercase;letter-spacing:1px;">
            Meditation Room<br/>is Opening
        </h2>
        <p style="margin:0 0 30px 0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.5;">
            The daily 15-minute silent practice starts in 15 minutes. No teacher. No student. Just presence.
        </p>
        <a href="https://awakened-path-2026.web.app/meditation" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right, #14b8a6, #5eead4);color:#042f2e;text-decoration:none;font-weight:bold;border-radius:24px;text-transform:uppercase;letter-spacing:2px;">
            JOIN MEDITATION &rarr;
        </a>
        <p style="text-align: center; margin-top: 30px;">
            <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId=${userId}&blastId=MEDITATION_REMINDER" style="color: rgba(255, 255, 255, 0.4); text-decoration: none; font-size: 10px;">Unsubscribe from reminders</a>
        </p>
    </div>
</body>
</html>`;
        
        const mailOptions = {
            from: '"Mind Gym" <connect@skrmblissai.in>',
            replyTo: 'connect@skrmblissai.in',
            to: to,
            subject: "Live Meditation starts in 15 minutes",
            html: emailTemplate
        };
        
        await transporter.sendMail(mailOptions);
        res.status(200).send("Meditation reminder test email sent successfully to " + to);
    } catch (e) {
        console.error("Error sending test meditation reminder:", e);
        res.status(500).send("Error sending email.");
    }
});


/**
 * Scheduled Reminder: Hourly Check for 8:00 PM Local Time
 */
exports.sendDailyReminder = onSchedule({
    schedule: "0 * * * *", // Runs every hour
    secrets: [emailUser, emailPass, geminiKey, youtubeApiKey]
}, async (event) => {
    return runReminderLogic(geminiKey.value(), youtubeApiKey.value());
});

// 7 rotating fallback sets — used ONLY when Gemini API fails, so emails still vary by day.
const FALLBACK_CONTENT = [
    { // Sun
        subject: 'One thought is running your evening. Let\'s see it.',
        preheader: 'Tonight you get to watch the mind instead of being it.',
        headline: 'The watcher is already here.',
        hook: 'There is one thought that has been repeating all day — you know the one. Tonight\'s practice is not about stopping it. It is about seeing it so clearly that you realise you are not it.',
        quote: 'You are the sky. Everything else is just weather.',
        explanation: 'Sit for five minutes and simply name each thought as it appears. Not to fix anything — just to see it from the outside.'
    },
    { // Mon
        subject: 'The radio is on. Are you listening — or just hearing?',
        preheader: 'There is a difference — and today\'s practice shows you how to find it.',
        headline: 'Step behind the noise.',
        hook: 'The mental commentary has been going since you woke up. News, plans, old conversations. You did not choose any of it — it just played. Tonight\'s video shows you what it feels like to be the one who hears the radio, not the one trapped inside it.',
        quote: 'The thinker is not who you are. The one aware of the thinker — that is you.',
        explanation: 'Notice the stream of thought tonight as if it were a TV left on in the next room. You do not have to watch it. You just have to know it is not you.'
    },
    { // Tue
        subject: 'Five minutes tonight could shift how tomorrow begins.',
        preheader: 'A short practice this evening creates space in the morning.',
        headline: 'Tonight changes tomorrow.',
        hook: 'Most evenings end with the mind still running at full speed — and the next morning picks up exactly where it left off. What if five minutes of real stillness tonight broke that cycle? That is what today\'s practice is designed to do.',
        quote: 'Rest is not absence of effort. It is the presence of awareness.',
        explanation: 'End your evening by sitting quietly and watching the breath for five minutes. Not to relax — but to arrive fully in this one moment before the day closes.'
    },
    { // Wed
        subject: 'The silence behind everything is always there.',
        preheader: 'You do not have to create peace. You have to stop covering it.',
        headline: 'Peace was never lost.',
        hook: 'Beneath the noise of the day — every conversation, every plan, every small frustration — there has been a silence. It was there before you woke up and it is there right now. Tonight\'s practice is simply about returning to it.',
        quote: 'You cannot find stillness. You can only stop moving long enough to notice it was always here.',
        explanation: 'Close your eyes tonight and ask: what is here before the first thought arises? Stay with that question — not to answer it, but to feel into it.'
    },
    { // Thu
        subject: 'The noise does not have to win this evening.',
        preheader: 'You get to decide what has your attention tonight.',
        headline: 'Choose your ground.',
        hook: 'The mind has strong opinions about how this evening should go — what needs worrying about, what needs replaying, what needs planning. But you are the one who decides what gets your attention. Tonight\'s practice gives you that choice back.',
        quote: 'Where attention goes, energy flows. Tonight, choose wisely.',
        explanation: 'Spend a few minutes noticing what your mind keeps returning to tonight. Then gently ask: is this where I want to put my energy right now?'
    },
    { // Fri
        subject: 'The one who notices the feeling was never the feeling.',
        preheader: 'Today\'s practice shows you how to find that witness inside you.',
        headline: 'You are the observer.',
        hook: 'Something may have bothered you today — a comment, a situation, a frustration you can\'t name. But here is something worth sitting with: the part of you that noticed the feeling is not the feeling itself. That witness has been with you all day, quietly watching. Tonight, you meet it properly.',
        quote: 'You are not the emotion. You are the one who is aware of it.',
        explanation: 'Think of one feeling from today. Now notice who is aware of that feeling. Stay with that awareness — not the feeling — for a few quiet breaths.'
    },
    { // Sat
        subject: 'Every time you catch yourself — that is the whole practice.',
        preheader: 'You do not need a perfect session. Just one moment of noticing.',
        headline: 'One catch is enough.',
        hook: 'You do not need an hour of meditation or a perfect quiet space. Every single time today that you noticed your mind had wandered — even for a split second — that was the practice. That moment of noticing is what this path is actually about.',
        quote: 'The moment you realise you were lost is the moment you are found.',
        explanation: 'Tonight, look back over today and count how many times you caught yourself lost in thought. Each one is a win. That is the game — and you are already playing it.'
    },
];

// Rotating "Today's Guide" for the daily email — mirrors the prerendered guide
// pages in the content engine (src/features/content/data/contentEngineData.ts).
// Keep slugs in sync with that registry, the sitemap, and scripts/prerender.mjs.
const DAILY_GUIDES = [
    { slug: 'feelings-vs-emotions', title: 'Feelings vs Emotions: The Guide to Inner Freedom', teaser: 'The one distinction that changes how every emotion lands.' },
    { slug: 'witness-consciousness-guide', title: 'Witness Consciousness: The Seat of the Observer', teaser: 'How to watch the mind instead of being run by it.' },
    { slug: 'stopping-overthinking-naturally', title: 'How to Stop Overthinking: 5 Somatic Rituals', teaser: 'Five body-first ways to quiet a racing mind.' },
    { slug: 'power-of-now-presence-guide', title: 'The Power of Now: Key Practices for Presence', teaser: 'Simple ways to come back to this moment, today.' },
    { slug: 'why-do-i-overthink', title: 'Why Do I Overthink Everything?', teaser: 'The causes — and a 5-minute path to relief.' },
    { slug: 'meditation-for-beginners', title: 'Meditation for Beginners', teaser: 'How to start without sitting still for hours.' },
    { slug: 'how-to-stop-overthinking-at-night', title: 'How to Stop Overthinking at Night', teaser: '4 somatic steps to quiet the mind before sleep.' },
];
function getTodaysGuide() {
    // Rotate by day-of-year so it's stable within a day and cycles through all guides.
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    return DAILY_GUIDES[dayOfYear % DAILY_GUIDES.length];
}

async function getDailyEmailContent(apiKey, video) {
    const videoTitle = video ? video.title : '';
    const videoFocus = video ? video.focus : '';
    const dayIndex = new Date().getDay(); // 0=Sun … 6=Sat

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
You are a Presence Coach who sends a daily evening email to spiritual seekers studying 'The Untethered Soul' and 'The Power of Now'.

Today's YouTube video is: "${videoTitle}"
Video focus/theme: "${videoFocus}"

Your job: write email content that:
1. Identifies ONE real, relatable mental problem this video addresses (e.g. "mind that won't stop", "replaying past events", "anxiety about tomorrow")
2. Positions the video + practice as the solution
3. Makes the reader feel understood — not preached at

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "subject": "A plain-text subject line (max 10 words). No emoji. Conversational. Name the problem the video solves.",
  "preheader": "One short sentence (max 15 words) that teases the solution.",
  "headline": "Short poetic headline (max 6 words) that echoes the problem/solution theme",
  "hook": "2-3 sentences. Call out the exact problem directly and personally. Make the reader feel seen. Then hint that today's video and practice is the answer.",
  "quote": "A soul-stirring quote about the witness/observer (max 20 words)",
  "explanation": "1-2 sentences about observing the mind tonight, tied to the video theme"
}
        `;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        const cleanedJson = text.replace(/```json|```/gi, '').trim();
        const parsed = JSON.parse(cleanedJson);
        if (!parsed.subject || !parsed.preheader || !parsed.hook) throw new Error('Missing fields');
        // Mark as Gemini-generated so cache logic knows it is safe to store
        parsed._fromGemini = true;
        return parsed;
    } catch (e) {
        console.error(`Gemini Content Error (falling back to day-${dayIndex} static content):`, e.message);
        // Return day-specific fallback — NOT cached so tomorrow gets a fresh Gemini attempt
        return { ...FALLBACK_CONTENT[dayIndex], _fromGemini: false };
    }
}

async function runReminderLogic(apiKey, youtubeKey, force = false) {
    const today = new Date().toISOString().split('T')[0];
    const transporter = getTransporter();

    // ── Read subscriber list from subscribers.txt ────────────────────────────
    // Each non-empty, non-comment line is an active email.
    // To disable someone: prefix their line with # or delete the line.
    const fs = require('fs');
    const path = require('path');
    const subscriberFile = path.join(__dirname, 'subscribers.txt');
    let subscriberEmails = [];
    try {
        const raw = fs.readFileSync(subscriberFile, 'utf8');
        subscriberEmails = raw
            .split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('#'))
            .map(l => l.toLowerCase());
        console.log(`[Subscribers] Loaded ${subscriberEmails.length} emails from subscribers.txt`);
    } catch (e) {
        console.error('[Subscribers] Could not read subscribers.txt, falling back to Firestore:', e.message);
        // Fallback: read from Firestore users collection
        const snap = await db.collection("users").get();
        snap.docs.forEach(d => { if (d.data().email) subscriberEmails.push(d.data().email.toLowerCase()); });
    }

    // Build a lookup map: email → Firestore user data (for timezone, uid etc.)
    const usersSnap = await db.collection("users").get();
    const usersByEmail = {};
    usersSnap.docs.forEach(d => {
        const data = d.data();
        if (data.email) usersByEmail[data.email.toLowerCase()] = { ...data, _id: d.id };
    });

    // ── Daily content cache ────────────────────────────────────────────────────
    // Gemini + YouTube API are only called ONCE per day on the first hourly run.
    // All subsequent runs (up to 23 more) read from Firestore cache — saving ~95%
    // of API costs for content generation.
    let todayVideo, daily;
    const cacheRef = db.collection('daily_email_cache').doc(today);
    try {
        const cached = await cacheRef.get();
        if (cached.exists && !force) {
            console.log(`[DailyCache] HIT — using cached content for ${today}, skipping Gemini + YouTube API calls.`);
            const data = cached.data();
            todayVideo = data.video;
            daily = data.emailContent;
        } else {
            console.log(`[DailyCache] MISS — generating fresh content for ${today}.`);
            todayVideo = await getDailyYoutubeVideo(youtubeKey, db);
            daily = await getDailyEmailContent(apiKey, todayVideo);
            // Only cache if Gemini actually generated the content (not a static fallback).
            // If we cached fallback content, every hourly run today would serve the same
            // static text AND tomorrow's first run would see a cache HIT and skip Gemini again.
            if (daily._fromGemini) {
                await cacheRef.set({
                    video: todayVideo,
                    emailContent: daily,
                    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    date: today,
                });
                console.log(`[DailyCache] Stored Gemini-generated content for ${today}.`);
            } else {
                console.warn(`[DailyCache] Gemini failed — using day-specific fallback. NOT caching so next run retries Gemini.`);
            }
        }
    } catch (cacheErr) {
        console.error('[DailyCache] Cache error, falling back to live generation:', cacheErr.message);
        todayVideo = await getDailyYoutubeVideo(youtubeKey, db);
        daily = await getDailyEmailContent(apiKey, todayVideo);
    }

    const todayPractice = getTodaysPractice();
    const todayGuide = getTodaysGuide();
    const guideUrl = `https://www.skrmblissai.in/guides/${todayGuide.slug}`;
    // Use Gemini-generated subject; fallback to static array
    const todaySubject = daily.subject || DAILY_SUBJECTS[new Date().getDay()];
    const todayPreheader = daily.preheader || '';
    const videoUrl = `https://www.youtube.com/watch?v=${todayVideo.id}`;
    const videoThumb = todayVideo.thumb || `https://img.youtube.com/vi/${todayVideo.id}/hqdefault.jpg`;

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background-color:#F6F2EA; font-family: 'Georgia', serif;">
    <!-- Preheader: visible in Gmail inbox after subject line -->
    <div style="display:none;font-size:1px;color:#F6F2EA;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${todayPreheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F6F2EA;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFCF6;border:1px solid rgba(184, 151, 58, 0.35); border-radius: 12px; overflow: hidden;">
                    <!-- Glow Line -->
                    <tr><td style="background: linear-gradient(90deg, transparent, #B8973A, transparent); height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>

                    <!-- App name + tagline + Gmail Primary nudge -->
                    <tr>
                        <td style="padding:14px 48px 0;text-align:center;">
                            <p style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B8973A;margin:0 0 4px;">Mind Gym</p>
                            <p style="font-size:12px;color:rgba(30,25,18,0.55);margin:0 0 8px;font-style:italic;">Train your mind daily</p>
                            <p style="font-size:10px;color:rgba(30,25,18,0.35);margin:0;line-height:1.6;">If this arrived in Promotions, move it to <strong>Primary</strong> so you never miss your daily practice.</p>
                        </td>
                    </tr>

                    <!-- Hook: problem-aware opening paragraph -->
                    <tr>
                        <td style="padding:32px 48px 0;">
                            <p style="font-size:16px;line-height:1.85;color:#2E261C;margin:0;font-family:Georgia,serif;">${daily.hook || ''}</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 48px 24px;text-align:center;">
                            <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#B8973A;margin:0 0 16px; opacity: 0.8;">Mind Gym · Daily Practice</p>
                            <h1 style="font-size:28px;font-weight:300;font-style:italic;color:#1E1912;margin:0;line-height:1.3; letter-spacing: 1px;">${daily.headline}</h1>
                            <div style="width:40px;height:1px;background:rgba(184, 151, 58, 0.3);margin:24px auto;"></div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 48px 32px;">
                            <p style="font-size:16px;line-height:1.8;color:rgba(30, 25, 18, 0.72);margin:0 0 24px; text-align: center; font-style: italic;">
                                "${daily.quote}"
                            </p>
                            <p style="font-size:15px;line-height:1.8;color:#2E261C;margin:0; opacity: 0.95;">${daily.explanation}</p>
                        </td>
                    </tr>

                    <!-- Daily YouTube Video -->
                    <tr>
                        <td style="padding:0 48px 24px;">
                            <div style="padding:24px; background: rgba(184, 151, 58, 0.04); border: 1px solid rgba(184, 151, 58, 0.25); border-radius: 12px;">
                                <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 14px;font-weight:700;">Today's Video</p>
                                <p style="font-size:22px;font-weight:600;color:#1E1912;margin:0 0 14px;line-height:1.35;">${todayVideo.title}</p>
                                <!-- Thumbnail with play button overlay -->
                                <div style="position:relative;line-height:0;border-radius:10px;overflow:hidden;">
                                    <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}&url=${encodeURIComponent(videoUrl)}" target="_blank" rel="noopener noreferrer" style="display:block;line-height:0;">
                                        <img src="${videoThumb}" alt="Today's Soulful Intelligence Studio video" style="display:block;width:100%;max-width:100%;border-radius:10px;border:1px solid rgba(184,151,58,0.25);" />
                                    </a>
                                    <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}&url=${encodeURIComponent(videoUrl)}"
                                       target="_blank" rel="noopener noreferrer"
                                       style="position:absolute;top:50%;left:50%;margin-top:-40px;margin-left:-40px;
                                              width:80px;height:80px;background:rgba(0,0,0,0.62);
                                              border-radius:50%;border:3px solid rgba(255,255,255,0.92);
                                              display:block;text-align:center;line-height:80px;text-decoration:none;">
                                        <span style="display:inline-block;width:0;height:0;
                                                     border-top:15px solid transparent;
                                                     border-bottom:15px solid transparent;
                                                     border-left:26px solid #ffffff;
                                                     margin-top:25px;margin-left:6px;vertical-align:top;"></span>
                                    </a>
                                </div>
                                <p style="font-size:15px;line-height:1.7;color:#2E261C;margin:14px 0 0;">Watch on YouTube: <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}&url=${encodeURIComponent(videoUrl)}" style="color:#8B6A1A;text-decoration:none;font-weight:600;">Soulful Intelligence Studio ↗</a></p>
                            </div>
                        </td>
                    </tr>

                    <!-- Today's Practice Card -->
                    <tr>
                        <td style="padding:0 48px 24px;">
                            <div style="padding:32px; background: rgba(184, 151, 58, 0.06); border: 2px solid rgba(184, 151, 58, 0.35); border-radius: 12px;">
                                <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 16px;font-weight:700;">Practice from Today's Video</p>
                                <p style="font-size:26px;font-weight:400;font-style:italic;color:#1E1912;margin:0 0 12px;line-height:1.3;">${todayPractice.name}</p>
                                <p style="font-size:17px;line-height:1.75;color:#2E261C;margin:0 0 14px;font-weight:400;">${todayPractice.tagline}</p>
                                <p style="font-size:16px;line-height:1.7;color:#3A2E1E;margin:0 0 20px;"><strong style="color:#1E1912;">Video focus:</strong> ${todayVideo.focus}</p>
                                <span style="display:inline-block;font-size:13px;letter-spacing:1px;color:#B8973A;background:rgba(184,151,58,0.12);padding:8px 18px;border-radius:20px;border:1px solid rgba(184,151,58,0.3);font-weight:600;">${todayPractice.duration}</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Today's Guide (rotating article from the content engine) -->
                    <tr>
                        <td style="padding:0 48px 24px;">
                            <div style="padding:24px; background: rgba(184, 151, 58, 0.04); border: 1px solid rgba(184, 151, 58, 0.25); border-radius: 12px;">
                                <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 12px;font-weight:700;">Today's Guide</p>
                                <p style="font-size:20px;font-weight:600;color:#1E1912;margin:0 0 8px;line-height:1.35;">${todayGuide.title}</p>
                                <p style="font-size:15px;line-height:1.7;color:#2E261C;margin:0 0 16px; opacity: 0.95;">${todayGuide.teaser}</p>
                                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}&url=${encodeURIComponent(guideUrl)}" style="display:inline-block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8B6A1A;text-decoration:none;font-weight:700;">Read Today's Guide &rarr;</a>
                            </div>
                        </td>
                    </tr>

                    <!-- Curiosity Gap -->
                    <tr>
                        <td style="padding:0 48px 32px;text-align:center;">
                            <p style="font-size:17px;line-height:1.9;color:rgba(46,38,28,0.85);font-style:italic;margin:0;font-weight:400;">${todayPractice.teaser}</p>
                        </td>
                    </tr>

                    <!-- Primary CTA -->
                    <tr>
                        <td style="padding:0 48px 20px;text-align:center;">
                            <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}&url=${encodeURIComponent('https://www.skrmblissai.in/mindgym')}" style="display:inline-block;padding:18px 48px;background:#B8973A;color:#0C0910;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;border-radius:4px;">Open Today's Practice &rarr; (5 min)</a>
                        </td>
                    </tr>

                    <!-- Secondary CTA — Free Journal Download -->
                    <tr>
                        <td style="padding:0 48px 48px;text-align:center;">
                            <div style="border:1px solid rgba(184,151,58,0.35);border-radius:12px;padding:20px 28px;background:rgba(184,151,58,0.04);display:inline-block;">
                                <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8973A;margin:0 0 8px;font-weight:700;">🎁 Free Resource</p>
                                <p style="font-size:16px;color:#1E1912;margin:0 0 14px;font-weight:500;line-height:1.4;">Download your free<br><strong>30-Day Now Practice Journal</strong></p>
                                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}&url=${encodeURIComponent('https://www.skrmblissai.in/aboutmindgym')}" style="display:inline-block;padding:12px 32px;background:transparent;color:#B8973A;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;border:2px solid #B8973A;border-radius:4px;">Get Free Journal &darr;</a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:rgba(184,151,58,0.03);padding:32px 48px;border-top:1px solid rgba(184,151,58,0.2);text-align:center;">
                            <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(184, 151, 58, 0.8);margin:0 0 16px;">Mind Gym</p>
                            <p style="font-size:10px;color:rgba(30, 25, 18, 0.6);margin:0;line-height:1.8;">
                                <a href="https://wa.me/918217581238" style="color:#B8973A;text-decoration:none;">WhatsApp Support</a> &nbsp;&middot;&nbsp; 
                                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId={{USER_ID}}&blastId=DAILY_REMINDER" style="color:rgba(30, 25, 18, 0.6);text-decoration:none;">Unsubscribe from Mind Gym</a>
                            </p>
                            <p style="font-size:10px;color:rgba(30, 25, 18, 0.6);margin:8px 0 0;line-height:1.8;">
                                By <a href="https://www.skrmblissai.in/twinsouls" style="color:#B8973A;text-decoration:none;">Twin Souls</a> &nbsp;&middot;&nbsp; 
                                <a href="https://www.youtube.com/@SoulfulIntelligenceStudio" style="color:#B8973A;text-decoration:none;">
                                    <img src="https://img.icons8.com/material-rounded/24/B8973A/youtube-play.png" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;" alt="YouTube" />
                                    Soulful Intelligence Studio
                                </a>
                            </p>
                        </td>
                    </tr>
                </table>
                <!-- TRACKING PIXEL -->
                <img src="https://us-central1-awakened-path-2026.cloudfunctions.net/emailOpenTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}" width="1" height="1" style="display:none !important;" />
            </td>
        </tr>
    </table>
</body>
</html>
`;

    let sentCount = 0;
    let blastId = null;
    let recipientEmails = [];

    for (const emailAddr of subscriberEmails) {
        // Look up Firestore data for this email (timezone, uid, etc.)
        const userData = usersByEmail[emailAddr] || { email: emailAddr };
        const userDoc = userData._id ? { id: userData._id } : { id: emailAddr };

        // Honour unsubscribes. The send list comes from subscribers.txt, but the
        // unsubscribe handler flags the Firestore user doc — without this check a
        // user who clicked "Unsubscribe" would keep receiving the daily email.
        if ((userData.unsubscribed === true || userData.notificationsEnabled === false) && !isAdminEmail(emailAddr)) {
            console.log(`Skipping ${emailAddr} — unsubscribed.`);
            continue;
        }

        // Calculate User's current local hour
        const userTimezone = userData.timezone || 'Asia/Kolkata'; // Default to India if not specified
        let userHour;
        try {
            const userDateStr = new Date().toLocaleString("en-US", { timeZone: userTimezone, hour12: false });
            const timePart = userDateStr.split(', ')[1];
            userHour = parseInt(timePart.split(':')[0], 10);
        } catch (e) {
            userHour = new Date().getHours();
        }

        if (!force && userHour !== 20) {
            continue;
        }

        // Check for 5-day throttle for Support@eckharttolle.com
        if (emailAddr && emailAddr.toLowerCase() === 'support@eckharttolle.com') {
            const lastSent = userData.lastReminderSentAt ? (userData.lastReminderSentAt.toDate ? userData.lastReminderSentAt.toDate() : new Date(userData.lastReminderSentAt)) : null;
            if (lastSent) {
                const now = new Date();
                const diffTime = Math.abs(now - lastSent);
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays < 4.8) { // Using 4.8 to be safe with hourly runs
                    console.log(`Throttling Support@eckharttolle.com - last sent ${diffDays.toFixed(1)} days ago.`);
                    continue;
                }
            }
        }

        // Create blast record on first real send of this run
        if (!blastId) {
            const blastRef = await db.collection("email_blasts").add({
                subject: todaySubject,
                chapterTitle: "Daily Mind Gym Practice",
                chapterSubtitle: daily.headline,
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
                totalRecipients: 0,
                adminEmail: "SYSTEM_AUTOMATED",
                videoId: todayVideo.id || null,
                videoTitle: todayVideo.title || null,
            });
            blastId = blastRef.id;
        }

        {
            console.log(`Sending reminder to ${emailAddr}`);

            // Personalize unsubscribe link and tracking pixel
            const personalizedHtml = emailTemplate
                .replace(/{{USER_ID}}/g, userData._id || emailAddr)
                .replace(/{{USER_EMAIL_TRACK}}/g, encodeURIComponent(emailAddr))
                .replace(/DAILY_REMINDER/g, blastId);

            try {
                // Plain-text version — Gmail is far less likely to filter to Promotions
                // when a proper text/plain alternative exists alongside the HTML.
                const plainText = `Good evening,

${daily.hook || ''}

TODAY'S VIDEO: ${todayVideo.title}
Watch now → https://www.youtube.com/watch?v=${todayVideo.id}

TODAY'S PRACTICE: ${todayPractice.name}
${todayPractice.tagline}

${todayPractice.teaser}

Begin your practice → https://www.skrmblissai.in/mindgym

TODAY'S GUIDE: ${todayGuide.title}
${todayGuide.teaser}
Read → ${guideUrl}

──────────────────────────────
FREE: Download your 30-Day Now Practice Journal
→ https://www.skrmblissai.in/aboutmindgym
──────────────────────────────

Reply to this email anytime — I read every message.

With love,
Shruti
Mind Gym · connect@skrmblissai.in

To stop receiving these emails: https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId=${userData._id || emailAddr}
`;
                await transporter.sendMail({
                    from: '"Mind Gym" <connect@skrmblissai.in>',
                    replyTo: 'connect@skrmblissai.in',
                    to: emailAddr,
                    subject: todaySubject,
                    text: plainText,
                    html: personalizedHtml,
                    // List-Unsubscribe removed — it's Gmail's strongest Promotions classifier.
                    // Unsubscribe link is inside the email body plain text instead.
                    headers: {
                        'X-Entity-Ref-ID': `mindgym-daily-${new Date().toISOString().split('T')[0]}`,
                    }
                });
                console.log(`Success: Reminder sent to ${emailAddr}`);
                sentCount++;
                recipientEmails.push(emailAddr);
                
                // Update last sent timestamp in Firestore if user exists there
                if (userData._id) {
                    await db.collection("users").doc(userData._id).update({
                        lastReminderSentAt: admin.firestore.FieldValue.serverTimestamp()
                    }).catch(() => {});
                }
            } catch (mailErr) {
                console.error(`Failed to send reminder to ${emailAddr}:`, mailErr.message);
                // Continue to next user
            }
        }
    }

    // Update the blast record with final count
    if (blastId && sentCount > 0) {
        await db.collection("email_blasts").doc(blastId).update({
            totalRecipients: sentCount,
            recipientEmails: recipientEmails
        });
    }

    console.log(`Finished sending all reminders. Total: ${sentCount}`);
}

/**
 * Unsubscribe Handler
 */
exports.unsubscribe = onRequest({ cors: true }, async (req, res) => {
    const { userId, blastId } = req.query;
    if (!userId) return res.status(400).send("Invalid request.");

    try {
        // Look up the email BEFORE mutating, so admin/team accounts can never be
        // suppressed (e.g. an admin testing the unsubscribe button on themselves).
        let unscEmail = "Unknown";
        const preDoc = await db.collection("users").doc(userId).get();
        if (preDoc.exists) unscEmail = preDoc.data().email || "Unknown";

        if (isAdminEmail(unscEmail)) {
            // Heal any stale flag and keep the admin subscribed.
            await db.collection("users").doc(userId).set({
                notificationsEnabled: true,
                unsubscribed: false,
            }, { merge: true });
            return res.send(`
                <html><head><title>Admin account</title></head>
                <body style="font-family: Georgia, serif; text-align: center; padding: 80px 20px; background: #FDFAF4; color: #1C1814;">
                    <h1 style="font-weight: 300; font-style: italic;">This is a team account.</h1>
                    <p style="color: #3A342C; margin: 20px 0 40px;">Admin/team addresses stay subscribed so you can monitor and test the emails. Nothing was changed.</p>
                    <a href="https://www.skrmblissai.in/mindgym" style="display: inline-block; padding: 12px 30px; background: #1C1814; color: #E6C57D; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Return to Presence</a>
                </body></html>
            `);
        }

        await db.collection("users").doc(userId).set({
            notificationsEnabled: false,
            unsubscribed: true,
            unsubscribedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        try {

            await db.collection("activity_logs").add({
                userId: userId,
                activityType: "EMAIL_UNSUBSCRIBED",
                userEmail: unscEmail,
                details: blastId ? `Unsubscribed from blast ${blastId}` : 'Unsubscribed from general settings',
                blastId: blastId || null,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            if (blastId) {
                await db.collection("email_unsubscribes").add({
                    blastId,
                    userEmail: unscEmail,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (e) {
            console.error("Failed to log unsubscribe activity:", e);
        }
        
        res.send(`
            <html>
            <head><title>Unsubscribed</title></head>
            <body style="font-family: Georgia, serif; text-align: center; padding: 80px 20px; background: #FDFAF4; color: #1C1814;">
                <h1 style="font-weight: 300; font-style: italic;">You have successfully unsubscribed.</h1>
                <p style="color: #3A342C; margin: 20px 0 40px;">Your notifications have been turned off. We wish you peace on your continued journey.</p>
                <a href="https://www.skrmblissai.in/mindgym" style="display: inline-block; padding: 12px 30px; background: #1C1814; color: #E6C57D; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Return to Presence</a>
            </body>
            </html>
        `);
    } catch (e) {
        console.error("Unsubscribe Error:", e);
        res.status(500).send("There was an error processing your request. Please try again later.");
    }
});

/**
 * One-time admin util: bulk-unsubscribe specific email addresses by email lookup.
 * Protected by a secret key. Safe to keep — only fires when called with correct key.
 */
exports.adminUnsubscribeEmails = onRequest({ cors: true }, async (req, res) => {
    if (req.query.key !== 'bliss-admin-2026') return res.status(403).send('Forbidden');
    const emailsToUnsub = (req.query.emails || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!emailsToUnsub.length) return res.status(400).send('No emails provided');

    const usersSnap = await db.collection('users').get();
    const results = [];
    for (const doc of usersSnap.docs) {
        const email = (doc.data().email || '').toLowerCase();
        if (emailsToUnsub.includes(email)) {
            await db.collection('users').doc(doc.id).set({
                notificationsEnabled: false,
                unsubscribed: true,
                unsubscribedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            results.push({ email, uid: doc.id, status: 'unsubscribed' });
        }
    }
    const notFound = emailsToUnsub.filter(e => !results.find(r => r.email === e));
    notFound.forEach(e => results.push({ email: e, status: 'not_found_in_users_collection' }));
    res.json({ results });
});

/**
 * Admin: Blast Update Email
 */
exports.blastUpdateEmail = onCall({
    secrets: [emailUser, emailPass]
}, async (request) => {
    // SECURITY: central admin gate — also enforces email_verified.
    if (!isAdminRequest(request)) {
        throw new HttpsError("permission-denied", "Unauthorized");
    }

    const { chapterTitle, chapterSubtitle, articleUrl, videoUrl } = request.data;
    const usersSnap = await db.collection("users").get();
    const transporter = getTransporter();
    const recipientEmails = [];
    
    const targetArticleUrl = articleUrl || 'https://www.skrmblissai.in/guides/how-to-stop-overthinking-at-night';
    const targetVideoUrl = videoUrl || 'https://www.skrmblissai.in/videos/ep1-feelings-and-emotions';

    // 1. Create Blast History Record
    const blastRef = await db.collection("email_blasts").add({
        subject: `Daily Presence Guide: ${chapterTitle}`,
        chapterTitle,
        chapterSubtitle,
        articleUrl: targetArticleUrl,
        videoUrl: targetVideoUrl,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        totalRecipients: usersSnap.size,
        adminEmail: request.auth.token.email,
        type: 'DAILY_ARTICLE_BLAST'
    });

    const updateTemplate = (recipientEmail, blastId) => `
        <div style="font-family: Georgia, serif; padding: 40px; background: #0C0910; color: #FDFAF4; border: 1px solid rgba(184,151,58,0.2); max-width: 520px; margin: auto; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #E6C57D; opacity: 0.85;">Daily Presence &amp; Mindfulness Guide</span>
                <h1 style="color: #E6C57D; margin-top: 10px; font-weight: 400; font-size: 24px;">${chapterTitle}</h1>
            </div>

            <p style="font-size: 14.5px; line-height: 1.65; color: #E0D6C3; margin-bottom: 28px;">${chapterSubtitle}</p>
            
            <!-- READ DAILY ARTICLE BUTTON -->
            <div style="text-align: center; margin-top: 24px; margin-bottom: 28px;">
                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=${blastId}&email=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(targetArticleUrl)}" style="display: inline-block; padding: 14px 36px; background: #E6C57D; color: #1C1814; text-decoration: none; font-size: 14px; letter-spacing: 1px; font-weight: bold; border-radius: 999px;">Read Today's Article Guide →</a>
            </div>

            <!-- 60-SECOND TEASER VIDEO CALLOUT -->
            <div style="margin-top: 32px; padding: 20px; background: rgba(230,197,125,0.08); border-radius: 14px; border: 1px solid rgba(230,197,125,0.2); text-align: center;">
                <p style="font-size: 10.5px; letter-spacing: 2px; text-transform: uppercase; color: #E6C57D; margin: 0 0 6px; font-weight: bold;">🎬 60-Second Masterclass Teaser</p>
                <p style="font-size: 13px; color: #FDFAF4; margin: 0 0 14px;">Watch Episode 1: "Feelings vs Emotions: How We Learned to Hide Our Feelings"</p>
                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=${blastId}&email=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(targetVideoUrl)}" style="display: inline-block; padding: 10px 24px; background: transparent; border: 1px solid #E6C57D; color: #E6C57D; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 999px;">Watch 60s Video Teaser 🍿</a>
            </div>

            <p style="text-align: center; margin-top: 32px;">
                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId={{USER_ID}}&blastId=${blastId}" style="color: rgba(253, 250, 244, 0.4); text-decoration: none; font-size: 10.5px;">Unsubscribe from daily wisdom updates</a>
            </p>
            <!-- TRACKING PIXEL -->
            <img src="https://us-central1-awakened-path-2026.cloudfunctions.net/emailOpenTracker?blastId=${blastId}&email=${encodeURIComponent(recipientEmail)}" width="1" height="1" style="display:none !important;" />
        </div>
    `;

    for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const recipientEmail = (userData.email || '').trim();

        // Skip: no email, unsubscribed, notifications disabled, or team/internal accounts
        if (!recipientEmail) continue;
        if (userData.unsubscribed === true) continue;
        if (userData.notificationsEnabled === false) continue;
        if (['skrmblissai@gmail.com', 'shrutikhungar@gmail.com', 'simkatyal1@gmail.com',
             'smriti.duggal@gmail.com', 'rashmi.purbey@gmail.com'].includes(recipientEmail.toLowerCase())) continue;

        // Use Firestore doc ID as userId so unsubscribe handler can find the right document
        const userId = userDoc.id;

        try {
            await transporter.sendMail({
                from: '"Mind Gym" <connect@skrmblissai.in>',
                to: recipientEmail,
                subject: `Daily Presence Guide: ${chapterTitle}`,
                html: updateTemplate(recipientEmail, blastRef.id).replace(/{{USER_ID}}/g, userId)
            });
            recipientEmails.push(recipientEmail);
        } catch (sendErr) {
            console.error(`Failed to send to ${recipientEmail}:`, sendErr.message);
        }
    }

    // Update blast with recipients
    await blastRef.update({
        recipientEmails: recipientEmails,
        totalRecipients: recipientEmails.length
    });

    return { success: true, count: usersSnap.size, blastId: blastRef.id };
});

/**
 * Open Tracker: Fires when user opens email
 */
exports.emailOpenTracker = onRequest({ cors: true }, async (req, res) => {
    const { blastId, email } = req.query;

    if (blastId && email) {
        try {
            // Log the open event
            await db.collection("email_opens").add({
                blastId,
                userEmail: email,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            // Also log to activity_logs for real-time visibility in Engagement Report
            await db.collection("activity_logs").add({
                userEmail: email,
                activityType: 'EMAIL_OPEN',
                details: `Opened Update Blast (${blastId})`,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error("Open track failed:", e);
        }
    }

    // Return 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pixel);
});

/**
 * Click Tracker: Fires when user clicks a link in email
 */
exports.emailClickTracker = onRequest({ cors: true }, async (req, res) => {
    const { blastId, email, url } = req.query;
    const target = url || 'https://www.skrmblissai.in/mindgym';

    // Detect link type for richer logging
    const isYouTube = typeof target === 'string' && (target.includes('youtube.com') || target.includes('youtu.be'));
    const isGuideArticle = typeof target === 'string' && target.includes('/guides/');
    const activityType = isYouTube ? 'EMAIL_YOUTUBE_CLICK' : isGuideArticle ? 'EMAIL_ARTICLE_CLICK' : 'EMAIL_CTA_CLICK';
    const clickDetails = isYouTube
        ? `Clicked YouTube video link from email${blastId ? ` (blast ${blastId})` : ''}`
        : isGuideArticle
        ? `Clicked Daily Article Link from email → ${target}`
        : `Clicked CTA button in email${blastId ? ` (blast ${blastId})` : ''} → ${target}`;

    if (blastId && email) {
        try {
            await db.collection("activity_logs").add({
                userEmail: email,
                activityType,
                details: clickDetails,
                location: 'Email',
                destination: target,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            await db.collection("email_clicks").add({
                blastId,
                userEmail: email,
                isYouTube,
                destination: target,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error("Click track failed:", e);
        }
    }

    // Append utm_email to destination so the landing page can identify the user
    let redirectTarget = target;
    if (email && typeof target === 'string' && !isYouTube) {
        const separator = target.includes('?') ? '&' : '?';
        redirectTarget = `${target}${separator}utm_email=${encodeURIComponent(email)}`;
    }

    res.redirect(redirectTarget);
});

/**
 * Generic web activity tracker — called from frontend pages (AboutJournal, main app)
 * to log page visits, video plays, downloads, and form submissions.
 */
exports.logWebActivity = onRequest({ cors: true }, async (req, res) => {
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    const body = req.method === 'POST' ? req.body : req.query;
    const { email, action, page, details, source } = body || {};

    if (!action) return res.status(400).json({ error: 'Missing action' });

    const userEmail = (email || 'anonymous').toLowerCase().trim();

    try {
        await db.collection("activity_logs").add({
            userEmail,
            activityType: action,
            details: details || '',
            location: page || 'web',
            source: source || 'direct',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Notify admin for high-value lead events (email submit, guide download, checkout)
        const notifyEvents = ['EMAIL_FORM_SUBMIT', 'JOURNAL_DOWNLOAD', 'GUIDE_LEAD', 'LEAD_MAGNET_SUBMIT', 'LEAD_MAGNET_DOWNLOAD', 'BUY_INTENT_FORM_SUBMIT', 'CHECKOUT_INTEREST'];
        if (notifyEvents.includes(action) && userEmail !== 'anonymous') {
            try {
                const transporter = getTransporter();
                const actionLabel = action.replace(/_/g, ' ').toLowerCase();
                await transporter.sendMail({
                    from: '"Awakened Presence" <connect@skrmblissai.in>',
                    to: 'skrmblissai@gmail.com, shrutikhungar@gmail.com',
                    subject: `✨ New Lead: ${userEmail} (${actionLabel}) on ${page || 'the website'}`,
                    html: `<div style="font-family:Georgia,serif;padding:32px;background:#0C0910;color:#FDFAF4;border-radius:12px;max-width:480px;margin:auto;">
                        <p style="color:#B8973A;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">Live Lead Notification</p>
                        <h2 style="font-weight:300;font-style:italic;margin:0 0 20px;font-size:22px;">New Lead Captured</h2>
                        <p style="margin:6px 0;"><strong>User / Contact:</strong> ${userEmail}</p>
                        <p style="margin:6px 0;"><strong>Action:</strong> ${action.replace(/_/g, ' ')}</p>
                        <p style="margin:6px 0;"><strong>Page:</strong> ${page || 'unknown'}</p>
                        <p style="margin:6px 0;"><strong>Details:</strong> ${details || '-'}</p>
                        <p style="margin:16px 0 0;font-size:12px;color:#B8973A;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
                    </div>`
                });
            } catch (mailErr) {
                console.error('Admin notify failed:', mailErr.message);
            }
        }

        res.json({ success: true });
    } catch (e) {
        console.error('logWebActivity failed:', e);
        res.status(500).json({ error: 'Failed to log activity' });
    }
});

/**
 * Presence Notifier: Alerts Admin when a user enters the app or clicks an email
 */
exports.notifyAdminOnPresence = onDocumentCreated({
    document: "activity_logs/{logId}",
    secrets: [emailUser, emailPass]
}, async (event) => {
    const logData = event.data.data();
    if (!logData) return;

    // We notify on app opens (SESSION_START) or email interactions (CLICK/OPEN)
    const criticalTypes = ['SESSION_START', 'LOGIN', 'EMAIL_CLICK'];
    
    if (criticalTypes.includes(logData.activityType)) {
        // Use the central ADMIN_EMAILS list so this filter never drifts.
        // Don't notify if the activity is from an admin themselves.
        if (ADMIN_EMAILS.includes((logData.userEmail || '').toLowerCase())) {
            return;
        }

        try {
            const transporter = getTransporter();
            const actionLabel = logData.activityType === 'SESSION_START' ? 'Entered the Path' : 
                               logData.activityType === 'EMAIL_CLICK' ? 'Clicked Email Link' : 'Logged In';

            await transporter.sendMail({
                from: '"Awakened Presence" <connect@skrmblissai.in>',
                to: 'skrmblissai@gmail.com, shrutikhungar@gmail.com',
                subject: `✨ Presence: ${logData.userEmail} is ${actionLabel}`,
                html: `
                    <div style="font-family: Georgia, serif; padding: 40px; background: #0C0910; color: #FDFAF4; border: 1px solid rgba(184,151,58,0.2); border-radius: 12px; max-width: 500px; margin: auto;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <span style="font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: #B8973A; opacity: 0.8;">Live Notification</span>
                            <h2 style="color: #E6C57D; font-weight: 300; font-style: italic; margin-top: 10px;">A Witness has Arrived</h2>
                        </div>
                        <div style="background: rgba(184, 151, 58, 0.05); padding: 25px; border-radius: 8px;">
                            <p style="margin: 0 0 12px;"><strong>User:</strong> ${logData.userEmail}</p>
                            <p style="margin: 0 0 12px;"><strong>Action:</strong> ${actionLabel}</p>
                            <p style="margin: 0 0 12px;"><strong>Location:</strong> ${logData.location || 'Unknown'}</p>
                            <p style="margin: 0;"><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</p>
                        </div>
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="https://www.skrmblissai.in/mindgym/admin" style="display: inline-block; padding: 14px 32px; background: #B8973A; color: #0C0910; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; border-radius: 4px;">View Live Dashboard &rarr;</a>
                        </div>
                    </div>
                `
            });
            console.log(`Presence notification sent for ${logData.userEmail}`);
        } catch (e) {
            console.error("Presence Notification Error:", e);
        }
    }
});

/**
 * Generates a temporary signed URL for a sacred track.
 */
exports.getSecureTrackUrl = onCall({
    region: 'us-central1'
}, async (request) => {
    console.log("[getSecureTrackUrl] Request data:", {
        userId: request.auth?.uid,
        trackId: request.data?.trackId,
        path: request.data?.path
    });

    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be signed in to access sacred sounds.');
    }

    const { trackId, path } = request.data;
    if (!trackId || !path) {
        throw new HttpsError('invalid-argument', 'Missing trackId or path.');
    }

    try {
        const defaultBucket = admin.storage().bucket();
        const appspotBucket = admin.storage().bucket('awakened-path-2026.appspot.com');
        const soundscapeBucket = admin.storage().bucket('awakened-path-2026.firebasestorage.app');
        
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        let file = defaultBucket.file(cleanPath);
        let [exists] = await file.exists();

        if (!exists) {
            file = appspotBucket.file(cleanPath);
            [exists] = await file.exists();
        }

        if (!exists) {
            file = soundscapeBucket.file(cleanPath);
            [exists] = await file.exists();
        }
        
        if (!exists) {
            throw new HttpsError('not-found', `Sacred asset not found in any vault: ${cleanPath}`);
        }

        const targetFile = file;

        console.log("[getSecureTrackUrl] Generating signed URL for:", targetFile.name);
        const [url] = await targetFile.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000,
        });

        console.log("[getSecureTrackUrl] Success generating URL");
        return { url };
    } catch (error) {
        console.error('[getSecureTrackUrl] Critical Error:', error);
        // Returning detailed error to the frontend for debugging
        return {
            error: error.message,
            stack: error.stack,
            path: path,
            trackId: trackId
        };
    }
});

/* ===========================================================================
 * Lead Finder
 * Admin-triggered scan that searches public web (Google Custom Search) and
 * Reddit for keyword matches and writes deduped lead docs to Firestore.
 * Manual trigger via httpsCallable from the admin UI.
 * =========================================================================== */
const GOOGLE_DAILY_BUDGET = 90; // hard cap, leaves 10-query buffer under Google's 100/day free tier

function _todayDateKeyUTC() {
    const d = new Date();
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}

// Atomically reserve N Google queries against today's budget. Returns how many were granted.
async function reserveGoogleBudget(needed) {
    const dateKey = _todayDateKeyUTC();
    const ref = db.collection('lead_scans').doc('_quota_' + dateKey);
    // Always read the persisted doc so the UI surfaces real quota state — even on
    // Reddit-only or unconfigured-Google scans, where 'needed' is 0.
    if (needed <= 0) {
        const snap = await ref.get();
        const used = (snap.exists && snap.data().googleUsed) || 0;
        return { reserved: 0, used, remaining: Math.max(0, GOOGLE_DAILY_BUDGET - used) };
    }
    return await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const used = (snap.exists && snap.data().googleUsed) || 0;
        const remaining = Math.max(0, GOOGLE_DAILY_BUDGET - used);
        const reserved = Math.min(needed, remaining);
        if (reserved > 0) {
            tx.set(ref, {
                date: dateKey,
                budget: GOOGLE_DAILY_BUDGET,
                googleUsed: used + reserved,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        return { reserved, used: used + reserved, remaining: remaining - reserved };
    });
}

// If a reserved Google call ultimately failed (network etc), refund 1 to the budget.
async function refundGoogleBudget(count) {
    if (count <= 0) return;
    const dateKey = _todayDateKeyUTC();
    const ref = db.collection('lead_scans').doc('_quota_' + dateKey);
    try {
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(ref);
            if (!snap.exists) return;
            const used = snap.data().googleUsed || 0;
            tx.update(ref, { googleUsed: Math.max(0, used - count) });
        });
    } catch (e) { console.warn('[scanLeads] refund failed:', e.message); }
}

const ADMIN_EMAILS_FOR_LEADS = [
    'shrutikhungar@gmail.com',
    'simkatyal1@gmail.com',
    'rashmi.purbey@gmail.com',
    'smriti.duggal@gmail.com',
    'skrmblissai@gmail.com'
];

const DEFAULT_LEAD_KEYWORDS = [
    'spiritual awakening',
    'untethered soul',
    'presence meditation',
    'consciousness journey',
    'anxiety meditation help',
    'witnessing awareness'
];

// Tiny GET wrapper using Node built-in https - avoids adding a dependency
function httpsGetJson(url, headers) {
    return new Promise((resolve, reject) => {
        const https = require('https');
        const req = https.get(url, { headers: Object.assign({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }, headers || {}) }, (res) => {
            let raw = '';
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    const err = new Error(`HTTP ${res.statusCode} from ${url.split('?')[0]}`);
                    const diagnosticSnippet = raw.slice(0, 800);
                    console.error(`[scanLeads] ${err.message} - Response: ${diagnosticSnippet}`);
                    // Attach the raw response to the error for catching/logging
                    err.responseBody = raw;
                    return reject(err);
                }
                try { resolve(JSON.parse(raw)); }
                catch (e) { reject(new Error('Invalid JSON: ' + e.message)); }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(new Error('Request timeout')); });
    });
}

async function searchGoogle(keyword, apiKey, cx) {
    if (!apiKey || !cx) {
        console.warn('[scanLeads] Google Search skipped: API Key or CX missing.');
        return [];
    }
    const url = 'https://www.googleapis.com/customsearch/v1?key=' + encodeURIComponent(apiKey) + '&cx=' + encodeURIComponent(cx) + '&q=' + encodeURIComponent(keyword) + '&num=10';
    
    // Diagnostic log once per keyword (masked)
    console.log(`[scanLeads] Google Request: key=${apiKey.slice(0,4)}... cx=${cx.slice(0,4)}... q="${keyword}"`);

    try {
        const data = await httpsGetJson(url);
        if (data.error) {
            console.error('[scanLeads] Google Search API Error:', JSON.stringify(data.error));
            return [];
        }
        return (data.items || []).map(item => ({
            source: 'google',
            keyword,
            title: item.title || '',
            snippet: item.snippet || '',
            url: item.link || '',
            displayLink: item.displayLink || ''
        }));
    } catch (e) {
        console.warn(`[scanLeads] Google search network/auth failure for "${keyword}": ${e.message}`);
        // Log more details if it's an API error
        if (e.responseBody) {
            console.error(`[scanLeads] Google API Detailed Error: ${e.responseBody}`);
        }
        // Signal that this particular call failed so we can refund
        throw e;
    }
}

async function searchReddit(keyword) {
    // Public Reddit JSON endpoint
    // Standard User-Agent is critical; Reddit blocks generic node-fetch/https bot strings.
    const url = 'https://www.reddit.com/search.json?q=' + encodeURIComponent(keyword) + '&limit=15&sort=new';
    try {
        const data = await httpsGetJson(url, {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.reddit.com/'
        });
        const children = (data && data.data && data.data.children) || [];
        return children.map(c => {
            const d = c.data || {};
            return {
                source: 'reddit',
                keyword,
                title: d.title || '',
                snippet: (d.selftext || '').slice(0, 280),
                url: d.url ? d.url : (d.permalink ? 'https://www.reddit.com' + d.permalink : ''),
                displayLink: d.subreddit ? 'r/' + d.subreddit : 'reddit.com',
                author: d.author || ''
            };
        }).filter(r => r.url);
    } catch (e) {
        console.warn('[scanLeads] Reddit search failed for "' + keyword + '":', e.message);
        return [];
    }
}

exports.scanLeads = onCall({
    secrets: [googleSearchKey, googleSearchCx],
    timeoutSeconds: 120,
    memory: '512MiB'
}, async (request) => {
    // Admin auth gate — uses centralized helper that enforces email_verified.
    if (!isAdminRequest(request)) {
        throw new HttpsError('permission-denied', 'Admin only.');
    }
    const callerEmail = request.auth.token.email;

    // Inputs
    const keywords = Array.isArray(request.data && request.data.keywords) && request.data.keywords.length > 0
        ? request.data.keywords.map(String).map(s => s.trim()).filter(Boolean).slice(0, 20)
        : DEFAULT_LEAD_KEYWORDS;
    const sources = Array.isArray(request.data && request.data.sources) && request.data.sources.length > 0
        ? request.data.sources
        : ['google', 'reddit'];

    let apiKey = '';
    let cx = '';
    try { 
        apiKey = (googleSearchKey.value() || '').trim(); 
    } catch (e) { 
        console.warn('[scanLeads] Failed to read googleSearchKey secret:', e.message);
        apiKey = ''; 
    }
    try { 
        cx = (googleSearchCx.value() || '').trim(); 
    } catch (e) { 
        console.warn('[scanLeads] Failed to read googleSearchCx secret:', e.message);
        cx = ''; 
    }
    const googleConfigured = !!(apiKey && cx);

    // Reserve Google budget BEFORE making any external calls. This is atomic — even
    // if the admin button is mashed in parallel, two scans cannot both blow past 100/day.
    const desiredGoogleCalls = (sources.includes('google') && googleConfigured) ? keywords.length : 0;
    const budget = await reserveGoogleBudget(desiredGoogleCalls);
    const grantedGoogle = budget.reserved; // how many Google queries we may make this run

    // Run searches in parallel: only the first `grantedGoogle` keywords get a Google call.
    // Reddit is free / unmetered, so it runs for every keyword as long as 'reddit' is in sources.
    const tasks = [];
    let googleAttempted = 0;
    let googleFailed = 0;
    for (let i = 0; i < keywords.length; i++) {
        const kw = keywords[i];
        if (i < grantedGoogle) {
            googleAttempted++;
            tasks.push((async () => {
                try {
                    return await searchGoogle(kw, apiKey, cx);
                } catch (e) {
                    googleFailed++;
                    // searchGoogle throws on network/API failure (unlike empty result)
                    return [];
                }
            })());
        }
        if (sources.includes('reddit')) tasks.push(searchReddit(kw));
    }
    const results = (await Promise.all(tasks)).flat();

    // Refund if any Google calls actually failed (e.g. 400 error)
    if (googleFailed > 0) {
        console.log(`[scanLeads] Refunding ${googleFailed} Google units due to API errors`);
        await refundGoogleBudget(googleFailed);
    }

    // Build run record
    const runRef = await db.collection('lead_scans').add({
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: callerEmail,
        keywords,
        sources,
        rawResultCount: results.length
    });

    // Dedupe vs. existing leads (by URL)
    const existingUrls = new Set();
    const existingSnap = await db.collection('leads').select('url').limit(2000).get();
    existingSnap.forEach(d => { const u = d.get('url'); if (u) existingUrls.add(u); });

    // Also dedupe within this batch
    const batchSeen = new Set();
    const newLeads = [];
    for (const r of results) {
        if (!r.url) continue;
        if (existingUrls.has(r.url) || batchSeen.has(r.url)) continue;
        batchSeen.add(r.url);
        newLeads.push(r);
    }

    // Write new leads in chunks of 400 to stay under the 500-op batch limit
    const now = admin.firestore.FieldValue.serverTimestamp();
    let written = 0;
    for (let i = 0; i < newLeads.length; i += 400) {
        const chunk = newLeads.slice(i, i + 400);
        const batch = db.batch();
        chunk.forEach(lead => {
            const ref = db.collection('leads').doc();
            batch.set(ref, Object.assign({}, lead, {
                status: 'new',
                foundAt: now,
                scanId: runRef.id
            }));
        });
        await batch.commit();
        written += chunk.length;
    }

    await runRef.update({
        finishedAt: admin.firestore.FieldValue.serverTimestamp(),
        newLeadsCount: written,
        configured: { google: googleConfigured, reddit: true },
        budget: {
            googleDailyCap: GOOGLE_DAILY_BUDGET,
            googleUsedToday: budget.used,
            googleRemainingToday: budget.remaining,
            googleCallsThisRun: googleAttempted
        }
    });

    return {
        success: true,
        scanId: runRef.id,
        keywordsScanned: keywords.length,
        rawResultCount: results.length,
        newLeadsCount: written,
        googleConfigured,
        googleCallsThisRun: googleAttempted,
        googleUsedToday: budget.used,
        googleRemainingToday: budget.remaining,
        googleDailyCap: GOOGLE_DAILY_BUDGET,
        budgetCapped: desiredGoogleCalls > grantedGoogle
    };
});

/**
 * Automatically link guest purchases to new accounts based on email address.
 */
// Shared linker: merge any guestPurchases (keyed by lowercased email) into the
// user's account, then delete the guest doc so it isn't re-applied.
async function linkGuestPurchasesForUser(uid, rawEmail) {
    const email = String(rawEmail || '').toLowerCase().trim();
    if (!email) return false;

    const guestRef = db.collection('guestPurchases').doc(email);
    const guestDoc = await guestRef.get();
    if (!guestDoc.exists) return false;

    const guestData = guestDoc.data();
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (guestData.purchasedCourses && guestData.purchasedCourses.length > 0) {
        updateData.purchasedCourses = admin.firestore.FieldValue.arrayUnion(...guestData.purchasedCourses);
    }
    if (guestData.ownedTracks && guestData.ownedTracks.length > 0) {
        updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(...guestData.ownedTracks);
    }
    // A guest PWYW membership purchase carries a single timestamp, not an array
    // — extend the (soon-to-exist) user's membership from whichever is later.
    if (guestData.membershipUntil) {
        const userDoc = await db.collection('users').doc(uid).get();
        const currentUntil = userDoc.exists ? userDoc.data().membershipUntil : null;
        const guestUntilMs = guestData.membershipUntil.toMillis ? guestData.membershipUntil.toMillis() : 0;
        const currentUntilMs = currentUntil && currentUntil.toMillis ? currentUntil.toMillis() : 0;
        updateData.membershipUntil = admin.firestore.Timestamp.fromMillis(Math.max(guestUntilMs, currentUntilMs));
    }
    if (Object.keys(updateData).length <= 1) return false; // nothing to link

    await db.collection('users').doc(uid).set(updateData, { merge: true });
    await guestRef.delete().catch(() => {}); // consumed — avoid re-linking
    console.log(`Linked guest purchases to user ${uid} (${email})`);
    return true;
}

// Fires only for BRAND-NEW accounts.
exports.onUserCreated = functionsV1.auth.user().onCreate(async (user) => {
    try { await linkGuestPurchasesForUser(user.uid, user.email); }
    catch (e) { console.error('onUserCreated link failed:', e); }
});

// Callable for EXISTING users: the client calls this after sign-in so someone
// who already had an account (created before their guest purchase) still gets
// the course unlocked. Uses the authenticated token's email — cannot be spoofed.
exports.linkGuestPurchases = onCall(async (request) => {
    const auth = request.auth;
    if (!auth) throw new HttpsError('unauthenticated', 'Sign in required.');
    const email = auth.token.email;
    const linked = await linkGuestPurchasesForUser(auth.uid, email);
    return { linked };
});
