import { StripeProvider } from "@stripe/stripe-react-native";
import React from "react";

/**
 * `@stripe/stripe-react-native` only declares support for ios/android
 * (its native specs statically import `codegenNativeComponent`, which
 * breaks Metro's web bundler). This wrapper keeps that import out of the
 * web bundle — see AppStripeProvider.web.tsx for the web counterpart.
 */
export function AppStripeProvider({
  publishableKey,
  children,
}: {
  publishableKey: string;
  children: React.ReactNode;
}) {
  return (
    <StripeProvider publishableKey={publishableKey}>
      {children as React.ReactElement}
    </StripeProvider>
  );
}
