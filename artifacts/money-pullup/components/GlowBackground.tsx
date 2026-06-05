import { LinearGradient } from "expo-linear-gradient";
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

const { width: W, height: H } = Dimensions.get("window");

const STARS = [
  { x: 0.08, y: 0.04, s: 1.5, o: 0.55, d: 0, dur: 3200 },
  { x: 0.22, y: 0.02, s: 1, o: 0.35, d: 400, dur: 2800 },
  { x: 0.71, y: 0.03, s: 1.5, o: 0.45, d: 800, dur: 3500 },
  { x: 0.88, y: 0.07, s: 1, o: 0.3, d: 200, dur: 2900 },
  { x: 0.15, y: 0.17, s: 1, o: 0.25, d: 1000, dur: 3100 },
  { x: 0.93, y: 0.23, s: 1.5, o: 0.38, d: 600, dur: 3400 },
  { x: 0.05, y: 0.44, s: 1, o: 0.2, d: 1400, dur: 2700 },
  { x: 0.78, y: 0.56, s: 1.5, o: 0.3, d: 300, dur: 3000 },
  { x: 0.42, y: 0.64, s: 1, o: 0.22, d: 900, dur: 2500 },
  { x: 0.96, y: 0.75, s: 1, o: 0.25, d: 1600, dur: 3600 },
  { x: 0.12, y: 0.8, s: 1.5, o: 0.3, d: 500, dur: 2800 },
  { x: 0.6, y: 0.88, s: 1, o: 0.2, d: 1200, dur: 3200 },
  { x: 0.33, y: 0.11, s: 1, o: 0.3, d: 700, dur: 2600 },
  { x: 0.55, y: 0.29, s: 1, o: 0.2, d: 1100, dur: 3300 },
  { x: 0.82, y: 0.42, s: 1.5, o: 0.28, d: 400, dur: 2900 },
];

function Star({ x, y, s, o, d, dur }: typeof STARS[0]) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(
      d,
      withRepeat(withTiming(o, { duration: dur, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        { position: "absolute", left: x * W, top: y * H, width: s, height: s, borderRadius: s / 2, backgroundColor: "#FFFFFF" },
        style,
      ]}
    />
  );
}

export function GlowBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base: cosmic deep-space violet-black */}
      <LinearGradient
        colors={["#03020A", "#080617", "#130219", "#03020A"]}
        locations={[0, 0.34, 0.68, 1.0]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top-left neon pink halo */}
      <View style={[styles.halo, { top: -100, left: -80, width: 340, height: 340, borderRadius: 170, backgroundColor: "#FF1B8D", opacity: 0.09 }]} />

      {/* Center-right electric blue halo */}
      <View style={[styles.halo, { top: "28%", right: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: "#008BEA", opacity: 0.07 }]} />

      {/* Bottom purple halo */}
      <View style={[styles.halo, { bottom: -50, left: "10%", width: 320, height: 200, borderRadius: 160, backgroundColor: "#8D2CFF", opacity: 0.1 }]} />

      {/* Mid-left pink glow */}
      <View style={[styles.halo, { top: "50%", left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: "#FF1B8D", opacity: 0.05 }]} />

      {/* Diagonal neon beam top-left */}
      <View
        style={{
          position: "absolute", top: "18%", left: -20, width: 200, height: 2,
          backgroundColor: "rgba(255,27,141,0.1)", transform: [{ rotate: "32deg" }],
        }}
      />
      {/* Diagonal neon beam right */}
      <View
        style={{
          position: "absolute", top: "42%", right: -20, width: 180, height: 1.5,
          backgroundColor: "rgba(0,139,234,0.09)", transform: [{ rotate: "-25deg" }],
        }}
      />

      {/* Bottom horizontal glow line */}
      <LinearGradient
        colors={["transparent", "rgba(141,44,255,0.18)", "rgba(255,27,141,0.1)", "transparent"]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", bottom: 70, left: 0, right: 0, height: 1 }}
      />

      {/* Stars */}
      {STARS.map((s, i) => <Star key={i} {...s} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: "absolute" },
});
