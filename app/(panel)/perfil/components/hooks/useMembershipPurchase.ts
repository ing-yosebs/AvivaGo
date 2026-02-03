import { useState, useCallback, useEffect } from 'react'
import { recordPaymentConsent } from '@/app/driver/actions'

export const useMembershipPurchase = (onPurchaseSuccess: () => void) => {
    const [purchasing, setPurchasing] = useState(false)
    const [paymentConsent, setPaymentConsent] = useState(false)

    const openStripeCheckout = useCallback((url: string) => {
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            url,
            'StripeCheckout',
            `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
        );

        if (!popup) {
            alert('Por favor habilita las ventanas emergentes para continuar con el pago.');
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.source === 'avivago-payment') {
                if (event.data.status === 'success') {
                    onPurchaseSuccess();
                    // Alert removed for cleaner UX
                } else {
                    alert('El pago fue cancelado o no se pudo procesar.');
                }
                window.removeEventListener('message', handleMessage);
            }
        };

        window.addEventListener('message', handleMessage);

        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                window.removeEventListener('message', handleMessage);
            }
        }, 1000);
    }, [onPurchaseSuccess]);

    const handlePurchase = async () => {
        setPurchasing(true)
        try {
            await recordPaymentConsent('Autorizo a que se me dirija a Stripe para realizar el pago correspondiente.')

            const response = await fetch('/api/checkout', {
                method: 'POST',
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text)
            }

            const { url } = await response.json()

            // Track Facebook Pixel 'InitiateCheckout' event
            if (typeof window.fbq !== 'undefined') {
                window.fbq('track', 'InitiateCheckout', {
                    content_name: 'Membresía Driver AvivaGo',
                    content_category: 'Membership',
                    value: 524,
                    currency: 'MXN'
                });
            }

            openStripeCheckout(url)
        } catch (error: any) {
            alert('Error al procesar el pago: ' + error.message)
            console.error('Purchase error:', error)
        } finally {
            setPurchasing(false)
        }
    }

    return {
        purchasing,
        paymentConsent,
        setPaymentConsent,
        handlePurchase,
        openStripeCheckout
    }
}
