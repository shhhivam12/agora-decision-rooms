import React, { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

export function SafeAreaProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function SafeAreaView({
  children,
  edges: _edges,
  ...props
}: PropsWithChildren<ViewProps & { edges?: string[] }>) {
  return <View {...props}>{children}</View>;
}
