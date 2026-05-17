const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'awakened-path-2026' });
const db = admin.firestore();

async function getStats() {
    const blastsSnap = await db.collection('email_blasts').orderBy('sentAt', 'desc').get();
    let totalSent = 0, blastCount = 0;
    blastsSnap.docs.forEach(d => {
        const data = d.data();
        totalSent += (data.totalRecipients || 0);
        blastCount++;
    });

    const logsSnap = await db.collection('activity_logs').get();
    const logs = logsSnap.docs.map(d => d.data());

    const emailOpens  = logs.filter(l => l.activityType === 'EMAIL_OPEN').length;
    const ytClicks    = logs.filter(l => l.activityType === 'EMAIL_YOUTUBE_CLICK').length;
    const ctaClicks   = logs.filter(l => l.activityType === 'EMAIL_CTA_CLICK').length;
    const aboutClicks = logs.filter(l => l.activityType === 'EMAIL_CTA_CLICK' &&
        JSON.stringify(l).toLowerCase().includes('aboutawakened')).length;

    const openerEmails = new Set(
        logs.filter(l => l.activityType === 'EMAIL_OPEN')
            .map(l => (l.userEmail || '').toLowerCase()).filter(Boolean)
    );
    const clickerEmails = new Set(
        logs.filter(l => ['EMAIL_YOUTUBE_CLICK','EMAIL_CTA_CLICK'].includes(l.activityType))
            .map(l => (l.userEmail || '').toLowerCase()).filter(Boolean)
    );
    const openedOnly = [...openerEmails].filter(e => !clickerEmails.has(e)).length;

    // Per-user breakdown of openers
    const perUser = {};
    logs.forEach(l => {
        const e = (l.userEmail || '').toLowerCase();
        if (!e || e === 'anonymous') return;
        if (!perUser[e]) perUser[e] = { opens: 0, ytClicks: 0, ctaClicks: 0, about: 0 };
        if (l.activityType === 'EMAIL_OPEN') perUser[e].opens++;
        if (l.activityType === 'EMAIL_YOUTUBE_CLICK') perUser[e].ytClicks++;
        if (l.activityType === 'EMAIL_CTA_CLICK') {
            perUser[e].ctaClicks++;
            if (JSON.stringify(l).toLowerCase().includes('aboutawakened')) perUser[e].about++;
        }
    });

    console.log('\n📊  INNER SPACE — EMAIL ENGAGEMENT STATS\n' + '═'.repeat(50));
    console.log(`📬  Blast runs logged:              ${blastCount}`);
    console.log(`📧  Total emails sent:              ${totalSent}`);
    console.log(`👁   Total open events:              ${emailOpens}`);
    console.log(`👥  Unique openers:                 ${openerEmails.size}`);
    console.log(`🔴  YouTube link clicks:            ${ytClicks}`);
    console.log(`🟡  App link clicks (/awakenedpath):${ctaClicks}`);
    console.log(`🟢  /aboutawakenedpath clicks:      ${aboutClicks}`);
    console.log(`😴  Opened — no click (unique):     ${openedOnly}`);
    if (totalSent > 0 && openerEmails.size > 0) {
        console.log('─'.repeat(50));
        console.log(`📈  Open rate:   ${((openerEmails.size/totalSent)*100).toFixed(1)}%`);
        console.log(`📈  Click rate:  ${((clickerEmails.size/openerEmails.size)*100).toFixed(1)}% of openers`);
    }
    console.log('\n👤  PER-USER BREAKDOWN:\n' + '─'.repeat(50));
    Object.entries(perUser).sort((a,b)=>b[1].opens-a[1].opens).forEach(([email, s]) => {
        const tags = [];
        if (s.ytClicks) tags.push(`YT:${s.ytClicks}`);
        if (s.ctaClicks) tags.push(`CTA:${s.ctaClicks}`);
        if (s.about) tags.push(`About:${s.about}`);
        console.log(`  ${email.padEnd(34)} opens:${s.opens}  ${tags.join('  ') || '(no clicks)'}`);
    });
    console.log('═'.repeat(50));
}

getStats().catch(console.error);
