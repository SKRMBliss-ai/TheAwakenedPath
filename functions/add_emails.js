const admin = require('firebase-admin');

admin.initializeApp({
  projectId: "mind-gym-2026"
});

const db = admin.firestore();

const emails = [
"dc1975dc4@aol.com", "idigesh@gmail.com", "bodyworker100@gmail.com", "kkoob56@aol.com", "gavrilov.lina@gmail.com", "khaledhasizur@gmail.com", "manjeetsahu@gmail.com", "tbxllm@gmail.com", "bgrealestatemiami@gmail.com", "lucindaluna@ymail.com", "ksjyothi208@gmail.com", "ssroy617@gmail.com", "sbekarnataka@gmail.com", "getkrish83@gmail.com", "csridhar66@gmail.com", "ivory94@hotmail.it", "williamhbp@gmail.com", "tramanathan87@gmail.com", "vaishnavirajamanickam20@gmail.com", "akpoga4matic@gmail.com", "vophuongjeff@gmail.com", "sonamiota@gmail.com", "renegv6240@gmail.com", "francisl82@live.ca", "allblackdre@gmail.com", "norahtonk1611@gmail.com",
"awelltendedmind@yahoo.com", "serendipity0609.hbn@gmail.com", "chandragowd1990@gmail.com", "reemg25@gmail.com", "s.apostles@gmail.com", "floriana.romagnolli@gmail.com", "maddiemorfin7@gmail.com", "drsurekha710@gmail.com", "meenabhojwani@gmail.com", "nairinicolenerkizian@yahoo.com", "alvarovegalopez902@gmail.com", "leeeetfong@gmail.com", "micahannsullivan@gmail.com", "wayne_yoder@msn.com", "alexspruijt1988@gmail.com", "gaubriella94@gmail.com", "cosentino_s@yahoo.com", "allam.yagan@gmail.com", "017gma@gmail.com", "rociteba@gmail.com", "charlemagne.sabrina@gmail.com", "shamimmohammed305@gmail.com", "stargazer99999@gmail.com", "shuklajay4@rediffmail.com", "catcitycat@yahoo.com", "kelleymmiller3@gmail.com", "duygusaglam87@hotmail.com", "pkoneru14@gmail.com", "kcshreem8@gmail.com", "rakeshtalapaka522@gmail.com", "aishwarya.gj@gmail.com", "pinkymgidwani@gmail.com", "odenisteward@gmail.com", "nivalev@012.net.il", "acero0977@gmail.com", "wealthisrael12@gmail.com", "yrvadacoot@hotmail.com", "vijeta.ralhan@gmail.com", "padron73@hotmail.com", "janiharipriya@gmail.com", "kusumavenkatesh@gmail.com", "rajeshwarinesargi25@gmail.com"
];

async function add() {
    let count = 0;
    for (const email of emails) {
        const emailTrimmed = email.trim().toLowerCase();
        const query = await db.collection("users").where("email", "==", emailTrimmed).get();
        if (query.empty) {
            await db.collection("users").add({ email: emailTrimmed, subscribedAt: admin.firestore.FieldValue.serverTimestamp(), source: 'manual_admin_add' });
            console.log("Added", emailTrimmed);
            count++;
        } else {
            console.log("Skipping", emailTrimmed, "already exists");
        }
    }
    console.log("Total added:", count);
}

add().catch(console.error);
