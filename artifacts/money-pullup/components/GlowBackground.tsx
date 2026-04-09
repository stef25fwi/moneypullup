import React from "react";
import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";

export function GlowBackground() {
  const colors = useColors();
  const { isDark } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          styles.glow,
          {
            backgroundColor: isDark ? "#4B0082" : "#c4b5fd",
            top: -80,
            left: -80,
            width: 280,
            height: 280,
            opacity: isDark ? 0.5 : 0.55,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: isDark ? "#FF2D78" : "#f9a8d4",
            top: 60,
            right: -100,
            width: 220,
            height: 220,
            opacity: isDark ? 0.22 : 0.4,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: isDark ? "#8B5CF6" : "#ddd6fe",
            bottom: 120,
            left: -60,
            width: 200,
            height: 200,
            opacity: isDark ? 0.25 : 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: isDark ? "#FFD700" : "#fde68a",
            bottom: -60,
            right: -60,
            width: 180,
            height: 180,
            opacity: isDark ? 0.14 : 0.35,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    borderRadius: 999,
  },
});
