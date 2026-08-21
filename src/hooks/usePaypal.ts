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

// Cached across mounts: whether the PayPal backend answered at all. Without
// this, every keystroke that re-runs renderCheckout re-fetches the same failing
// endpoint.
let configPromise: Promise<{ clientId?: string } | null> | null = null;

function fetchPaypalConfig(): Promise<{ clientId?: string } | null> {
    if (configPromise) return configPromise;
    configPromise = fetch('/api/paypal-config')
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);
    return configPromise;
}

let lastToastMs = 0;
function showDeduplicatedToast(msg: string, type: 'error' | 'success' = 'error') {
    const now = Date.now();
    if (now - lastToastMs < 2500) return;
    lastToastMs = now;
    showToast(msg, { type });
}

export const usePaypal = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    // null = not checked yet, false = backend unavailable (functions not
    // deployed, or PAYPAL_CLIENT_ID unset). The caller hides the PayPal UI on
    // false so buyers see only working options rather than a dead button.
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

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
            const config = await fetchPaypalConfig();
            const clientId = config?.clientId;
            if (!clientId) {
                setIsAvailable(false);
                return;
            }
            setIsAvailable(true);

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
                        if (!res.ok) {
                            let errMessage = 'Failed to create order';
                            try {
                                const errJson = await res.json();
                                if (errJson.error === 'PAYEE_ACCOUNT_RESTRICTED') {
                                    errMessage = 'PayPal is temporarily unavailable for this merchant. Please use "Pay by Card" below.';
                                } else if (errJson.message) {
                                    errMessage = errJson.message;
                                }
                            } catch (_) {
                                const text = await res.text().catch(() => '');
                                if (text) errMessage = text;
                            }
                            showDeduplicatedToast(errMessage, 'error');
                            throw new Error(errMessage);
                        }
                        const order = await res.json();
                        return order.id;
                    } catch (err) {
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
                            showDeduplicatedToast('Payment verification failed. Please try again or contact support.', 'error');
                            return;
                        }
                        const verification = await verifyRes.json();
                        if (verification.success) {
                            showDeduplicatedToast('Payment confirmed — unlocking your access.', 'success');
                            onSuccess();
                        } else {
                            showDeduplicatedToast('Payment verification failed. Please contact support.', 'error');
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
                    showDeduplicatedToast('PayPal is temporarily unavailable for this merchant. Please use "Pay by Card" below.', 'error');
                    setIsProcessing(false);
                },
            }).render(`#${containerId}`);
        } catch (error) {
            // Reached only once PayPal IS configured — i.e. the SDK failed to
            // load or Buttons failed to render. Hide the dead button rather than
            // leaving one that cannot be clicked to completion; the buyer still
            // has the card option in the same form.
            console.error('PayPal Error:', error);
            setIsAvailable(false);
            setIsProcessing(false);
        }
    };

    return { renderCheckout, isProcessing, isAvailable };
};
