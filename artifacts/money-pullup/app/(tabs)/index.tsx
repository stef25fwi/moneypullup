import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlowBackground } from "@/components/GlowBackground";
import { GlassCard } from "@/components/GlassCard";
import { TipButton } from "@/components/TipButton";
import { useTips } from "@/contexts/TipsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { useTipCheckout } from "@/hooks/useTipCheckout";

const PRESET_AMOUNTS = [2, 5, 10, 20];

const COIN_CONFIG = [
  { color: "#FF4400", highlightColor: "#FF9900", shadowColor: "#AA1100" },
  { color: "#00BB00", highlightColor: "#55FF44", shadowColor: "#006600" },
  { color: "#0077FF", highlightColor: "#44CCFF", shadowColor: "#003399" },
  { color: "#CC00EE", highlightColor: "#FF55FF", shadowColor: "#770099" },
];

// ─── 3D text component ───────────────────────────────────────────────────────
function Text3D({
  children,
  style,
  depth = 4,
  shadowColor,
  color,
}: {
  children: string;
  style?: TextStyle;
  depth?: number;
  shadowColor: string;
  color: string;
}) {
  const steps = [depth, Math.round(depth * 0.55)];
  return (
    <View style={{ paddingBottom: depth + 2, paddingRight: depth + 2 }}>
      {steps.map((d, i) => (
        <Text
          key={i}
          style={[
            style,
            {
              position: "absolute",
              top: d,
              left: d,
              color: shadowColor,
              opacity: 1 - i * 0.35,
            },
          ]}
        >
          {children}
        </Text>
      ))}
      <Text style={[style, { color }]}>{children}</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function FanScreen() {
  const colors = useColors();
  const { toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    djs,
    selectedDj,
    setSelectedDj,
  } = useTips();
  const tipCheckout = useTipCheckout();

  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [lastSentSuccess, setLastSentSuccess] = useState(false);
  const [lastSentDjName, setLastSentDjName] = useState("");
  const [showDjPicker, setShowDjPicker] = useState(false);

  const sendBtnScale = useSharedValue(1);
  const sendBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendBtnScale.value }],
  }));

  const effectiveAmount = showCustom ? parseFloat(customAmount) || 0 : selectedAmount;
  const liveDjs = djs.filter((d) => d.isLive);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const BG = isDark ? "#130028" : "#f3eeff";
  const ACCENT = isDark ? "#FF0088" : "#8B5CF6";
  const GOLD = "#FFD700";

  const markSent = useCallback((djName: string) => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    sendBtnScale.value = withSequence(
      withSpring(0.88, { damping: 8 }),
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    setLastSentSuccess(true);
    setLastSentDjName(djName);
    setMessage("");
    setTimeout(() => setLastSentSuccess(false), 3500);
  }, [sendBtnScale]);

  const handleSendTip = useCallback(async () => {
    if (!selectedDj) return;
    if (effectiveAmount <= 0) {
      Alert.alert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    // Per-tip manual-capture PaymentIntent via the Stripe Payment Sheet.
    try {
      const outcome = await tipCheckout(selectedDj.id, effectiveAmount, message);
      if (outcome === "authorized") markSent(selectedDj.name);
    } catch (e) {
      Alert.alert("Paiement impossible", e instanceof Error ? e.message : "Réessayez plus tard.");
    }
  }, [selectedDj, effectiveAmount, message, tipCheckout, markSent]);

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      <GlowBackground />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPadding + 8, paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => { toggleTheme(); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
              style={[styles.topBtn, { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.18)" }]}
            >
              <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? GOLD : "#8B5CF6"} />
            </TouchableOpacity>
          </View>

          {/* ── DJ Banner ── */}
          <TouchableOpacity onPress={() => setShowDjPicker((v) => !v)} activeOpacity={0.85}>
            <View style={[styles.djBanner, { backgroundColor: isDark ? "#5500CC" : "#7C3AED" }]}>
              <View style={styles.djBannerStripe} />
              <MaterialCommunityIcons name="music-circle" size={20} color="rgba(255,255,255,0.6)" />
              <Text style={styles.djBannerName} numberOfLines={1}>
                {selectedDj ? selectedDj.name.toUpperCase() : "CHOISIR UN DJ"}
              </Text>
              {selectedDj?.isLive && (
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              <Feather name={showDjPicker ? "chevron-up" : "chevron-down"} size={15} color="rgba(255,255,255,0.55)" style={{ marginLeft: "auto" }} />
            </View>
          </TouchableOpacity>

          {/* DJ Picker */}
          {showDjPicker && (
            <GlassCard style={styles.djPicker}>
              {liveDjs.map((dj) => {
                const isSel = selectedDj?.id === dj.id;
                return (
                  <TouchableOpacity
                    key={dj.id}
                    onPress={() => { setSelectedDj(dj); setShowDjPicker(false); }}
                    style={[styles.djPickerRow, isSel && { backgroundColor: "rgba(138,43,226,0.22)" }]}
                  >
                    <Text style={{ fontSize: 22 }}>{dj.avatar}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.djPickerName, { color: isSel ? "#CC55FF" : colors.foreground }]}>{dj.name}</Text>
                      <Text style={[styles.djPickerGenre, { color: colors.mutedForeground }]}>{dj.genre}</Text>
                    </View>
                    <View style={styles.livePillSmall}><Text style={styles.liveTextSmall}>LIVE</Text></View>
                  </TouchableOpacity>
                );
              })}
            </GlassCard>
          )}

          {/* ── Section label ── */}
          <Text style={[styles.sectionLabel, { color: isDark ? "rgba(255,255,255,0.5)" : "rgba(80,0,160,0.45)" }]}>
            CHOISISSEZ VOTRE TIP
          </Text>

          {/* ── Coin buttons ── */}
          <View style={styles.coinsRow}>
            {PRESET_AMOUNTS.map((amt, i) => (
              <TipButton
                key={amt}
                amount={amt}
                isSelected={!showCustom && selectedAmount === amt}
                onPress={(a) => {
                  setSelectedAmount(a);
                  setShowCustom(false);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                color={COIN_CONFIG[i].color}
                highlightColor={COIN_CONFIG[i].highlightColor}
                shadowColor={COIN_CONFIG[i].shadowColor}
              />
            ))}
          </View>

          {/* ── YOUR TIP label ── */}
          <Text style={[styles.yourTipLabel, { color: isDark ? "rgba(255,255,255,0.6)" : "rgba(80,0,160,0.55)" }]}>
            YOUR TIP
          </Text>

          {/* ── Amount box with 3D text ── */}
          <View style={[styles.amountBox, { backgroundColor: isDark ? "#1E0044" : "#fff", borderColor: ACCENT, shadowColor: ACCENT }]}>
            <View style={{ alignItems: "center" }}>
              <Text3D
                depth={5}
                shadowColor={isDark ? "#880033" : "#5500AA"}
                color={ACCENT}
                style={styles.amountValue}
              >
                {effectiveAmount > 0 ? `${effectiveAmount} €` : "0 €"}
              </Text3D>
            </View>
          </View>

          {/* ── Money Pull-up logo ── */}
          <View style={styles.logoRow}>
            <View style={[styles.dollarCircle, { backgroundColor: "#FFD700" }]}>
              <Text style={styles.dollarSign}>$</Text>
            </View>
            <View>
              <Text3D depth={3} shadowColor="#AA7700" color="#FFD700" style={styles.logoMoney}>
                Money
              </Text3D>
              <Text3D depth={3} shadowColor="#883300" color="#FF8800" style={styles.logoPullup}>
                Pull-up
              </Text3D>
            </View>
          </View>

          {/* ── Message input ── */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message pour le DJ... (optionnel)"
            placeholderTextColor={isDark ? "rgba(200,150,255,0.35)" : "rgba(100,0,200,0.3)"}
            maxLength={60}
            style={[
              styles.messageInput,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.7)",
                color: colors.foreground,
                borderColor: isDark ? "rgba(255,255,255,0.13)" : "rgba(139,92,246,0.25)",
              },
            ]}
          />

          {/* ── Action buttons — FLAT, vivid ── */}
          <View style={styles.actionRow}>
            {/* ENTER AMOUNT */}
            <TouchableOpacity
              onPress={() => { setShowCustom((v) => !v); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
              style={[styles.actionBtn, { backgroundColor: showCustom ? "#7700EE" : "#4400AA" }]}
            >
              <MaterialCommunityIcons name="calculator-variant" size={17} color="#fff" />
              <Text style={styles.actionBtnLabel}>MONTANT{"\n"}LIBRE</Text>
            </TouchableOpacity>

            {/* SEND TIP */}
            <Animated.View style={[styles.sendBtnWrap, sendBtnStyle]}>
              <TouchableOpacity
                onPress={handleSendTip}
                disabled={!selectedDj || effectiveAmount <= 0}
                activeOpacity={0.85}
                style={[
                  styles.actionBtn,
                  styles.sendBtn,
                  {
                    backgroundColor: lastSentSuccess
                      ? "#00BB44"
                      : !selectedDj || effectiveAmount <= 0
                      ? "#444"
                      : "#EE0033",
                    shadowColor: lastSentSuccess ? "#00FF66" : "#FF0055",
                  },
                ]}
              >
                <Feather name={lastSentSuccess ? "check-circle" : "zap"} size={20} color="#fff" />
                <Text style={[styles.actionBtnLabel, styles.sendBtnLabel]}>
                  {lastSentSuccess ? "ENVOYÉ !" : "SEND TIP"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Custom amount input */}
          {showCustom && (
            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="Montant libre en €"
              placeholderTextColor={isDark ? "rgba(200,150,255,0.4)" : "rgba(100,0,200,0.3)"}
              keyboardType="numeric"
              style={[
                styles.customInput,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.7)",
                  color: colors.foreground,
                  borderColor: "#7700EE",
                },
              ]}
            />
          )}

          {/* Pending notification */}
          {lastSentSuccess && (
            <GlassCard style={[styles.pendingBanner, { borderColor: "#F59E0B" }]} borderColor="#F59E0B">
              <MaterialCommunityIcons name="clock-check-outline" size={18} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pendingTitle, { color: colors.foreground }]}>
                  Tip envoyé à {lastSentDjName}
                </Text>
                <Text style={styles.pendingSub}>En attente d'acceptation par le DJ</Text>
              </View>
            </GlassCard>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 18 },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  djBanner: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 15, paddingHorizontal: 16,
    borderRadius: 16, marginBottom: 10, overflow: "hidden",
    shadowColor: "#8800FF", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.55, shadowRadius: 12, elevation: 7,
  },
  djBannerStripe: { position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(255,255,255,0.25)", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  djBannerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1.2, flex: 1 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FF0055", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  livePillSmall: { backgroundColor: "#FF0055", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  liveTextSmall: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  djPicker: { padding: 8, marginBottom: 14, gap: 4 },
  djPickerRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12 },
  djPickerName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  djPickerGenre: { fontSize: 11, fontFamily: "Inter_400Regular" },

  sectionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 3, textAlign: "center", marginTop: 10, marginBottom: 14 },

  coinsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 20 },

  yourTipLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 3, textAlign: "center", marginBottom: 10 },

  amountBox: {
    marginHorizontal: 4, marginBottom: 16, borderRadius: 18, borderWidth: 3,
    paddingVertical: 18, paddingHorizontal: 20, alignItems: "center",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.85, shadowRadius: 20, elevation: 14,
  },
  amountValue: { fontSize: 56, fontFamily: "Inter_700Bold", letterSpacing: -1 },

  logoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 },
  dollarCircle: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", shadowColor: "#FFD700", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 5 },
  dollarSign: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#5C3A00" },
  logoMoney: { fontSize: 19, fontFamily: "Inter_700Bold", letterSpacing: 0.5, lineHeight: 22 },
  logoPullup: { fontSize: 19, fontFamily: "Inter_700Bold", letterSpacing: 0.5, lineHeight: 22 },

  messageInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 14 },

  actionRow: { flexDirection: "row", gap: 9, marginBottom: 12 },
  actionBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 15, borderRadius: 16 },
  sendBtnWrap: { flex: 1.25 },
  sendBtn: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.7, shadowRadius: 10, elevation: 8 },
  actionBtnLabel: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8, textAlign: "center" },
  sendBtnLabel: { fontSize: 11, letterSpacing: 1 },

  customInput: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 14 },

  pendingBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10 },
  pendingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pendingSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B", marginTop: 2 },
});
