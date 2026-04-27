const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
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

// Define the secrets created in Google Cloud Secret Manager
const geminiKey = defineSecret("AWAKENED_PATH_GEMINI_KEY");
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");
const emailUser = defineSecret("EMAIL_USER");
const emailPass = defineSecret("EMAIL_PASS");

// Lead-finder secrets — Google Custom Search (Reddit uses public JSON, no key needed)
const googleSearchKey = defineSecret("GOOGLE_SEARCH_API_KEY");
const googleSearchCx = defineSecret("GOOGLE_SEARCH_CX");

// Text-to-Speech Client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Pricing Configuration (Keep in sync with frontend)
const COURSE_PRICES = {
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

const SUBSCRIPTION_PLANS = {
    "premium_monthly": {
        name: "Awakened Path Premium",
        description: "Monthly recurring subscription for full application access",
        amount: 9.99, // USD
        period: "monthly",
        interval: 1,
        total_count: 120 // 10 years max
    },
    "premium_yearly": {
        name: "Awakened Path Premium (Annual)",
        description: "Yearly recurring subscription for full application access",
        amount: 99.90, // USD
        period: "yearly",
        interval: 1,
        total_count: 10 // 10 years max
    }
};

const SUBSCRIPTION_PLANS_INR = {
    "premium_monthly": {
        name: "Awakened Path Premium (INR)",
        description: "Monthly recurring subscription for full application access",
        amount: 799, // INR
        period: "monthly",
        interval: 1,
        total_count: 120
    },
    "premium_yearly": {
        name: "Awakened Path Premium Annual (INR)",
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
// Daily Sacred Reminders — Small, powerful anchors for the day.
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
const DAILY_SUBJECTS = [
    '🌙 One thought is running your evening. Let\'s see it together.',   // Sun
    '🔇 The radio is on. Are you listening — or just hearing?',           // Mon
    '🪐 Before you start the car tomorrow — read this first.',            // Tue
    '🌌 The silence behind everything is waiting for you tonight.',       // Wed
    '🧘 The noise doesn\'t have to win this evening.',                    // Thu
    '👁️ The one who notices the feeling — was never the feeling.',        // Fri
    '✨ Every time you catch yourself — that is the whole practice.',      // Sat
];

/**
 * Creates a Razorpay Order
 */
exports.createRazorpayOrder = onRequest({ secrets: [razorpayKeyId, razorpayKeySecret], cors: true }, async (req, res) => {
    const { courseId, userId, currency = "USD" } = req.body;

    // 1. Get official price from server-side map based on currency
    const priceMap = currency === "INR" ? COURSE_PRICES_INR : COURSE_PRICES;
    const amount = priceMap[courseId];
    
    if (!amount) {
        return res.status(400).send("Invalid or missing courseId");
    }

    try {
        const razorpay = new Razorpay({
            key_id: razorpayKeyId.value(),
            key_secret: razorpayKeySecret.value(),
        });

        const options = {
            amount: Math.round(amount * 100), // In cents/paise
            currency: currency,
            receipt: `r_${courseId.substring(0, 20)}_${Date.now()}`,
            notes: {
                courseId: courseId,
                userId: userId || "anonymous",
                currency: currency
            }
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
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
        if (rzpOrder.notes.userId !== userId || rzpOrder.notes.courseId !== courseId) {
            return res.status(400).send("Order data mismatch. Discrepancy detected.");
        }

        // 3. Grant Access in Firestore
        const userRef = db.collection("users").doc(userId);
        
        // Fetch user to get email for welcome notification
        const userDoc = await userRef.get();
        const userEmail = userDoc.exists ? userDoc.data().email : null;

        const updateData = {
            purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // If it's a soundscape track, also add to ownedTracks
        if (COURSE_PRICES[courseId] && courseId !== 'wisdom_untethered' && courseId !== 'all_access') {
            updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(courseId);
        }

        await userRef.set(updateData, { merge: true });

        // Send Welcome Email
        if (userEmail) {
            try {
                // If the courseId is all_access we consider it a Premium Lifetime mapping
                const planName = courseId === 'all_access' ? 'Premium (Lifetime)' : courseId;
                await sendWelcomeEmail(userEmail, planName);
            } catch (emailErr) {
                console.error("Failed to send welcome email:", emailErr);
            }
        }

        // 4. Log the transaction (Atomic/Secure)
        await db.collection("transactions").doc(razorpay_payment_id).set({
            userId,
            courseId,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: COURSE_PRICES[courseId],
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

        res.json(subscription);
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

        // 3. Log transaction
        await db.collection("transactions").doc(razorpay_payment_id).set({
            userId,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySubscriptionId: razorpay_subscription_id,
            amount: 9.99,
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
exports.razorpayWebhook = onRequest({ secrets: [razorpayKeySecret], cors: true }, async (req, res) => {
    const secret = "YOUR_WEBHOOK_SECRET"; // Should be a Secret Manager secret
    const signature = req.headers["x-razorpay-signature"];

    // 1. Verify Webhook Signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature !== digest) {
        return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
        const payment = payload.payment.entity;
        const { userId, courseId } = payment.notes;
        
        if (userId && courseId) {
            // Grant access if not already granted
            const userRef = db.collection("users").doc(userId);
            await userRef.set({
                purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            await db.collection("transactions").doc(payment.id).set({
                userId,
                courseId,
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
            from: '"The Awakened Path Test" <bliss@awakened-path.com>',
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
    secrets: [emailUser, emailPass, geminiKey],
    cors: true
}, async (req, res) => {
    const { to } = req.query;
    if (!to) return res.status(400).send("Provide 'to' email address.");

    try {
        const daily = await getDailyEmailContent(geminiKey.value());
        const todayPractice = getTodaysPractice();
        const todaySubject = DAILY_SUBJECTS[new Date().getDay()];
        const transporter = getTransporter();

        const previewHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @media (prefers-color-scheme: dark) {
            .body { background-color: #050406 !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#050406; font-family: 'Georgia', serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050406;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#0C0910;border:1px solid rgba(230, 197, 125, 0.2); border-radius: 12px; overflow: hidden;">
                    <!-- Glow Line -->
                    <tr><td style="background: linear-gradient(90deg, transparent, #B8973A, transparent); height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>

                    <tr>
                        <td style="padding:48px 48px 24px;text-align:center;">
                            <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#B8973A;margin:0 0 16px; opacity: 0.8;">Sacred Reminder</p>
                            <h1 style="font-size:28px;font-weight:300;font-style:italic;color:#FDFAF4;margin:0;line-height:1.3; letter-spacing: 1px;">${daily.headline}</h1>
                            <div style="width:40px;height:1px;background:rgba(184, 151, 58, 0.3);margin:24px auto;"></div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 48px 32px;">
                            <p style="font-size:16px;line-height:1.8;color:rgba(253, 250, 244, 0.7);margin:0 0 24px; text-align: center; font-style: italic;">
                                &ldquo;${daily.quote}&rdquo;
                            </p>
                            <p style="font-size:15px;line-height:1.8;color:#FDFAF4;margin:0; opacity: 0.9;">${daily.explanation}</p>
                        </td>
                    </tr>

                    <!-- Today's Practice Card -->
                    <tr>
                        <td style="padding:0 48px 24px;">
                            <div style="padding:28px; background: rgba(184, 151, 58, 0.06); border: 1px solid rgba(184, 151, 58, 0.25); border-radius: 12px;">
                                <p style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 12px; opacity:0.9;">Tonight's Practice</p>
                                <p style="font-size:20px;font-weight:300;font-style:italic;color:#FDFAF4;margin:0 0 8px; line-height:1.3;">${todayPractice.name}</p>
                                <p style="font-size:13px;line-height:1.7;color:rgba(253,250,244,0.6);margin:0 0 16px;">${todayPractice.tagline}</p>
                                <span style="display:inline-block;font-size:10px;letter-spacing:1px;color:#B8973A;background:rgba(184,151,58,0.1);padding:5px 12px;border-radius:20px;border:1px solid rgba(184,151,58,0.2);">${todayPractice.duration}</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Curiosity Gap -->
                    <tr>
                        <td style="padding:0 48px 32px;text-align:center;">
                            <p style="font-size:14px;line-height:1.9;color:rgba(253,250,244,0.45);font-style:italic;margin:0;">${todayPractice.teaser}</p>
                        </td>
                    </tr>

                    <!-- CTA — deep-links directly into the practice -->
                    <tr>
                        <td style="padding:0 48px 56px;text-align:center;">
                            <a href="https://www.skrmblissai.in/awakenedpath?practice=${todayPractice.q}&source=email" style="display:inline-block;padding:18px 48px;background:#B8973A;color:#0C0910;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold; border-radius: 4px;">Begin ${todayPractice.name} &rarr;</a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:rgba(255,255,255,0.02);padding:32px 48px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                            <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(184, 151, 58, 0.6);margin:0 0 16px;">Awakened Path Studio &nbsp;&middot;&nbsp; Preview Only</p>
                            <p style="font-size:10px;color:rgba(253, 250, 244, 0.4);margin:0;line-height:1.8;">
                                <a href="https://wa.me/918217581238" style="color:#B8973A;text-decoration:none;">WhatsApp Support</a>
                            </p>
                            <p style="font-size:10px;color:rgba(253, 250, 244, 0.4);margin:8px 0 0;line-height:1.8;">
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
            from: '"The Awakened Path" <connect@skrmblissai.in>',
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
    <title>The Awakened Path</title>
</head>
<body style="margin:0;padding:0;background:#f0ece4;">
    <!-- Preheader Text -->
    <div style="display:none;font-size:1px;color:#f0ece4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        Welcome to The Awakened Path. The journey begins now.
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ece4;">
        <tr>
            <td align="center" style="padding:24px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FDFAF4;border:1px solid #E6C57D;">
                    <tr><td style="background:#B8973A;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    <tr>
                        <td style="padding:32px 40px 20px;text-align:center;">
                            <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 16px;">Awakened Path &middot; Access Granted</p>
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
        from: '"The Awakened Path" <bliss@awakened-path.com>',
        to: toEmail,
        subject: "Welcome: The Path is Open",
        html: emailTemplate
    });
}

exports.forceTriggerEmail = onRequest({
    secrets: [emailUser, emailPass, geminiKey],
    timeoutSeconds: 300
}, async (req, res) => {
    try {
        console.log(`Manually triggering daily reminders...`);
        await runReminderLogic(geminiKey.value());
        res.send("Daily reminders triggered successfully.");
    } catch (e) {
        console.error(`FORCETRIGGER_ERROR:`, e);
        res.status(500).send(`Reminder trigger failed: ${e.message}`);
    }
});

/**
 * Scheduled Reminder: Hourly Check for 8:00 PM Local Time
 */
exports.sendDailyReminder = onSchedule({
    schedule: "0 * * * *", // Runs every hour
    secrets: [emailUser, emailPass, geminiKey]
}, async (event) => {
    return runReminderLogic(geminiKey.value());
});

async function getDailyEmailContent(apiKey) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
            Act as a Presence Coach based on 'The Untethered Soul' and 'The Power of Now'.
            Generate a daily evening practice reminder for students.
            Return exactly a JSON object:
            {
              "headline": "A short poetic headline (max 5 words. Theme: 'Peace is a Choice. Not a State.')",
              "quote": "A soul-stirring quote about being the witness (max 20 words)",
              "explanation": "One or two sentences about observing the mind at the end of the day",
              "practice": "A simple 1-sentence evening awareness exercise"
            }
        `;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim();
        const cleanedJson = text.replace(/```json|```/gi, '').trim();
        return JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Gemini Content Error:", e);
        return {
            headline: "Peace is a Choice. Not a State.",
            quote: "You are the listener. Not the radio.",
            explanation: "The voice in your head has been talking all day. You don't have to answer it. You don't have to silence it. Just — step back. Notice it is there. And rest in the one who is noticing.",
            practice: "Before you sleep — notice one thought that ran today without your permission. Don't judge it. Just see it for what it is."
        };
    }
}

async function runReminderLogic(apiKey) {
    const today = new Date().toISOString().split('T')[0];
    const usersSnap = await db.collection("users").get();
    const transporter = getTransporter();

    const daily = await getDailyEmailContent(apiKey);
    const todayPractice = getTodaysPractice();
    const todaySubject = DAILY_SUBJECTS[new Date().getDay()];

    const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @media (prefers-color-scheme: dark) {
            .body { background-color: #050406 !important; }
            .card { background-color: #0C0910 !important; border-color: rgba(230, 197, 125, 0.2) !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#050406; font-family: 'Georgia', serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#050406;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#0C0910;border:1px solid rgba(230, 197, 125, 0.2); border-radius: 12px; overflow: hidden;">
                    <!-- Glow Line -->
                    <tr><td style="background: linear-gradient(90deg, transparent, #B8973A, transparent); height:1px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    
                    <tr>
                        <td style="padding:48px 48px 24px;text-align:center;">
                            <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#B8973A;margin:0 0 16px; opacity: 0.8;">Sacred Reminder</p>
                            <h1 style="font-size:28px;font-weight:300;font-style:italic;color:#FDFAF4;margin:0;line-height:1.3; letter-spacing: 1px;">${daily.headline}</h1>
                            <div style="width:40px;height:1px;background:rgba(184, 151, 58, 0.3);margin:24px auto;"></div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding:0 48px 32px;">
                            <p style="font-size:16px;line-height:1.8;color:rgba(253, 250, 244, 0.7);margin:0 0 24px; text-align: center; font-style: italic;">
                                "${daily.quote}"
                            </p>
                            
                            <p style="font-size:15px;line-height:1.8;color:#FDFAF4;margin:0; opacity: 0.9;">${daily.explanation}</p>
                        </td>
                    </tr>
                    
                    <!-- Today's Practice Card -->
                    <tr>
                        <td style="padding:0 48px 24px;">
                            <div style="padding:28px; background: rgba(184, 151, 58, 0.06); border: 1px solid rgba(184, 151, 58, 0.25); border-radius: 12px;">
                                <p style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 12px; opacity:0.9;">Tonight's Practice</p>
                                <p style="font-size:20px;font-weight:300;font-style:italic;color:#FDFAF4;margin:0 0 8px; line-height:1.3;">${todayPractice.name}</p>
                                <p style="font-size:13px;line-height:1.7;color:rgba(253,250,244,0.6);margin:0 0 16px;">${todayPractice.tagline}</p>
                                <span style="display:inline-block;font-size:10px;letter-spacing:1px;color:#B8973A;background:rgba(184,151,58,0.1);padding:5px 12px;border-radius:20px;border:1px solid rgba(184,151,58,0.2);">${todayPractice.duration}</span>
                            </div>
                        </td>
                    </tr>

                    <!-- Curiosity Gap -->
                    <tr>
                        <td style="padding:0 48px 32px;text-align:center;">
                            <p style="font-size:14px;line-height:1.9;color:rgba(253,250,244,0.45);font-style:italic;margin:0;">${todayPractice.teaser}</p>
                        </td>
                    </tr>

                    <!-- CTA — named after today's practice, deep-links directly into it -->
                    <tr>
                        <td style="padding:0 48px 56px;text-align:center;">
                            <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=DAILY_REMINDER&email={{USER_EMAIL_TRACK}}&url=${encodeURIComponent('https://www.skrmblissai.in/awakenedpath?practice=' + todayPractice.q + '&source=email')}" style="display:inline-block;padding:18px 48px;background:#B8973A;color:#0C0910;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold; border-radius: 4px;">Begin ${todayPractice.name} &rarr;</a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color:rgba(255,255,255,0.02);padding:32px 48px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
                            <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(184, 151, 58, 0.6);margin:0 0 16px;">Awakened Path Studio</p>
                            <p style="font-size:10px;color:rgba(253, 250, 244, 0.4);margin:0;line-height:1.8;">
                                <a href="https://wa.me/918217581238" style="color:#B8973A;text-decoration:none;">WhatsApp Support</a> &nbsp;&middot;&nbsp; 
                                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId={{USER_ID}}&blastId=DAILY_REMINDER" style="color:rgba(253, 250, 244, 0.4);text-decoration:none;">Unsubscribe from the Path</a>
                            </p>
                            <p style="font-size:10px;color:rgba(253, 250, 244, 0.4);margin:8px 0 0;line-height:1.8;">
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

    for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();

        // Exclude specific emails
        const blockedEmails = [
            'simkatyal1@gmail.com', 
            'smriti.duggal@gmail.com', 
            'jetski@test.com', 
            'shrutikhungar@gmail.com',
            'testuser@example.com',
            'test@example.com',
            'echarttolleteachings@gmail.com'
        ];
        if (userData.email && blockedEmails.includes(userData.email.toLowerCase())) {
            continue;
        }

        if (!userData.email || userData.notificationsEnabled === false) continue;

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

        if (userHour !== 20) {
            continue;
        }

        // Check for 5-day throttle for Support@eckharttolle.com
        if (userData.email && userData.email.toLowerCase() === 'support@eckharttolle.com') {
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

        // Check if user has already practiced today
        const practiceSnap = await userDoc.ref.collection("dailyPractices").doc(today).get();
        if (!practiceSnap.exists || !practiceSnap.data().completed) {
            
            // Create blast record on first real send of this run
            if (!blastId) {
                const blastRef = await db.collection("email_blasts").add({
                    subject: "An Invitation to Return to Source",
                    chapterTitle: "Daily Sacred Reminder",
                    chapterSubtitle: daily.headline,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                    totalRecipients: 0, // Will update later
                    adminEmail: "SYSTEM_AUTOMATED"
                });
                blastId = blastRef.id;
            }

            console.log(`Sending reminder to ${userData.email}`);
            
            // Personalize unsubscribe link and tracking pixel
            const personalizedHtml = emailTemplate
                .replace(/{{USER_ID}}/g, userDoc.id)
                .replace(/{{USER_EMAIL_TRACK}}/g, encodeURIComponent(userData.email))
                .replace(/DAILY_REMINDER/g, blastId);

            await transporter.sendMail({
                from: '"The Awakened Path" <connect@skrmblissai.in>',
                to: userData.email,
                subject: todaySubject,
                html: personalizedHtml,
                headers: {
                    'List-Unsubscribe': `<https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId=${userDoc.id}>`
                }
            });

            // Update last sent timestamp
            await userDoc.ref.update({
                lastReminderSentAt: admin.firestore.FieldValue.serverTimestamp()
            });

            sentCount++;
            recipientEmails.push(userData.email);
            console.log(`Success: Reminder sent to ${userData.email}`);
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
        await db.collection("users").doc(userId).set({
            notificationsEnabled: false
        }, { merge: true });

        try {
            let unscEmail = "Unknown";
            const userDoc = await db.collection("users").doc(userId).get();
            if (userDoc.exists) unscEmail = userDoc.data().email || "Unknown";

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
                <a href="https://www.skrmblissai.in/awakenedpath" style="display: inline-block; padding: 12px 30px; background: #1C1814; color: #E6C57D; text-decoration: none; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Return to Presence</a>
            </body>
            </html>
        `);
    } catch (e) {
        console.error("Unsubscribe Error:", e);
        res.status(500).send("There was an error processing your request. Please try again later.");
    }
});

/**
 * Admin: Blast Update Email
 */
exports.blastUpdateEmail = onCall({
    secrets: [emailUser, emailPass]
}, async (request) => {
    // Only allow for admin emails
    const adminEmails = [
        'shrutikhungar@gmail.com',
        'simkatyal1@gmail.com',
        'rashmi.purbey@gmail.com',
        'smriti.duggal@gmail.com'
    ];

    if (!adminEmails.includes(request.auth.token.email)) {
        throw new Error("Unauthorized");
    }

    const { chapterTitle, chapterSubtitle, youtubeId } = request.data;
    const usersSnap = await db.collection("users").get();
    const transporter = getTransporter();
    const recipientEmails = [];
    
    // 1. Create Blast History Record
    const blastRef = await db.collection("email_blasts").add({
        subject: `Course Update: ${chapterTitle}`,
        chapterTitle,
        chapterSubtitle,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        totalRecipients: usersSnap.size,
        adminEmail: request.auth.token.email,
        type: 'COURSE_UPDATE_BLAST'
    });

    const updateTemplate = (recipientEmail, blastId) => `
        <div style="font-family: Arial, sans-serif; padding: 40px; background: #0C0910; color: #FDFAF4; border: 1px solid rgba(184,151,58,0.2);">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; opacity: 0.6;">Course Update</span>
                <h1 style="color: #E6C57D; margin-top: 10px;">${chapterTitle}</h1>
            </div>
            <p>A new chapter has been added to your course: <strong>${chapterTitle}</strong></p>
            <p>${chapterSubtitle}</p>
            <div style="text-align: center; margin-top: 40px;">
                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/emailClickTracker?blastId=${blastId}&email=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent('https://www.skrmblissai.in/awakenedpath/courses/wisdom-untethered')}" style="display: inline-block; padding: 15px 40px; background: #E6C57D; color: #1C1814; text-decoration: none; font-size: 14px; letter-spacing: 1px; font-weight: bold;">View Course →</a>
            </div>
            <p style="text-align: center; margin-top: 20px;">
                <a href="https://us-central1-awakened-path-2026.cloudfunctions.net/unsubscribe?userId={{USER_ID}}&blastId=${blastId}" style="color: rgba(253, 250, 244, 0.4); text-decoration: none; font-size: 10px;">Unsubscribe from these updates</a>
            </p>
            <!-- TRACKING PIXEL -->
            <img src="https://us-central1-awakened-path-2026.cloudfunctions.net/emailOpenTracker?blastId=${blastId}&email=${encodeURIComponent(recipientEmail)}" width="1" height="1" style="display:none !important;" />
        </div>
    `;

    for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (!userData.email) continue;
        
        await transporter.sendMail({
            from: '"The Awakened Path" <connect@skrmblissai.in>',
            to: userData.email,
            subject: `Course Update: ${chapterTitle}`,
            html: updateTemplate(userData.email, blastRef.id).replace(/{{USER_ID}}/g, userDoc.id)
        });
        recipientEmails.push(userData.email);
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
    const target = url || 'https://www.skrmblissai.in/awakenedpath';

    if (blastId && email) {
        try {
            // Log to activity_logs for visibility in Engagement Report
            await db.collection("activity_logs").add({
                userEmail: email,
                activityType: 'EMAIL_CLICK',
                details: `Clicked Button in Email (${blastId})`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                location: 'Email'
            });

            await db.collection("email_clicks").add({
                blastId,
                userEmail: email,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error("Click track failed:", e);
        }
    }

    res.redirect(target);
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
        const adminList = ['shrutikhungar@gmail.com', 'simkatyal1@gmail.com', 'rashmi.purbey@gmail.com', 'smriti.duggal@gmail.com'];
        
        // Don't notify if the activity is from an admin
        if (adminList.includes(logData.userEmail?.toLowerCase())) {
            return;
        }

        try {
            const transporter = getTransporter();
            const actionLabel = logData.activityType === 'SESSION_START' ? 'Entered the Path' : 
                               logData.activityType === 'EMAIL_CLICK' ? 'Clicked Email Link' : 'Logged In';

            await transporter.sendMail({
                from: '"Awakened Presence" <connect@skrmblissai.in>',
                to: 'shrutikhungar@gmail.com',
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
                            <a href="https://www.skrmblissai.in/awakenedpath/admin" style="display: inline-block; padding: 14px 32px; background: #B8973A; color: #0C0910; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold; border-radius: 4px;">View Live Dashboard &rarr;</a>
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
    if (needed <= 0) return { reserved: 0, used: 0, remaining: GOOGLE_DAILY_BUDGET };
    const dateKey = _todayDateKeyUTC();
    const ref = db.collection('lead_scans').doc('_quota_' + dateKey);
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
        const req = https.get(url, { headers: Object.assign({ 'User-Agent': 'AwakenedPath-LeadBot/1.0' }, headers || {}) }, (res) => {
            let raw = '';
            res.on('data', (c) => { raw += c; });
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('HTTP ' + res.statusCode + ': ' + raw.slice(0, 200)));
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
    if (!apiKey || !cx) return [];
    const url = 'https://www.googleapis.com/customsearch/v1?key=' + encodeURIComponent(apiKey) + '&cx=' + encodeURIComponent(cx) + '&q=' + encodeURIComponent(keyword) + '&num=10';
    try {
        const data = await httpsGetJson(url);
        return (data.items || []).map(item => ({
            source: 'google',
            keyword,
            title: item.title || '',
            snippet: item.snippet || '',
            url: item.link || '',
            displayLink: item.displayLink || ''
        }));
    } catch (e) {
        console.warn('[scanLeads] Google search failed for "' + keyword + '":', e.message);
        return [];
    }
}

async function searchReddit(keyword) {
    // Public Reddit JSON endpoint; no auth needed for read-only search
    const url = 'https://www.reddit.com/search.json?q=' + encodeURIComponent(keyword) + '&limit=15&sort=new';
    try {
        const data = await httpsGetJson(url);
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
    // Admin auth gate
    const callerEmail = request.auth && request.auth.token && request.auth.token.email;
    if (!callerEmail || !ADMIN_EMAILS_FOR_LEADS.includes(callerEmail)) {
        throw new HttpsError('permission-denied', 'Admin only.');
    }

    // Inputs
    const keywords = Array.isArray(request.data && request.data.keywords) && request.data.keywords.length > 0
        ? request.data.keywords.map(String).map(s => s.trim()).filter(Boolean).slice(0, 20)
        : DEFAULT_LEAD_KEYWORDS;
    const sources = Array.isArray(request.data && request.data.sources) && request.data.sources.length > 0
        ? request.data.sources
        : ['google', 'reddit'];

    let apiKey = '';
    let cx = '';
    try { apiKey = googleSearchKey.value(); } catch (e) { apiKey = ''; }
    try { cx = googleSearchCx.value(); } catch (e) { cx = ''; }
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
                const r = await searchGoogle(kw, apiKey, cx);
                // searchGoogle returns [] on failure; we can't reliably distinguish 'no results'
                // from 'network error', so we don't refund on empty arrays.
                return r;
            })());
        }
        if (sources.includes('reddit')) tasks.push(searchReddit(kw));
    }
    const results = (await Promise.all(tasks)).flat();

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
