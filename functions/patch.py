import re
import sys

def patch():
    with open('index.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add functionsV1 require
    if 'firebase-functions/v1' not in content:
        content = content.replace(
            'const { onSchedule } = require("firebase-functions/v2/scheduler");',
            'const { onSchedule } = require("firebase-functions/v2/scheduler");\nconst functionsV1 = require("firebase-functions/v1");'
        )

    # 2. Patch verifyRazorpayPayment
    verify_target = """        // Ensure the paid order was indeed for this user and this course
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

        await userRef.set(updateData, { merge: true });"""
    
    verify_replacement = """        // Ensure the paid order was indeed for this user and this course
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
        } else {
            const userRef = db.collection("users").doc(userId);
            
            // Fetch user to get email for welcome notification
            const userDoc = await userRef.get();
            userEmail = userDoc.exists ? userDoc.data().email : null;

            const updateData = {
                purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            
            // If it's a soundscape track, also add to ownedTracks
            if (COURSE_PRICES[courseId] && courseId !== 'wisdom_untethered' && courseId !== 'all_access') {
                updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(courseId);
            }

            await userRef.set(updateData, { merge: true });
        }"""
    
    if verify_target in content:
        content = content.replace(verify_target, verify_replacement)
        print("Patched verifyRazorpayPayment")
    else:
        print("verify_target not found")

    # 3. Patch razorpayWebhook
    webhook_target = """        if (userId && courseId) {
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
        }"""
    
    webhook_replacement = """        if (userId && courseId) {
            // Grant access if not already granted
            if (userId === 'guest_pending' || userId.startsWith('guest_')) {
                const customerEmail = payment.email;
                if (customerEmail) {
                    const guestRef = db.collection("guestPurchases").doc(customerEmail);
                    await guestRef.set({
                        purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
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

            await db.collection("transactions").doc(payment.id).set({
                userId,
                courseId,
                razorpayOrderId: payment.order_id,
                razorpayPaymentId: payment.id,
                amount: payment.amount / 100,
                status: "SUCCESS_WEBHOOK",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }"""

    if webhook_target in content:
        content = content.replace(webhook_target, webhook_replacement)
        print("Patched razorpayWebhook")
    else:
        print("webhook_target not found")

    # 4. Append onUserCreated
    trigger_code = """
/**
 * Automatically link guest purchases to new accounts based on email address.
 */
exports.onUserCreated = functionsV1.auth.user().onCreate(async (user) => {
    if (!user.email) return;

    const guestRef = db.collection('guestPurchases').doc(user.email);
    const guestDoc = await guestRef.get();

    if (guestDoc.exists) {
        const guestData = guestDoc.data();
        const userRef = db.collection('users').doc(user.uid);
        
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (guestData.purchasedCourses && guestData.purchasedCourses.length > 0) {
            updateData.purchasedCourses = admin.firestore.FieldValue.arrayUnion(...guestData.purchasedCourses);
        }
        
        if (guestData.ownedTracks && guestData.ownedTracks.length > 0) {
            updateData.ownedTracks = admin.firestore.FieldValue.arrayUnion(...guestData.ownedTracks);
        }

        if (Object.keys(updateData).length > 1) { // more than just updatedAt
            await userRef.set(updateData, { merge: true });
            console.log(`Linked guest purchases to new user ${user.uid} (${user.email})`);
        }
    }
});
"""
    if "exports.onUserCreated" not in content:
        content += trigger_code
        print("Appended onUserCreated")
    else:
        print("onUserCreated already exists")

    with open('index.js', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    patch()
