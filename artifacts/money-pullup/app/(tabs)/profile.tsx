import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlowBackground } from "@/components/GlowBackground";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const { toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const go = (path: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.navigate(path as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />

      {/* Theme toggle */}
      <TouchableOpacity
        onPress={() => { toggleTheme(); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
        style={[
          styles.themeBtn,
          { top: insets.top + 12, backgroundColor: colors.glassBackground, borderColor: colors.glassBorder },
        ]}
      >
        <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? colors.gold : colors.violet} />
      </TouchableOpacity>

      <View style={[styles.content, { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 100 }]}>
        {/* Logo / title */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎧</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Money Pull Up</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Qui êtes-vous ce soir ?
          </Text>
        </View>

        {/* FAN card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => go("/(tabs)/")}
          style={styles.card}
        >
          <LinearGradient
            colors={["#EE0033", "#9B0020"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGrad}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardEmoji}>👥</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Fan</Text>
                <Text style={styles.cardDesc}>
                  Envoyez des tips à vos DJs préférés
                </Text>
              </View>
              <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* DJ card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => go("/(tabs)/dj")}
          style={styles.card}
        >
          <LinearGradient
            colors={["#4A12A0", "#2A0060"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGrad}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardEmoji}>🎧</Text>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>DJ</Text>
                <Text style={styles.cardDesc}>
                  Gérez vos tips et encaissez facilement
                </Text>
              </View>
              <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeBtn: {
    position: "absolute",
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    zIndex: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 16,
  },
  hero: { alignItems: "center", gap: 8, marginBottom: 24 },
  heroEmoji: { fontSize: 56 },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  sub: { fontSize: 15, fontFamily: "Inter_400Regular" },

  card: { borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  cardGrad: { padding: 2, borderRadius: 20 },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 22,
  },
  cardEmoji: { fontSize: 36 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
});
