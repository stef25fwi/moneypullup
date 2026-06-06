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
  { x: 0.06, y: 0.03, s: 1.5, o: 0.5,  d: 0,    dur: 3200 },
  { x: 0.20, y: 0.02, s: 1,   o: 0.35, d: 400,  dur: 2800 },
  { x: 0.70, y: 0.04, s: 1.5, o: 0.45, d: 800,  dur: 3500 },
  { x: 0.87, y: 0.06, s: 1,   o: 0.3,  d: 200,  dur: 2900 },
  { x: 0.14, y: 0.15, s: 1,   o: 0.25, d: 1000, dur: 3100 },
  { x: 0.93, y: 0.20, s: 1.5, o: 0.38, d: 600,  dur: 3400 },
  { x: 0.04, y: 0.42, s: 1,   o: 0.2,  d: 1400, dur: 2700 },
  { x: 0.77, y: 0.54, s: 1.5, o: 0.28, d: 300,  dur: 3000 },
  { x: 0.41, y: 0.63, s: 1,   o: 0.22, d: 900,  dur: 2500 },
  { x: 0.95, y: 0.73, s: 1,   o: 0.25, d: 1600, dur: 3600 },
  { x: 0.11, y: 0.79, s: 1.5, o: 0.3,  d: 500,  dur: 2800 },
  { x: 0.59, y: 0.87, s: 1,   o: 0.2,  d: 1200, dur: 3200 },
  { x: 0.32, y: 0.10, s: 1,   o: 0.3,  d: 700,  dur: 2600 },
  { x: 0.54, y: 0.28, s: 1,   o: 0.2,  d: 1100, dur: 3300 },
  { x: 0.81, y: 0.41, s: 1.5, o: 0.28, d: 400,  dur: 2900 },
];

function Star({ x, y, s, o, d, dur }: typeof STARS[0]) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(d, withRepeat(
      withTiming(o, { duration: dur, easing: Easing.inOut(Easing.sin) }), -1, true
    ));
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[
      { position: "absolute", left: x * W, top: y * H, width: s, height: s, borderRadius: s / 2, backgroundColor: "#FFFFFF" },
      style,
    ]} />
  );
}

export function GlowBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* ── Base dark cosmic gradient ── */}
      <LinearGradient
        colors={["#040212", "#060418", "#0E051A", "#040212"]}
        locations={[0, 0.3, 0.65, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Magenta / pink beam — bottom left (wide, vivid) ── */}
      <LinearGradient
        colors={["transparent", "rgba(220,10,130,0.32)", "rgba(190,10,110,0.18)", "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.75, y: 0.1 }}
        style={{ position: "absolute", bottom: 0, left: 0, width: W * 0.75, height: H * 0.62 }}
      />
      {/* Second pink layer — brighter core */}
      <LinearGradient
        colors={["transparent", "rgba(255,20,150,0.22)", "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.5, y: 0.25 }}
        style={{ position: "absolute", bottom: 0, left: 0, width: W * 0.5, height: H * 0.45 }}
      />

      {/* ── Electric blue beam — right side (vivid) ── */}
      <LinearGradient
        colors={["transparent", "rgba(0,110,240,0.28)", "rgba(0,80,200,0.14)", "transparent"]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.2, y: 0.1 }}
        style={{ position: "absolute", bottom: 0, right: 0, width: W * 0.7, height: H * 0.6 }}
      />
      {/* Second blue layer — brighter core */}
      <LinearGradient
        colors={["transparent", "rgba(30,130,255,0.18)", "transparent"]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.5, y: 0.3 }}
        style={{ position: "absolute", bottom: 0, right: 0, width: W * 0.5, height: H * 0.42 }}
      />

      {/* ── Top subtle pink halo ── */}
      <View style={{
        position: "absolute", top: -80, left: "15%",
        width: W * 0.7, height: 280, borderRadius: 200,
        backgroundColor: "rgba(200,20,120,0.06)",
      }} />

      {/* ── Center right blue halo ── */}
      <View style={{
        position: "absolute", top: "25%", right: -60,
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: "rgba(0,100,200,0.06)",
      }} />

      {/* ── Stars ── */}
      {STARS.map((s, i) => <Star key={i} {...s} />)}
    </View>
  );
}
