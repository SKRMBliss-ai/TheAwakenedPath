const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'awakened-path-2026' });
const db = admin.firestore();

const BLOCKED = [
    'simkatyal1@gmail.com','smriti.duggal@gmail.com','jetski@test.com',
    'shrutikhungar@gmail.com','testuser@example.com','test@example.com',
    'echarttolleteachings@gmail.com','russel.brownlee@gmail.com',
    'sup.trezor.io@gmail.com','brjdjej@aol.com'
];

async function run() {
    const usersSnap = await db.collection('users').get();
    const waitlistSnap = await db.collection('waitlist').get();

    // Active app subscribers
    const active = [], blocked = [], disabled = [];
    usersSnap.docs.forEach(d => {
        const u = d.data();
        if (!u.email) return;
        if (BLOCKED.includes(u.email.toLowerCase())) { blocked.push(u.email); return; }
        if (u.notificationsEnabled === false) { disabled.push(u.email); return; }
        active.push({ email: u.email, plan: u.planType || 'free', tz: u.timezone || 'Asia/Kolkata' });
    });

    // Waitlist (journal download leads)
    const waitlistEmails = new Set();
    waitlistSnap.docs.forEach(d => { if (d.data().email) waitlistEmails.add(d.data().email.toLowerCase()); });
    // Remove already in active list
    const activeEmails = new Set(active.map(u => u.email.toLowerCase()));
    const waitlistOnly = [...waitlistEmails].filter(e => !activeEmails.has(e));

    console.log('\n📧  MIND GYM — EMAIL LIST\n' + '═'.repeat(55));
    console.log(`\n✅  ACTIVE (receive daily email): ${active.length}`);
    active.sort((a,b) => a.email.localeCompare(b.email)).forEach(u =>
        console.log(`    ${u.email.padEnd(38)} [${u.plan}] ${u.tz !== 'Asia/Kolkata' ? '🌍' : '🇮🇳'}`)
    );

    console.log(`\n🔕  UNSUBSCRIBED / DISABLED: ${disabled.length}`);
    disabled.forEach(e => console.log(`    ${e}`));

    console.log(`\n🚫  BLOCKED (test/internal): ${blocked.length}`);
    blocked.forEach(e => console.log(`    ${e}`));

    console.log(`\n📋  WAITLIST (journal leads, not yet app users): ${waitlistOnly.length}`);
    waitlistOnly.slice(0,30).forEach(e => console.log(`    ${e}`));
    if (waitlistOnly.length > 30) console.log(`    ... and ${waitlistOnly.length - 30} more`);

    console.log('\n' + '═'.repeat(55));
    console.log(`TOTAL reach: ${active.length} active + ${waitlistOnly.length} waitlist = ${active.length + waitlistOnly.length}`);
}
run().catch(console.error);
