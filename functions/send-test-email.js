/**
 * send-test-email.js
 * Run: node send-test-email.js <EMAIL_PASSWORD>
 */
const nodemailer = require('nodemailer');

const FROM  = 'connect@skrmblissai.in';
const TO    = 'skrmblissai@gmail.com';
const PASS  = process.argv[2];

if (!PASS) {
    console.error('❌ Usage: node send-test-email.js <email_password>');
    process.exit(1);
}

const ARTICLE_URL = 'https://www.skrmblissai.in/guides/how-to-stop-overthinking-at-night';
const VIDEO_URL   = 'https://www.skrmblissai.in/videos/ep1-feelings-and-emotions';

const html = `
<div style="font-family: Georgia, serif; padding: 40px; background: #0C0910; color: #FDFAF4; border: 1px solid rgba(184,151,58,0.2); max-width: 520px; margin: auto; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #E6C57D; opacity: 0.85;">✅ Test Email — Daily Presence Guide</span>
        <h1 style="color: #E6C57D; margin-top: 10px; font-weight: 400; font-size: 24px;">How to Stop Overthinking at Night</h1>
    </div>

    <p style="font-size: 14.5px; line-height: 1.65; color: #E0D6C3; margin-bottom: 28px;">
        Discover 4 somatic steps to quiet your mind and return to rest — even when thoughts feel relentless. This is your daily article guide from Mind Gym.
    </p>

    <!-- READ DAILY ARTICLE BUTTON -->
    <div style="text-align: center; margin: 24px 0 28px;">
        <a href="${ARTICLE_URL}" style="display: inline-block; padding: 14px 36px; background: #E6C57D; color: #1C1814; text-decoration: none; font-size: 14px; letter-spacing: 1px; font-weight: bold; border-radius: 999px;">
            Read Today's Article Guide →
        </a>
    </div>

    <!-- 60-SECOND VIDEO TEASER -->
    <div style="padding: 20px; background: rgba(230,197,125,0.08); border-radius: 14px; border: 1px solid rgba(230,197,125,0.2); text-align: center;">
        <p style="font-size: 10.5px; letter-spacing: 2px; text-transform: uppercase; color: #E6C57D; margin: 0 0 6px; font-weight: bold;">🎬 60-Second Masterclass Teaser</p>
        <p style="font-size: 13px; color: #FDFAF4; margin: 0 0 14px;">Episode 1: "Feelings vs Emotions: How We Learned to Hide Our Feelings"</p>
        <a href="${VIDEO_URL}" style="display: inline-block; padding: 10px 24px; background: transparent; border: 1px solid #E6C57D; color: #E6C57D; text-decoration: none; font-size: 12px; font-weight: bold; border-radius: 999px;">
            Watch 60s Teaser 🍿
        </a>
    </div>

    <p style="text-align: center; margin-top: 28px; font-size: 11px; color: rgba(253,250,244,0.4);">
        This is a test email from Mind Gym Admin. All links are live and tracked.
    </p>
</div>
`;

async function main() {
    const transporter = nodemailer.createTransport({
        host: 'smtpout.secureserver.net',
        port: 465,
        secure: true,
        auth: { user: FROM, pass: PASS }
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP connected');

        const info = await transporter.sendMail({
            from: `"Mind Gym" <${FROM}>`,
            to: TO,
            subject: '🧪 Test — Daily Presence Guide: How to Stop Overthinking at Night',
            html
        });

        console.log('✅ Email sent! Message ID:', info.messageId);
    } catch (err) {
        console.error('❌ Failed:', err.message);
    }
}

main();
