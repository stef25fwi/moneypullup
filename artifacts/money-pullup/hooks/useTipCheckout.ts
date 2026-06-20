import { useCallback } from "react";
import { useStripe } from "@stripe/stripe-react-native";

import { createTipPaymentIntent } from "@/lib/tipFunctions";

export type TipOutcome = "authorized" | "cancelled";

/**
 * Fan-side manual-capture flow: ask the backend for a PaymentIntent, then
 * confirm it with the Stripe Payment Sheet. On success the funds are
 * authorised (held) until the DJ accepts/refuses.
 */
export function useTipCheckout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  return useCallback(
    async (djId: string, amountEuros: number, message: string): Promise<TipOutcome> => {
      const intent = await createTipPaymentIntent({
        djId,
        amountCents: Math.round(amountEuros * 100),
        message,
      });

      const init = await initPaymentSheet({
        paymentIntentClientSecret: intent.clientSecret,
        merchantDisplayName: "Money Pull Up",
      });
      if (init.error) throw new Error(init.error.message);

      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code === "Canceled") return "cancelled";
        throw new Error(result.error.message);
      }
      return "authorized";
    },
    [initPaymentSheet, presentPaymentSheet],
  );
}
