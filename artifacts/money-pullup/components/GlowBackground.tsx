import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/contexts/ThemeContext";

const { width: W, height: H } = Dimensions.get("window");

const PARTICLES = [
  { x: 0.12, y: 0.08, size: 4, delay: 0, duration: 2800 },
  { x: 0.85, y: 0.12, size: 3, delay: 400, duration: 3200 },
  { x: 0.45, y: 0.22, size: 5, delay: 800, duration: 2500 },
  { x: 0.72, y: 0.35, size: 3, delay: 1200, duration: 3600 },
  { x: 0.25, y: 0.45, size: 4, delay: 300, duration: 2900 },
  { x: 0.6, y: 0.55, size: 3, delay: 700, duration: 3100 },
  { x: 0.88, y: 0.6, size: 5, delay: 1500, duration: 2700 },
  { x: 0.18, y: 0.7, size: 3, delay: 900, duration: 3400 },
  { x: 0.5, y: 0.78, size: 4, delay: 200, duration: 2600 },
  { x: 0.75, y: 0.82, size: 3, delay: 1100, duration: 3300 },
  { x: 0.35, y: 0.9, size: 4, delay: 600, duration: 2800 },
  { x: 0.92, y: 0.88, size: 3, delay: 1400, duration: 3000 },
  { x: 0.08, y: 0.55, size: 5, delay: 500, duration: 2400 },
  { x: 0.62, y: 0.18, size: 3, delay: 1000, duration: 3500 },
  { x: 0.38, y: 0.62, size: 4, delay: 1600, duration: 2700 },
];

function Particle({ x, y, size, delay, duration }: typeof PARTICLES[0]) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.4, { duration: duration * 1.2, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.85,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x * W,
          top: y * H,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animStyle,
      ]}
    />
  );
}

const GLOW_BLOBS = [
  { top: -100, left: -80, size: 320, color: "#5B1FA8", opacity: 0.65 },
  { top: 80, right: -80, size: 260, color: "#A020C8", opacity: 0.35 },
  { top: 200, left: 100, size: 200, color: "#7B0FFF", opacity: 0.25 },
  { bottom: 150, left: -60, size: 240, color: "#8B5CF6", opacity: 0.3 },
  { bottom: -60, right: -60, size: 200, color: "#FF2D78", opacity: 0.2 },
];

const GLOW_BLOBS_LIGHT = [
  { top: -100, left: -80, size: 320, color: "#c4b5fd", opacity: 0.55 },
  { top: 80, right: -80, size: 260, color: "#f9a8d4", opacity: 0.4 },
  { bottom: 150, left: -60, size: 240, color: "#ddd6fe", opacity: 0.45 },
  { bottom: -60, right: -60, size: 200, color: "#fde68a", opacity: 0.35 },
];

export function GlowBackground() {
  const { isDark } = useTheme();
  const blobs = isDark ? GLOW_BLOBS : GLOW_BLOBS_LIGHT;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {blobs.map((blob, i) => (
        <View
          key={i}
          style={[
            styles.glow,
            {
              width: blob.size,
              height: blob.size,
              borderRadius: blob.size / 2,
              backgroundColor: blob.color,
              opacity: blob.opacity,
              ...(blob as any),
            },
          ]}
        />
      ))}
      {isDark && PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: "absolute" },
  particle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },
});
