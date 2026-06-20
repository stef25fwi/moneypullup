import React from 'react';

type Props = {
  children: React.ReactNode;
  [key: string]: unknown;
};

export function AppStripeProvider({ children }: Props) {
  return <>{children}</>;
}

export default AppStripeProvider;
