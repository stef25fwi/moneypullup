import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface TipButtonProps {
  amount: number;
  isSelected: boolean;
  onPress: (amount: number) => void;
  color: string;
  style?: ViewStyle;
}

export function TipButton({ amount, isSelected, onPress, color, style }: TipButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.6);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(withSpring(0.88, { damping: 8 }), withSpring(1.05, { damping: 8 }), withSpring(1, { damping: 10 }));
    shadowOpacity.value = withSequence(withTiming(1, { duration: 100 }), withTiming(0.6, { duration: 300 }));
    onPress(amount);
  }, [amount, onPress, scale, shadowOpacity]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        animStyle,
        {
          shadowColor: color,
          elevation: 8,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            backgroundColor: color,
            borderWidth: isSelected ? 3 : 0,
            borderColor: "#FFFFFF",
          },
        ]}
      >
        <Text style={[styles.amount, { color: colors.primaryForeground }]}>
          {amount}€
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 60,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  amount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
});
