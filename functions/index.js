const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const textToSpeech = require("@google-cloud/text-to-speech");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

// Define the secrets created in Google Cloud Secret Manager
const geminiKey = defineSecret("AWAKENED_PATH_GEMINI_KEY");
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");
const emailUser = defineSecret("EMAIL_USER");
const emailPass = defineSecret("EMAIL_PASS");

// Text-to-Speech Client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Pricing Configuration (Keep in sync with frontend)
const COURSE_PRICES = {
    "wisdom_untethered": 9,
    "all_access": 199.99,
};

const COURSE_PRICES_INR = {
    "wisdom_untethered": 799,
    "all_access": 14999,
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
            receipt: `receipt_${courseId}_${Date.now()}`,
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

        await userRef.set({
            purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

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
 * Helper to get nodemailer transporter
 */
const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
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

/**
 * Scheduled Reminder: India Evening (8:00 PM IST)
 */
exports.sendDailyReminderIN = onSchedule({
    schedule: "0 20 * * *",
    secrets: [emailUser, emailPass, geminiKey],
    timeZone: "Asia/Kolkata"
}, async (event) => {
    return runReminderLogic('IN', geminiKey.value());
});

/**
 * Scheduled Reminder: US Evening (8:00 PM EST)
 */
exports.sendDailyReminderUS = onSchedule({
    schedule: "0 20 * * *",
    secrets: [emailUser, emailPass, geminiKey],
    timeZone: "America/New_York"
}, async (event) => {
    return runReminderLogic('US', geminiKey.value());
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
              "headline": "A short poetic headline (max 5 words)",
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

async function runReminderLogic(region, apiKey) {
    const today = new Date().toISOString().split('T')[0];
    const usersSnap = await db.collection("users").get();
    const transporter = getTransporter();

    const daily = await getDailyEmailContent(apiKey);

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
    <div style="display:none;font-size:1px;color:#f0ece4;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
        \${daily.headline} - The day is winding down. Return to the seat of the Watcher.
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ece4;">
        <tr>
            <td align="center" style="padding:24px 16px;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FDFAF4;border:1px solid #E6C57D;">
                    <tr><td style="background:#B8973A;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    <tr>
                        <td style="padding:32px 40px 20px;text-align:center;">
                            <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#B8973A;margin:0 0 16px;">Awakened Path &middot; Evening Practice</p>
                            <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:300;font-style:italic;color:#1C1814;margin:0;line-height:1.3;">\${daily.headline}</h1>
                            <div style="width:40px;height:1px;background:#B8973A;margin:16px auto;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 40px 24px;">
                            <p style="font-family:Georgia,serif;font-size:15px;line-height:1.75;color:#3A342C;margin:0 0 20px;">The day is winding down. Before the mind begins its final preparations for rest — return to the seat of the Watcher.</p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                                <tr>
                                    <td width="3" style="background:#E6C57D;font-size:0;">&nbsp;</td>
                                    <td style="padding:12px 0 12px 20px;">
                                        <p style="font-family:Georgia,serif;font-size:16px;font-style:italic;color:#5C544E;margin:0;line-height:1.6;">"\${daily.quote}"</p>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-family:Georgia,serif;font-size:15px;line-height:1.75;color:#3A342C;margin:0;">\${daily.explanation}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 40px 28px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5EDD8;border:1px solid #E0D0A8;">
                                <tr>
                                    <td style="padding:20px 24px;">
                                        <p style="font-family:Georgia,serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#B8973A;margin:0 0 10px;">Tonight's Practice</p>
                                        <p style="font-family:Georgia,serif;font-size:14px;line-height:1.75;color:#3A342C;margin:0;">\${daily.practice}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 40px 36px;text-align:center;">
                            <a href="https://awakened-path-2026.web.app" style="display:inline-block;padding:13px 32px;background:#1C1814;color:#E6C57D;text-decoration:none;font-family:Georgia,serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;">Record Your Journey &rarr;</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#F5EDD8;padding:24px 40px;border-top:1px solid #E0D0A8;text-align:center;">
                            <p style="font-family:Georgia,serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8B7A5E;margin:0 0 10px;">Journey Shared by Soulful Intelligence Studio</p>
                            <p style="font-family:Georgia,serif;font-size:11px;color:#B0A090;margin:0 0 12px;line-height:1.6;">
                                Explore: <a href="https://www.youtube.com/@SoulfulIntelligenceStudio" style="color:#B8973A;text-decoration:none;">YouTube Channel</a> &middot; <a href="https://www.skrmblissai.in/twinsouls" style="color:#B8973A;text-decoration:none;">Twin Souls</a>
                            </p>
                            <div style="background:#E0D0A8;height:1px;width:30px;margin:12px auto;"></div>
                            <p style="font-family:Georgia,serif;font-size:10px;color:#8B7A5E;margin:0;line-height:1.6;">
                                WhatsApp: <a href="https://wa.me/918217581238" style="color:#3A342C;text-decoration:none;">+91-8217581238</a> &middot; Email: <a href="mailto:connect@skrmblissai.in" style="color:#3A342C;text-decoration:none;">connect@skrmblissai.in</a>
                            </p>
                            <p style="font-family:Georgia,serif;font-size:10px;color:#B0A090;margin:20px 0 0;line-height:1.6;opacity:0.6;">
                                You received this because you are walking the Awakened Path.<br>
                                <a href="https://awakened-path-2026.web.app/api/unsubscribe?userId={{USER_ID}}" style="color:#B8973A;text-decoration:none;">Unsubscribe</a> &middot; <a href="#" style="color:#B8973A;text-decoration:none;">Peace is the way.</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;


    for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (!userData.email || userData.notificationsEnabled === false) continue;

        // Check if user has already practiced today
        const practiceSnap = await userDoc.ref.collection("dailyPractices").doc(today).get();
        if (!practiceSnap.exists() || !practiceSnap.data().completed) {
            console.log(`Sending reminder to ${userData.email}`);
            
            // Personalize unsubscribe link
            const personalizedHtml = emailTemplate.replace('{{USER_ID}}', userDoc.id);

            await transporter.sendMail({
                from: '"The Awakened Path" <connect@skrmblissai.in>',
                to: userData.email,
                subject: "🌙 An Invitation to Return to Source",
                html: personalizedHtml
            });
        }
    }
}

/**
 * Unsubscribe Handler
 */
exports.unsubscribe = onRequest({ cors: true }, async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).send("Invalid request.");

    try {
        await db.collection("users").doc(userId).set({
            notificationsEnabled: false
        }, { merge: true });
        
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

    const updateTemplate = `
        <div style="font-family: 'Georgia', serif; padding: 40px; background: #0C0910; color: #FDFAF4; border: 1px solid rgba(184,151,58,0.2);">
            <div style="text-align: center; margin-bottom: 30px;">
                <span style="font-size: 0.7rem; letter-spacing: 4px; uppercase; opacity: 0.6;">COURSE UPDATE</span>
                <h1 style="color: #E6C57D; margin-top: 10px;">The Journey Continues.</h1>
            </div>
            <p>New guidance has been added: <strong>${chapterTitle}</strong></p>
            <p>${chapterSubtitle}</p>
            <div style="text-align: center; margin-top: 40px;">
                <a href="https://awakened-path-2026.web.app/courses/wisdom-untethered" style="display: inline-block; padding: 15px 40px; background: #E6C57D; color: #1C1814; text-decoration: none; font-size: 14px; letter-spacing: 2px; font-weight: bold;">Watch the Lesson →</a>
            </div>
        </div>
    `;

    for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (!userData.email) continue;
        
        await transporter.sendMail({
            from: '"The Awakened Path" <connect@skrmblissai.in>',
            to: userData.email,
            subject: `✨ New Guidance Added: ${chapterTitle}`,
            html: updateTemplate
        });
    }

    return { success: true, count: usersSnap.size };
});

