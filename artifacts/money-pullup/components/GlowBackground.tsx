import React from "react";
import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function GlowBackground() {
  const colors = useColors();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[
          styles.glow,
          {
            backgroundColor: colors.deepPurple,
            top: -60,
            left: -60,
            width: 240,
            height: 240,
            opacity: 0.35,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: colors.neonPink,
            top: 80,
            right: -80,
            width: 200,
            height: 200,
            opacity: 0.18,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: colors.violet,
            bottom: 100,
            left: -40,
            width: 180,
            height: 180,
            opacity: 0.2,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: colors.gold,
            bottom: -40,
            right: -40,
            width: 160,
            height: 160,
            opacity: 0.12,
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
