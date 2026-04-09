import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { StripeModal } from "@/components/StripeModal";
import { useTips } from "@/contexts/TipsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";

const PRESET_AMOUNTS = [5, 10, 15, 20];
const BUTTON_COLORS = ["#FF6B35", "#4CAF50", "#2196F3", "#9C27B0"];

export default function FanScreen() {
  const colors = useColors();
  const { toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    wallet,
    djs,
    selectedDj,
    setSelectedDj,
    sendTip,
    openStripeModal,
    isStripeModalVisible,
    closeStripeModal,
  } = useTips();

  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [lastSentSuccess, setLastSentSuccess] = useState(false);

  const sendBtnScale = useSharedValue(1);

  const sendBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendBtnScale.value }],
  }));

  const effectiveAmount = showCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleSendTip = useCallback(() => {
    if (!selectedDj) return;
    if (effectiveAmount <= 0) {
      Alert.alert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    if (wallet.balance < effectiveAmount) {
      Alert.alert(
        "Solde insuffisant",
        `Votre solde est de ${wallet.balance}€. Rechargez votre portefeuille.`,
        [
          { text: "Annuler", style: "cancel" },
          { text: "Recharger", onPress: openStripeModal },
        ]
      );
      return;
    }
    const success = sendTip(selectedDj.id, effectiveAmount, message);
    if (success) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      sendBtnScale.value = withSequence(
        withSpring(0.9, { damping: 8 }),
        withSpring(1.08, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      setLastSentSuccess(true);
      setMessage("");
      setTimeout(() => setLastSentSuccess(false), 2000);
    }
  }, [selectedDj, effectiveAmount, wallet.balance, sendTip, message, sendBtnScale, openStripeModal]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const liveDjs = djs.filter((d) => d.isLive);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: topPadding + 12,
              paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.appName, { color: colors.gold }]}>MONEY PULL-UP</Text>
              <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
                Envoyez des tips en direct
              </Text>
            </View>
            <View style={styles.headerRight}>
              {/* Theme toggle */}
              <TouchableOpacity
                onPress={() => {
                  toggleTheme();
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[styles.themeToggle, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}
              >
                <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? colors.gold : colors.violet} />
              </TouchableOpacity>
              {/* Wallet */}
              <TouchableOpacity
                onPress={openStripeModal}
                style={[styles.walletPill, { backgroundColor: colors.glassBackground, borderColor: colors.gold }]}
              >
                <Feather name="credit-card" size={14} color={colors.gold} />
                <Text style={[styles.walletBalance, { color: colors.gold }]}>
                  {wallet.balance.toFixed(2)}€
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DJ Selector */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DJ EN DIRECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.djScroll}>
            {liveDjs.map((dj) => {
              const isSelected = selectedDj?.id === dj.id;
              return (
                <TouchableOpacity
                  key={dj.id}
                  onPress={() => setSelectedDj(dj)}
                  activeOpacity={0.8}
                >
                  <GlassCard
                    style={[
                      styles.djCard,
                      { borderColor: isSelected ? colors.primary : colors.glassBorder },
                    ]}
                    borderColor={isSelected ? colors.primary : colors.glassBorder}
                    intensity={isSelected ? 60 : 35}
                  >
                    <View style={[styles.liveBadge, { backgroundColor: colors.neonPink }]}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <Text style={styles.djAvatar}>{dj.avatar}</Text>
                    <Text style={[styles.djName, { color: isSelected ? colors.primary : colors.foreground }]} numberOfLines={1}>
                      {dj.name}
                    </Text>
                    <Text style={[styles.djGenre, { color: colors.mutedForeground }]}>{dj.genre}</Text>
                    {dj.totalTipsToday > 0 && (
                      <Text style={[styles.djTips, { color: colors.gold }]}>{dj.totalTipsToday}€ ce soir</Text>
                    )}
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Selected DJ banner */}
          {selectedDj && (
            <GlassCard style={styles.selectedDjBanner}>
              <MaterialCommunityIcons name="music-circle" size={20} color={colors.violet} />
              <Text style={[styles.selectedDjText, { color: colors.foreground }]}>{selectedDj.name}</Text>
              <View style={[styles.liveIndicator, { backgroundColor: colors.neonPink }]}>
                <Text style={styles.liveIndicatorText}>LIVE</Text>
              </View>
            </GlassCard>
          )}

          {/* Tip amount */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>VOTRE TIP</Text>
          <Text style={[styles.bigAmount, { color: colors.primary }]}>
            {effectiveAmount > 0 ? `${effectiveAmount}€` : "0€"}
          </Text>

          <View style={styles.tipsRow}>
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
                color={BUTTON_COLORS[i]}
              />
            ))}
          </View>

          {/* Custom amount */}
          <View style={styles.bottomActionsRow}>
            <TouchableOpacity
              onPress={() => setShowCustom((v) => !v)}
              style={[
                styles.enterAmountBtn,
                { backgroundColor: showCustom ? colors.violet + "33" : colors.glassBackground, borderColor: showCustom ? colors.violet : colors.glassBorder },
              ]}
            >
              <MaterialCommunityIcons name="calculator" size={16} color={showCustom ? colors.violet : colors.mutedForeground} />
              <Text style={[styles.enterAmountText, { color: showCustom ? colors.violet : colors.foreground }]}>
                Montant libre
              </Text>
            </TouchableOpacity>
            {showCustom && (
              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                style={[
                  styles.customInput,
                  { backgroundColor: colors.glassBackground, color: colors.foreground, borderColor: colors.glassBorder },
                ]}
              />
            )}
          </View>

          {/* Message */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message pour le DJ... (optionnel)"
            placeholderTextColor={colors.mutedForeground}
            maxLength={60}
            style={[
              styles.messageInput,
              { backgroundColor: colors.glassBackground, color: colors.foreground, borderColor: colors.glassBorder },
            ]}
          />

          {/* Send button */}
          <Animated.View style={sendBtnStyle}>
            <TouchableOpacity
              onPress={handleSendTip}
              disabled={!selectedDj || effectiveAmount <= 0}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: lastSentSuccess ? colors.neonGreen : !selectedDj || effectiveAmount <= 0 ? colors.muted : colors.neonPink,
                  shadowColor: lastSentSuccess ? colors.neonGreen : colors.neonPink,
                },
              ]}
              activeOpacity={0.85}
            >
              <Feather name={lastSentSuccess ? "check" : "zap"} size={20} color={lastSentSuccess ? "#000" : "#fff"} />
              <Text style={[styles.sendBtnText, { color: lastSentSuccess ? "#000" : "#fff" }]}>
                {lastSentSuccess ? "TIP ENVOYÉ !" : "SEND TIP"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {wallet.balance < 5 && (
            <TouchableOpacity
              onPress={openStripeModal}
              style={[styles.rechargeBar, { backgroundColor: colors.glassBackground, borderColor: colors.gold }]}
            >
              <Feather name="alert-circle" size={14} color={colors.gold} />
              <Text style={[styles.rechargeText, { color: colors.gold }]}>Solde faible — Recharger</Text>
              <Feather name="chevron-right" size={14} color={colors.gold} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <StripeModal visible={isStripeModalVisible} onClose={closeStripeModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  appName: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  tagline: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  themeToggle: {
    width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  walletPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  walletBalance: { fontSize: 14, fontFamily: "Inter_700Bold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 12 },
  djScroll: { gap: 12, paddingRight: 20, marginBottom: 16 },
  djCard: { width: 128, padding: 14, alignItems: "center", gap: 4, position: "relative" },
  liveBadge: { position: "absolute", top: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  djAvatar: { fontSize: 32, marginBottom: 4 },
  djName: { fontSize: 11, fontFamily: "Inter_700Bold", textAlign: "center" },
  djGenre: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  djTips: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  selectedDjBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, marginBottom: 24 },
  selectedDjText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  liveIndicator: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveIndicatorText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  bigAmount: { fontSize: 64, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 20, letterSpacing: -2 },
  tipsRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 20 },
  bottomActionsRow: { flexDirection: "row", gap: 12, marginBottom: 16, alignItems: "center" },
  enterAmountBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  enterAmountText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  customInput: { flex: 1, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  messageInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18, borderRadius: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 8, marginBottom: 14 },
  sendBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  rechargeBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  rechargeText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
});
