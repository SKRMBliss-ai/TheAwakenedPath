import { useState } from 'react';
import { showToast } from '../lib/toast';

declare global {
    interface Window {
        paypal: any;
    }
}

// Module-level cache so the SDK script is only ever injected once per client
// id, no matter how many times a component mounts/unmounts around checkout.
let sdkLoad: Promise<void> | null = null;
let loadedClientId: string | null = null;

function loadPaypalSdk(clientId: string, currency: string): Promise<void> {
    if (sdkLoad && loadedClientId === clientId) return sdkLoad;
    loadedClientId = clientId;
    sdkLoad = new Promise((resolve, reject) => {
        // A stale script for a different currency/client-id would silently
        // misprice buttons, so remove it before re-adding rather than trust a
        // second <script> tag to override the first.
        document.querySelectorAll('script[data-paypal-sdk]').forEach((el) => el.remove());
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&components=buttons,applepay&intent=capture`;
        script.dataset.paypalSdk = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
        document.head.appendChild(script);
    });
    return sdkLoad;
}

export const usePaypal = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Renders PayPal's Buttons (which include Apple Pay on supporting
     * Safari/iOS sessions — PayPal exposes it as a payment method inside the
     * same Buttons component, not a separate button) into `containerId`.
     * Mirrors useRazorpay's checkOut: same order-create → verify → onSuccess
     * shape, just via PayPal's SDK instead of a modal Razorpay owns.
     */
    const renderCheckout = async (
        containerId: string,
        userId: string,
        userEmail: string,
        courseId: string,
        currency: string,
        onSuccess: () => void,
        userPhone?: string,
        amount?: number
    ) => {
        try {
            const configRes = await fetch('/api/paypal-config');
            if (!configRes.ok) throw new Error('Failed to load PayPal config');
            const { clientId } = await configRes.json();
            if (!clientId) throw new Error('PayPal is not configured');

            await loadPaypalSdk(clientId, currency);

            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            window.paypal.Buttons({
                createOrder: async () => {
                    setIsProcessing(true);
                    try {
                        const res = await fetch('/api/paypal-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                courseId, userId, currency,
                                guestEmail: userEmail || '', guestPhone: userPhone || '',
                                ...(amount != null ? { amount } : {}),
                            }),
                        });
                        if (!res.ok) throw new Error(await res.text() || 'Failed to create order');
                        const order = await res.json();
                        return order.id;
                    } catch (err) {
                        // onError only fires for a rejection AFTER createOrder resolves
                        // with a valid order id — a throw in here just stalls the
                        // button silently otherwise, so reset here too.
                        setIsProcessing(false);
                        throw err;
                    }
                },
                onApprove: async (data: { orderID: string }) => {
                    try {
                        const verifyRes = await fetch('/api/paypal-verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID }),
                        });
                        if (!verifyRes.ok) {
                            showToast('Payment verification failed. Please try again or contact support.', { type: 'error' });
                            return;
                        }
                        const verification = await verifyRes.json();
                        if (verification.success) {
                            showToast('Payment confirmed — unlocking your access.', { type: 'success' });
                            onSuccess();
                        } else {
                            showToast('Payment verification failed. Please contact support.', { type: 'error' });
                        }
                    } finally {
                        setIsProcessing(false);
                    }
                },
                onCancel: () => {
                    setIsProcessing(false);
                },
                onError: (err: unknown) => {
                    console.error('PayPal Error:', err);
                    showToast('Payment could not be completed. Please try again.', { type: 'error' });
                    setIsProcessing(false);
                },
            }).render(`#${containerId}`);
        } catch (error) {
            console.error('PayPal Error:', error);
            showToast('Could not start PayPal checkout. Please try again.', { type: 'error' });
            setIsProcessing(false);
        }
    };

    return { renderCheckout, isProcessing };
};
