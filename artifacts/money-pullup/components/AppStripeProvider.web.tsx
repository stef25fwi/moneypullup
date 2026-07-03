import React from "react";

/** Web has no `@stripe/stripe-react-native` support; render children untouched. */
export function AppStripeProvider({ children }: { publishableKey: string; children: React.ReactNode }) {
  return <>{children}</>;
}
