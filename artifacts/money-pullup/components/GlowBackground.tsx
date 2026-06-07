import { Image } from "expo-image";
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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const BG_SOURCE = require("../assets/images/bg_club.png");

const STARS = [
  { x: 0.06, y: 0.03, s: 1.5, o: 0.5,  d: 0,    dur: 3200 },
  { x: 0.20, y: 0.02, s: 1,   o: 0.35, d: 400,  dur: 2800 },
  { x: 0.70, y: 0.04, s: 1.5, o: 0.45, d: 800,  dur: 3500 },
  { x: 0.87, y: 0.06, s: 1,   o: 0.3,  d: 200,  dur: 2900 },
  { x: 0.93, y: 0.20, s: 1.5, o: 0.38, d: 600,  dur: 3400 },
  { x: 0.04, y: 0.42, s: 1,   o: 0.2,  d: 1400, dur: 2700 },
  { x: 0.77, y: 0.54, s: 1.5, o: 0.28, d: 300,  dur: 3000 },
  { x: 0.95, y: 0.73, s: 1,   o: 0.25, d: 1600, dur: 3600 },
  { x: 0.11, y: 0.79, s: 1.5, o: 0.3,  d: 500,  dur: 2800 },
];

function Star({ x, y, s, o, d, dur }: typeof STARS[0]) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(
      d,
      withRepeat(
        withTiming(o, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x * W,
          top: y * H,
          width: s,
          height: s,
          borderRadius: s / 2,
          backgroundColor: "#FFFFFF",
        },
        style,
      ]}
    />
  );
}

export function GlowBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]} pointerEvents="none">

      {/* ── Club photo base ── */}
      <Image
        source={BG_SOURCE}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />

      {/* ── Dark vignette overlay — keeps text readable ── */}
      <LinearGradient
        colors={[
          "rgba(4,2,18,0.70)",
          "rgba(6,4,24,0.60)",
          "rgba(8,4,22,0.65)",
          "rgba(3,2,11,0.88)",
        ]}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Extra bottom darkening for action buttons ── */}
      <LinearGradient
        colors={["transparent", "rgba(3,2,11,0.78)"]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Magenta tint — left beam ── */}
      <LinearGradient
        colors={["transparent", "rgba(196,20,130,0.16)", "transparent"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.65, y: 0.25 }}
        style={{
          position: "absolute",
          bottom: 0, left: 0,
          width: W * 0.7, height: H * 0.55,
        }}
      />

      {/* ── Blue tint — right beam ── */}
      <LinearGradient
        colors={["transparent", "rgba(20,80,220,0.13)", "transparent"]}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.35, y: 0.25 }}
        style={{
          position: "absolute",
          bottom: 0, right: 0,
          width: W * 0.65, height: H * 0.5,
        }}
      />

      {/* ── Sparkle stars ── */}
      {STARS.map((st, i) => (
        <Star key={i} {...st} />
      ))}
    </View>
  );
}
