import { useState } from 'react';
import { showToast } from '../lib/toast';

declare global {
    interface Window {
        paypal: any;
        google: any;
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
        // googlepay component added so PayPal can power the Google Pay button
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&components=buttons,applepay,googlepay&intent=capture`;
        script.dataset.paypalSdk = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
        document.head.appendChild(script);
    });
    return sdkLoad;
}

// Separate SDK loader for subscriptions — must use vault=true&intent=subscription.
// Cannot share with the one-time payment SDK because intent is baked into the URL.
let subSdkLoad: Promise<void> | null = null;
let subLoadedClientId: string | null = null;

function loadPaypalSubscriptionSdk(clientId: string): Promise<void> {
    if (subSdkLoad && subLoadedClientId === clientId) return subSdkLoad;
    subLoadedClientId = clientId;
    subSdkLoad = new Promise((resolve, reject) => {
        document.querySelectorAll('script[data-paypal-sub-sdk]').forEach((el) => el.remove());
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription&components=buttons`;
        script.dataset.paypalSubSdk = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PayPal Subscription SDK'));
        document.head.appendChild(script);
    });
    return subSdkLoad;
}

// Load the Google Pay JS library (only once)
let googlePayLoad: Promise<void> | null = null;
function loadGooglePaySdk(): Promise<void> {
    if (googlePayLoad) return googlePayLoad;
    googlePayLoad = new Promise((resolve, reject) => {
        if (window.google?.payments?.api) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Pay SDK'));
        document.head.appendChild(script);
    });
    return googlePayLoad;
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
    const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);

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

    /**
     * Renders a Google Pay button (powered by PayPal's Google Pay component)
     * into `containerId`. Only shows the button if the device/browser supports
     * Google Pay and the user has a payment method saved.
     *
     * Flow: loadSDKs → googlepay.config() → isReadyToPay → createButton
     *       → onClick: createOrder → loadPaymentData → confirmOrder → verify
     */
    const renderGooglePay = async (
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
            if (!clientId) return;

            // Load both SDKs in parallel
            await Promise.all([
                loadPaypalSdk(clientId, currency),
                loadGooglePaySdk(),
            ]);

            // PayPal's Google Pay component may not be available in all regions
            if (!window.paypal?.Googlepay) {
                console.info('PayPal Googlepay component not available');
                return;
            }

            const googlepay = window.paypal.Googlepay();

            // Get PayPal's Google Pay merchant configuration
            const gpConfig = await googlepay.config();

            // Determine environment from client id prefix
            const environment = clientId.startsWith('AZ') ? 'PRODUCTION' : 'TEST';

            // orderId captured between createOrder and confirmOrder callbacks
            let pendingOrderId: string | null = null;

            const onPaymentAuthorized = async (paymentData: any) => {
                try {
                    setIsProcessing(true);
                    if (!pendingOrderId) throw new Error('No pending order');

                    const result = await googlepay.confirmOrder({
                        orderId: pendingOrderId,
                        paymentMethodData: paymentData.paymentMethodData,
                    });

                    if (result?.status !== 'APPROVED') {
                        showDeduplicatedToast('Google Pay payment could not be approved. Please try another method.', 'error');
                        setIsProcessing(false);
                        return { transactionState: 'ERROR' as const };
                    }

                    // Verify on backend
                    const verifyRes = await fetch('/api/paypal-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderID: pendingOrderId }),
                    });
                    const verification = await verifyRes.json();
                    if (verification.success) {
                        showDeduplicatedToast('Payment confirmed — unlocking your access.', 'success');
                        onSuccess();
                        setIsProcessing(false);
                        return { transactionState: 'SUCCESS' as const };
                    } else {
                        showDeduplicatedToast('Payment verification failed. Please contact support.', 'error');
                        setIsProcessing(false);
                        return { transactionState: 'ERROR' as const };
                    }
                } catch (err) {
                    console.error('Google Pay confirm error:', err);
                    setIsProcessing(false);
                    return { transactionState: 'ERROR' as const };
                }
            };

            const paymentsClient = new window.google.payments.api.PaymentsClient({
                environment,
                paymentDataCallbacks: { onPaymentAuthorized },
            });

            // Check if this browser/device can use Google Pay with an existing method
            const { result: isReady } = await paymentsClient.isReadyToPay({
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: gpConfig.allowedPaymentMethods,
                existingPaymentMethodRequired: true,
            });

            if (!isReady) {
                // Device doesn't support Google Pay or user has no saved cards
                setIsGooglePayAvailable(false);
                return;
            }

            setIsGooglePayAvailable(true);

            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            const button = paymentsClient.createButton({
                onClick: async () => {
                    try {
                        setIsProcessing(true);
                        // Create a PayPal order first — same endpoint as the regular flow
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
                            showDeduplicatedToast('Could not start Google Pay. Please try another method.', 'error');
                            setIsProcessing(false);
                            return;
                        }
                        const order = await res.json();
                        pendingOrderId = order.id;

                        // Present Google Pay sheet
                        await paymentsClient.loadPaymentData({
                            apiVersion: 2,
                            apiVersionMinor: 0,
                            allowedPaymentMethods: gpConfig.allowedPaymentMethods,
                            transactionInfo: {
                                totalPriceStatus: 'FINAL',
                                totalPrice: String(amount ?? 2),
                                currencyCode: currency,
                                countryCode: 'US',
                            },
                            merchantInfo: gpConfig.merchantInfo,
                            callbackIntents: ['PAYMENT_AUTHORIZATION'],
                        });
                    } catch (err: any) {
                        // statusCode 'CANCELED' means user dismissed — not an error
                        if (err?.statusCode !== 'CANCELED') {
                            console.error('Google Pay error:', err);
                            showDeduplicatedToast('Google Pay could not complete. Please try another method.', 'error');
                        }
                        setIsProcessing(false);
                    }
                },
                buttonColor: 'black',
                buttonType: 'pay',
                buttonSizeMode: 'fill',
            });

            container.appendChild(button);
        } catch (err) {
            console.error('Google Pay setup error:', err);
            setIsGooglePayAvailable(false);
        }
    };

    /**
     * Renders a PayPal Subscribe button into `containerId`.
     * Uses the vault+subscription SDK (different from the one-time payment SDK).
     * planId: the PayPal Billing Plan ID (P-xxx) for monthly or yearly.
     */
    const renderSubscription = async (
        containerId: string,
        planId: string,
        onSuccess: (subscriptionId: string) => void
    ) => {
        try {
            const config = await fetchPaypalConfig();
            const clientId = config?.clientId;
            if (!clientId) {
                setIsAvailable(false);
                return;
            }
            setIsAvailable(true);

            // Must remove the one-time SDK before loading the subscription SDK
            // because PayPal's SDK validates intent on init.
            document.querySelectorAll('script[data-paypal-sdk]').forEach((el) => el.remove());
            sdkLoad = null; // reset cache so it reloads fresh when switching back

            await loadPaypalSubscriptionSdk(clientId);

            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            window.paypal.Buttons({
                style: {
                    shape: 'rect',
                    color: 'gold',
                    layout: 'vertical',
                    label: 'subscribe',
                },
                createSubscription: (_data: unknown, actions: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    return actions.subscription.create({ plan_id: planId });
                },
                onApprove: async (data: { subscriptionID: string }) => {
                    try {
                        setIsProcessing(true);
                        // Notify our backend to record the subscription
                        const res = await fetch('/api/paypal-subscription-verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subscriptionID: data.subscriptionID, planId }),
                        });
                        if (res.ok) {
                            showDeduplicatedToast('Subscription confirmed — welcome to Mind Gym!', 'success');
                        }
                        onSuccess(data.subscriptionID);
                    } catch (err) {
                        console.error('Subscription verify error:', err);
                        // Even if backend verify fails, PayPal confirmed it — record optimistically
                        onSuccess(data.subscriptionID);
                    } finally {
                        setIsProcessing(false);
                    }
                },
                onCancel: () => { setIsProcessing(false); },
                onError: (err: unknown) => {
                    console.error('PayPal Subscription Error:', err);
                    showDeduplicatedToast('PayPal subscription unavailable. Please try again.', 'error');
                    setIsProcessing(false);
                },
            }).render(`#${containerId}`);
        } catch (error) {
            console.error('PayPal Subscription setup error:', error);
            setIsAvailable(false);
            setIsProcessing(false);
        }
    };

    return { renderCheckout, renderGooglePay, renderSubscription, isProcessing, isAvailable, isGooglePayAvailable };
};
