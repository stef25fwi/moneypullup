import React from "react";
import { View, type ViewStyle } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
  TSpan,
} from "react-native-svg";

interface GradientAmountProps {
  /** Amount in euros. Rendered as `<number>€`. */
  value: number;
  /** Font size of the glyphs in px. Height scales from this. */
  size?: number;
  style?: ViewStyle;
}

/**
 * The big tip amount as it appears in the "case montant": the digits carry a
 * vertical blue→cyan gradient and the euro sign a pink→magenta one, with a soft
 * neon edge. Built on react-native-svg so the gradient fill is pixel-identical
 * on iOS, Android and web (plain <Text> can't gradient-fill glyphs).
 */
export function GradientAmount({ value, size = 96, style }: GradientAmountProps) {
  const height = Math.round(size * 1.24);
  const baseline = Math.round(height / 2 + size * 0.36);
  const numberText = `${value}`;
  const euroGap = size * 0.03;

  return (
    <View style={[{ width: "100%", height }, style]}>
      <Svg width="100%" height={height}>
        <Defs>
          <SvgLinearGradient id="mpNumGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#9BF4FF" />
            <Stop offset="0.42" stopColor="#38A2FF" />
            <Stop offset="1" stopColor="#1436C6" />
          </SvgLinearGradient>
          <SvgLinearGradient id="mpEuroGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF9BD6" />
            <Stop offset="0.42" stopColor="#FF2E98" />
            <Stop offset="1" stopColor="#CD1456" />
          </SvgLinearGradient>
        </Defs>

        {/* Soft neon halo behind the glyphs. */}
        <SvgText
          x="50%"
          y={baseline}
          textAnchor="middle"
          fontSize={size}
          fontFamily="Inter_700Bold"
          fontWeight="bold"
          fill="none"
          stroke="rgba(140,210,255,0.30)"
          strokeWidth={size * 0.07}
          strokeLinejoin="round"
        >
          <TSpan>{numberText}</TSpan>
          <TSpan dx={euroGap}>€</TSpan>
        </SvgText>

        {/* Gradient-filled glyphs with a glossy light edge. */}
        <SvgText
          x="50%"
          y={baseline}
          textAnchor="middle"
          fontSize={size}
          fontFamily="Inter_700Bold"
          fontWeight="bold"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={1.4}
          strokeLinejoin="round"
        >
          <TSpan fill="url(#mpNumGrad)">{numberText}</TSpan>
          <TSpan fill="url(#mpEuroGrad)" dx={euroGap}>
            €
          </TSpan>
        </SvgText>
      </Svg>
    </View>
  );
}
