import { useState } from 'react';
import { showToast } from '../lib/toast';

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: any) => void;
    prefill: {
        name: string;
        email: string;
        contact?: string;
    };
    theme: {
        color: string;
    };
    modal?: {
        ondismiss: () => void;
    };
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const useRazorpay = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const checkOut = async (
        userId: string,
        userEmail: string,
        userName: string,
        courseId: string,
        currency: string = "USD",
        onSuccess: () => void,
        userPhone?: string,
        // Pay-what-you-want amount, in `currency` major units (e.g. 240 for ₹240).
        // Only meaningful for PWYW products (course/membership); the backend
        // ignores it — and clamps it to a floor — for anything else.
        amount?: number
    ) => {
        setIsProcessing(true);
        try {
            // 1. Create Order via Firebase Cloud Function (Hosting Rewrite)
            const orderRes = await fetch('/api/razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Pass the captured guest email/phone so the backend stores them in
                // the order notes — reliable delivery even if the buyer skips the
                // email field inside the Razorpay widget (e.g. UPI-only).
                body: JSON.stringify({
                    courseId, userId, currency,
                    guestEmail: userEmail || '', guestPhone: userPhone || '',
                    ...(amount != null ? { amount } : {}),
                })
            });

            if (!orderRes.ok) {
                const errorText = await orderRes.text();
                throw new Error(errorText || "Failed to create order");
            }
            
            const order = await orderRes.json();

            const options: RazorpayOptions = {
                // Publishable key comes from the backend (Secret Manager) via the
                // order response — no build-time .env / VITE_ var needed.
                key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
                amount: order.amount,
                currency: order.currency,
                name: "Mind Gym",
                description: `Unlock ${courseId}`,
                order_id: order.id,
                handler: async (response: any) => {
                    // 2. Verify Payment via Firebase Cloud Function (Hosting Rewrite)
                    const verifyRes = await fetch('/api/razorpay-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            userId,
                            courseId
                        })
                    });

                    const verification = await verifyRes.json();
                    if (verification.success) {
                        showToast('Payment confirmed — unlocking your access.', { type: 'success' });
                        onSuccess();
                    } else {
                        showToast('Payment verification failed. Please contact support.', { type: 'error' });
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: userName || '',
                    email: userEmail || '',
                    contact: userPhone || ''
                },
                theme: {
                    color: "#7A5F44"
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                console.error("Payment Failed:", response.error);
                showToast('Payment could not be completed. Please try again.', { type: 'error' });
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay Error:", error);
            showToast('Could not start payment. Please try again.', { type: 'error' });
            setIsProcessing(false);
        }
    };

    const subscribe = async (
        userId: string,
        userEmail: string,
        userName: string,
        planId: string = "premium_monthly",
        currency: string = "USD",
        onSuccess: () => void
    ) => {
        setIsProcessing(true);
        try {
            // 1. Create Subscription via Firebase Cloud Function
            const subRes = await fetch('/api/razorpay-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, planId, currency })
            });

            if (!subRes.ok) {
                const errorText = await subRes.text();
                throw new Error(errorText || "Failed to create subscription");
            }

            const subscription = await subRes.json();

            const options: any = {
                // Publishable key from the backend (Secret Manager) — see checkOut.
                key: subscription.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || '',
                subscription_id: subscription.id,
                name: "Mind Gym",
                description: planId.includes('yearly') ? "Annual Premium Access" : "Monthly Premium Access",
                handler: async (response: any) => {
                    // 2. Verify Subscription via Firebase Cloud Function
                    const verifyRes = await fetch('/api/razorpay-subscription-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            userId
                        })
                    });

                    const verification = await verifyRes.json();
                    if (verification.success) {
                        showToast('Subscription active — welcome to premium.', { type: 'success' });
                        onSuccess();
                    } else {
                        showToast('Subscription verification failed. Please contact support.', { type: 'error' });
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: userName || '',
                    email: userEmail || ''
                },
                theme: {
                    color: "#7A5F44"
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                console.error("Subscription Payment Failed:", response.error);
                showToast('Subscription payment could not be completed. Please try again.', { type: 'error' });
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay Subscription Error:", error);
            showToast('Could not start subscription. Please try again.', { type: 'error' });
            setIsProcessing(false);
        }
    };

    return { checkOut, subscribe, isProcessing };
};
