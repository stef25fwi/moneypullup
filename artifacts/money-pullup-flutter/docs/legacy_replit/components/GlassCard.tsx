import { BlurView } from "expo-blur";
import React from "react";
import {Platform, StyleSheet, View, ViewStyle, StyleProp} from 'react-native';

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderColor?: string;
}

export function GlassCard({
  children,
  style,
  intensity = 40,
  borderColor,
}: GlassCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  const border = borderColor ?? colors.glassBorder;

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.fallback,
          {
            backgroundColor: colors.glassBackground,
            borderColor: border,
            borderRadius: colors.radius,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        { borderColor: border, borderRadius: colors.radius },
        style,
      ]}
    >
      <BlurView
        intensity={isDark ? intensity : intensity + 20}
        tint={isDark ? "dark" : "light"}
        style={[StyleSheet.absoluteFill, { borderRadius: colors.radius }]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.glassBackground,
            borderRadius: colors.radius,
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  fallback: {
    borderWidth: 1,
  },
});
