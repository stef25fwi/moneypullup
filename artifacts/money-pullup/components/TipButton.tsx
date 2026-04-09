import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface TipButtonProps {
  amount: number;
  isSelected: boolean;
  onPress: (amount: number) => void;
  color: string;
  highlightColor: string;
  shadowColor: string;
  style?: ViewStyle;
}

export function TipButton({
  amount,
  isSelected,
  onPress,
  color,
  highlightColor,
  shadowColor,
  style,
}: TipButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(isSelected ? 1 : 0.55);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glowOpacity.value,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withSpring(0.85, { damping: 8 }),
      withSpring(1.08, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0.7, { duration: 400 })
    );
    onPress(amount);
  }, [amount, onPress, scale, glowOpacity]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          shadowColor,
          shadowOpacity: isSelected ? 0.9 : 0.55,
        },
        animStyle,
        style,
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.touchable}>
        <LinearGradient
          colors={[highlightColor, color, shadowColor]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={[
            styles.coin,
            isSelected && { borderWidth: 3, borderColor: "#FFFFFF" },
          ]}
        >
          <View style={styles.shine} />
          <Text style={styles.amount}>{amount}€</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 10,
    borderRadius: 55,
  },
  touchable: {
    borderRadius: 55,
  },
  coin: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    top: 6,
    left: "20%",
    width: "60%",
    height: "38%",
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  amount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -0.5,
  },
});
