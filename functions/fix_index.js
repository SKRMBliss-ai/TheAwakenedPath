const fs = require('fs');
let content = fs.readFileSync('index.js', 'utf8');

const oldStr = `        // 3. Grant Access in Firestore
        let userEmail = null;
            };
            if (COURSE_PRICES[courseId] && courseId !== 'wisdom_untethered' && courseId !== 'all_access') {
                updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(courseId);
            }
            await guestRef.set(updateData, { merge: true });
        } else {`;

const newStr = `        // Ensure the paid order was indeed for this user and this course
        // (Bypass userId check if they are guest_pending)
        if ((rzpOrder.notes.userId !== userId && userId !== 'guest_pending') || rzpOrder.notes.courseId !== courseId) {
            return res.status(400).send("Order data mismatch. Discrepancy detected.");
        }

        // 3. Grant Access in Firestore
        let userEmail = null;
        if (userId === 'guest_pending' || userId.startsWith('guest_')) {
            const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
            userEmail = rzpPayment.email;
            
            if (userEmail) {
                const guestRef = db.collection("guestPurchases").doc(userEmail);
                const updateData = {
                    purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };
                if (COURSE_PRICES[courseId] && courseId !== 'wisdom_untethered' && courseId !== 'all_access') {
                    updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(courseId);
                }
                await guestRef.set(updateData, { merge: true });
            }
        } else {`;

if (content.includes(oldStr)) {
    fs.writeFileSync('index.js', content.replace(oldStr, newStr));
    console.log('Replaced successfully');
} else {
    console.log('String not found');
}
