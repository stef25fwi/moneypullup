import { useCallback } from "react";

export type TipOutcome = "authorized" | "cancelled";

/** `@stripe/stripe-react-native` has no web build; tipping isn't available in the web preview. */
export function useTipCheckout() {
  return useCallback(async (): Promise<TipOutcome> => {
    throw new Error("Le paiement n'est pas disponible sur le web. Utilisez l'application mobile.");
  }, []);
}
