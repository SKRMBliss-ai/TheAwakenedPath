import { useState } from 'react';

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
    };
    theme: {
        color: string;
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
        amount: number,
        onSuccess: () => void
    ) => {
        setIsProcessing(true);
        try {
            // 1. Create Order via Firebase Cloud Function (Hosting Rewrite)
            const orderRes = await fetch('/api/razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency: 'USD', courseId, userId })
            });
            
            const order = await orderRes.json();

            const options: RazorpayOptions = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
                amount: order.amount,
                currency: order.currency,
                name: "Awakened Path",
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
                        onSuccess();
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: userName || '',
                    email: userEmail || ''
                },
                theme: {
                    color: "#B8973A"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                console.error("Payment Failed:", response.error);
                alert("Payment cancelled or failed.");
                setIsProcessing(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay Error:", error);
            alert("Could not initialize payment.");
            setIsProcessing(false);
        }
    };

    return { checkOut, isProcessing };
};
