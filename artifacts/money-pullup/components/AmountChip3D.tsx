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

interface ChipConfig {
  borderColor: string;
  glowColor: string;
  gradientTop: string;
  gradientMid: string;
  gradientBot: string;
}

const CHIP_CONFIGS: Record<number, ChipConfig> = {
  5:  { borderColor: "#9D1A82", glowColor: "#CC22AA", gradientTop: "#E040CC", gradientMid: "#9D1A82", gradientBot: "#5A0048" },
  10: { borderColor: "#FF1B8D", glowColor: "#FF1B8D", gradientTop: "#FF6DB5", gradientMid: "#FF1B8D", gradientBot: "#9A0054" },
  15: { borderColor: "#0078C9", glowColor: "#00AAFF", gradientTop: "#44BBFF", gradientMid: "#0088DD", gradientBot: "#003E7A" },
  20: { borderColor: "#8D2CFF", glowColor: "#AA55FF", gradientTop: "#CC88FF", gradientMid: "#8D2CFF", gradientBot: "#440099" },
};

interface Props {
  amount: number;
  isSelected: boolean;
  onPress: (amount: number) => void;
}

export function AmountChip3D({ amount, isSelected, onPress }: Props) {
  const cfg = CHIP_CONFIGS[amount] ?? CHIP_CONFIGS[10];

  const scale = useSharedValue(1);
  const glowRadius = useSharedValue(isSelected ? 22 : 10);
  const glowOpacity = useSharedValue(isSelected ? 0.85 : 0.45);

  useEffect(() => {
    if (isSelected) {
      glowRadius.value = withRepeat(
        withSequence(
          withTiming(28, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
          withTiming(18, { duration: 1100, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.95, { duration: 1100 }),
          withTiming(0.65, { duration: 1100 })
        ),
        -1,
        false
      );
    } else {
      glowRadius.value = withTiming(10, { duration: 300 });
      glowOpacity.value = withTiming(0.4, { duration: 300 });
    }
  }, [isSelected]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowRadius: glowRadius.value,
    shadowOpacity: glowOpacity.value,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.88, { damping: 8 }),
      withSpring(1.06, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    onPress(amount);
  }, [amount, onPress, scale]);

  const size = isSelected ? 80 : 72;
  const radius = size / 2;

  return (
    <Animated.View
      style={[
        outerRing(cfg.glowColor, isSelected ? 2.5 : 1.5),
        outerStyle,
        { width: size + 10, height: size + 10, borderRadius: (size + 10) / 2 },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={{ borderRadius: radius + 5 }}>
        {/* Double ring outer */}
        <View
          style={[
            styles.ringOuter,
            {
              width: size + 8,
              height: size + 8,
              borderRadius: (size + 8) / 2,
              borderColor: cfg.borderColor,
              borderWidth: isSelected ? 2 : 1.2,
              backgroundColor: "rgba(0,0,0,0.45)",
            },
          ]}
        >
          {/* Inner ring */}
          <View
            style={[
              styles.ringInner,
              {
                width: size + 2,
                height: size + 2,
                borderRadius: (size + 2) / 2,
                borderColor: cfg.borderColor + "55",
                borderWidth: 0.8,
              },
            ]}
          >
            {/* Coin body */}
            <LinearGradient
              colors={[cfg.gradientTop, cfg.gradientMid, cfg.gradientBot]}
              start={{ x: 0.25, y: 0 }}
              end={{ x: 0.75, y: 1 }}
              style={[styles.coin, { width: size, height: size, borderRadius: radius }]}
            >
              {/* Shine */}
              <View style={[styles.shine, { width: size * 0.55, height: size * 0.35 }]} />
              {/* Bottom shadow */}
              <View style={[styles.bottomShadow, { width: size * 0.7, height: size * 0.25 }]} />

              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {amount}€
              </Text>
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function outerRing(glowColor: string, borderWidth: number) {
  return {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  };
}

const styles = StyleSheet.create({
  ringOuter: { alignItems: "center", justifyContent: "center" },
  ringInner: { alignItems: "center", justifyContent: "center" },
  coin: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shine: {
    position: "absolute",
    top: 5,
    left: "18%",
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  bottomShadow: {
    position: "absolute",
    bottom: 4,
    left: "15%",
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  label: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    letterSpacing: -0.3,
  },
  labelSelected: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
});
