import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { Tip } from "@/contexts/TipsContext";

interface TipNotificationProps {
  tip: Tip;
  index: number;
}

export function TipNotification({ tip, index }: TipNotificationProps) {
  const colors = useColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const delay = index * 60;
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
  }, [index, opacity, translateY, scale]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const timeStr = tip.timestamp.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isLarge = tip.amount >= 30;
  const isHuge = tip.amount >= 50;

  const cardColor = isHuge
    ? colors.gold
    : isLarge
    ? colors.accent
    : colors.violet;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: cardColor,
            borderWidth: 1.5,
            shadowColor: cardColor,
          },
        ]}
      >
        <View style={[styles.amountBadge, { backgroundColor: cardColor }]}>
          <Text style={[styles.amountText, { color: colors.primaryForeground }]}>
            +{tip.amount}€
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.fromName, { color: colors.foreground }]}>
            {tip.fromName}
          </Text>
          {tip.message ? (
            <Text
              style={[styles.message, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {tip.message}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {timeStr}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  amountBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: "center",
  },
  amountText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  info: {
    flex: 1,
  },
  fromName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  message: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
