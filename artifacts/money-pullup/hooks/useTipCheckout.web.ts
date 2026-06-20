import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

function showWebStripeUnavailable() {
  const title = 'Paiement indisponible sur aperçu web';
  const message =
    "Le paiement Stripe natif fonctionne sur Android/iOS. Sur l'aperçu web Codespaces, le module @stripe/stripe-react-native est désactivé pour permettre à l'application de démarrer.";

  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

export function useTipCheckout(..._args: any[]): any {
  const [isLoading] = useState(false);

  const unavailable = useCallback(async (..._innerArgs: any[]) => {
    showWebStripeUnavailable();

    return {
      ok: false,
      success: false,
      cancelled: true,
      reason: 'stripe_native_only_on_web',
      message:
        "Paiement Stripe natif désactivé sur web. Tester le paiement réel sur Android/iOS ou development build.",
    };
  }, []);

  return useMemo(
    () =>
      new Proxy(
        {
          isLoading,
          loading: isLoading,
          isProcessing: isLoading,
          processing: isLoading,
          disabled: true,
          isAvailable: false,
          error: null,
          unavailableReason: 'stripe_native_only_on_web',

          checkout: unavailable,
          startCheckout: unavailable,
          startTipCheckout: unavailable,
          sendTip: unavailable,
          createTip: unavailable,
          presentPaymentSheet: unavailable,
          initPaymentSheet: unavailable,
          openPaymentSheet: unavailable,
          reset: () => {},
        },
        {
          get(target, prop) {
            if (prop in target) {
              return target[prop as keyof typeof target];
            }

            if (typeof prop === 'string') {
              return unavailable;
            }

            return undefined;
          },
        },
      ),
    [isLoading, unavailable],
  );
}

export default useTipCheckout;
