import React from 'react';
import { StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native';

type Props = {
  children: React.ReactNode;
  [key: string]: unknown;
};

export function AppStripeProvider({ children, ...props }: Props) {
  return <NativeStripeProvider {...(props as any)}>{children}</NativeStripeProvider>;
}

export default AppStripeProvider;
