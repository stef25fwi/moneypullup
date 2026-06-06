import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Coin border colors matching reference image: dark glass, border-only style
const COIN_BORDERS: Record<number, { border: string; glow: string }> = {
  5:  { border: "rgba(200,200,220,0.22)", glow: "rgba(200,200,220,0.3)" },
  10: { border: "#FF1B8D",               glow: "#FF1B8D" },
  15: { border: "rgba(0,184,212,0.55)",  glow: "#00B8D4" },
  20: { border: "rgba(141,44,255,0.55)", glow: "#8D2CFF" },
};

interface Props {
  amount: number;
  isSelected: boolean;
  onPress: (amount: number) => void;
  size?: number;
}

export function AmountChip3D({ amount, isSelected, onPress, size: sizeProp }: Props) {
  const cfg = COIN_BORDERS[amount] ?? COIN_BORDERS[10];

  const scale = useSharedValue(1);
  // Pulsing glow for selected state
  const ringOpacity = useSharedValue(isSelected ? 0.85 : 0);
  const ringScale  = useSharedValue(isSelected ? 1 : 0.7);

  useEffect(() => {
    if (isSelected) {
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(1,    { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.6,  { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else {
      ringOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isSelected]);

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.88, { damping: 8 }),
      withSpring(1.05, { damping: 8 }),
      withSpring(1,    { damping: 12 })
    );
    onPress(amount);
  }, [amount, onPress, scale]);

  const base = sizeProp ?? 64;
  const coinSize = isSelected ? Math.round(base * 1.14) : base;
  const R = coinSize / 2;

  // Outer glow ring animated style
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));
  const coinAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ alignItems: "center", justifyContent: "center" }, coinAnimStyle]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={{ alignItems: "center", justifyContent: "center" }}>

        {/* ── Outer glow ring (selected only) ── */}
        {isSelected && (
          <Animated.View
            style={[
              styles.glowRing,
              ringStyle,
              {
                width:  coinSize + 22,
                height: coinSize + 22,
                borderRadius: (coinSize + 22) / 2,
                borderColor: cfg.glow,
                shadowColor: cfg.glow,
              },
            ]}
          />
        )}

        {/* ── Inner glow fill (selected only, subtle radial) ── */}
        {isSelected && (
          <View
            style={[
              styles.innerGlow,
              {
                width:  coinSize + 2,
                height: coinSize + 2,
                borderRadius: (coinSize + 2) / 2,
                backgroundColor: `${cfg.glow}18`,
              },
            ]}
          />
        )}

        {/* ── Coin body: dark glass ── */}
        <View
          style={[
            styles.coin,
            {
              width:  coinSize,
              height: coinSize,
              borderRadius: R,
              borderColor: isSelected ? cfg.border : cfg.border,
              borderWidth: isSelected ? 2 : 1.2,
              shadowColor:  isSelected ? cfg.glow : cfg.glow,
              shadowOpacity: isSelected ? 0.85 : 0.3,
              shadowRadius:  isSelected ? 14 : 5,
            },
          ]}
        >
          {/* Subtle inner shine at top */}
          <View
            style={[
              styles.shine,
              { width: coinSize * 0.55, height: coinSize * 0.28, borderRadius: coinSize * 0.25 },
            ]}
          />

          <Text
            style={[
              styles.label,
              {
                fontSize: isSelected ? Math.round(coinSize * 0.31) : Math.round(coinSize * 0.29),
                fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
                color: "#FFFFFF",
              },
            ]}
          >
            {amount}€
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowRing: {
    position: "absolute",
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 18,
    elevation: 10,
  },
  innerGlow: {
    position: "absolute",
  },
  coin: {
    backgroundColor: "rgba(10,8,20,0.88)",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    top: 4,
    left: "20%",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  label: {
    letterSpacing: -0.3,
  },
});
