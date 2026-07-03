import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
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
import { GradientAmount } from "@/components/GradientAmount";
import { TipButton } from "@/components/TipButton";
import { useTips } from "@/contexts/TipsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { useTipCheckout } from "@/hooks/useTipCheckout";
import { startWalletTopUp } from "@/lib/payments";

const PRESET_AMOUNTS = [5, 10, 15, 20];

// Pink · blue · purple · pink — matches the reference coins left→right.
const COIN_CONFIG = [
  { color: "#E01E63", highlightColor: "#FF5C93", shadowColor: "#8E0033" },
  { color: "#2E86FF", highlightColor: "#7FD3FF", shadowColor: "#123C9E" },
  { color: "#7C3AED", highlightColor: "#B98CFF", shadowColor: "#3F1585" },
  { color: "#E01E63", highlightColor: "#FF5C93", shadowColor: "#8E0033" },
];

const TOP_UP_AMOUNT = 20;

export default function FanScreen() {
  const colors = useColors();
  const { toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { djs, selectedDj, setSelectedDj, wallet, addFunds } = useTips();
  const tipCheckout = useTipCheckout();

  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [lastSentSuccess, setLastSentSuccess] = useState(false);
  const [lastSentDjName, setLastSentDjName] = useState("");
  const [showDjPicker, setShowDjPicker] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);

  const sendBtnScale = useSharedValue(1);
  const sendBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendBtnScale.value }],
  }));

  const effectiveAmount = showCustom ? parseFloat(customAmount) || 0 : selectedAmount;
  const liveDjs = djs.filter((d) => d.isLive);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const BG = isDark ? "#0B0620" : "#f3eeff";

  const markSent = useCallback((djName: string) => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    sendBtnScale.value = withSequence(
      withSpring(0.88, { damping: 8 }),
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 10 }),
    );
    setLastSentSuccess(true);
    setLastSentDjName(djName);
    setMessage("");
    setTimeout(() => setLastSentSuccess(false), 3500);
  }, [sendBtnScale]);

  const handleSendTip = useCallback(async () => {
    if (!selectedDj) {
      Alert.alert("Aucun DJ sélectionné", "Choisissez un DJ avant d'envoyer un tip.");
      return;
    }
    if (effectiveAmount <= 0) {
      Alert.alert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    try {
      const outcome = await tipCheckout(selectedDj.id, effectiveAmount, message);
      if (outcome === "authorized") markSent(selectedDj.name);
    } catch (e) {
      Alert.alert("Paiement impossible", e instanceof Error ? e.message : "Réessayez plus tard.");
    }
  }, [selectedDj, effectiveAmount, message, tipCheckout, markSent]);

  const handleTopUp = useCallback(async () => {
    if (toppingUp) return;
    setToppingUp(true);
    try {
      const result = await startWalletTopUp(TOP_UP_AMOUNT);
      // Native resolves here; web redirects and credits on the return screen.
      if (result === "success") {
        addFunds(TOP_UP_AMOUNT);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      Alert.alert("Rechargement indisponible", e instanceof Error ? e.message : "Réessayez plus tard.");
    } finally {
      setToppingUp(false);
    }
  }, [toppingUp, addFunds]);

  const handleShare = useCallback(async () => {
    if (!selectedDj) {
      Alert.alert("Aucun DJ sélectionné", "Choisissez un DJ à partager.");
      return;
    }
    try {
      await Share.share({
        message: `Soutiens ${selectedDj.name} sur Money Pull Up 🎧 Envoie-lui un tip en live !`,
      });
    } catch {
      /* user dismissed the share sheet */
    }
  }, [selectedDj]);

  const handleMoneyPullUp = useCallback(() => {
    Alert.alert(
      "Money Pull-up",
      "En envoyant un tip pendant un live, ton pseudo et ton message peuvent être mis en avant à l'écran par le DJ.",
    );
  }, []);

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
          {/* ── Header: DJ identity + wallet ── */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.djIdentity}
              activeOpacity={0.85}
              onPress={() => setShowDjPicker((v) => !v)}
            >
              <View style={styles.avatarRing}>
                <Text style={styles.avatarEmoji}>{selectedDj?.avatar ?? "🎧"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.djName, { color: colors.foreground }]} numberOfLines={1}>
                    {selectedDj ? selectedDj.name.toUpperCase() : "CHOISIR UN DJ"}
                  </Text>
                  {selectedDj && (
                    <MaterialCommunityIcons name="check-decagram" size={15} color="#2E86FF" />
                  )}
                  <Feather
                    name={showDjPicker ? "chevron-up" : "chevron-down"}
                    size={15}
                    color={colors.mutedForeground}
                  />
                </View>
                {selectedDj?.isLive ? (
                  <View style={styles.subRow}>
                    <View style={styles.livePill}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <Text style={[styles.subInfo, { color: colors.mutedForeground }]} numberOfLines={1}>
                      En live maintenant
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.subInfo, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {selectedDj?.genre ?? "Appuyez pour choisir un DJ"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletCard}
              activeOpacity={0.85}
              onPress={handleTopUp}
              disabled={toppingUp}
            >
              <View style={styles.walletTop}>
                <MaterialCommunityIcons name="wallet-outline" size={16} color="#FF2D78" />
                <Text style={styles.walletBalance}>{wallet.balance.toFixed(2)}€</Text>
              </View>
              <View style={styles.walletBottom}>
                <Text style={styles.walletLabel}>Mon portefeuille</Text>
                <Feather name="chevron-right" size={12} color="rgba(255,255,255,0.6)" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Header actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => { toggleTheme(); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
              style={styles.actionCircle}
            >
              <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? "#FFD700" : "#8B5CF6"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionCircle}>
              <Feather name="share-2" size={15} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* DJ Picker */}
          {showDjPicker && (
            <GlassCard style={styles.djPicker}>
              {liveDjs.length === 0 ? (
                <Text style={[styles.djPickerEmpty, { color: colors.mutedForeground }]}>
                  Aucun DJ en live pour le moment.
                </Text>
              ) : (
                liveDjs.map((dj) => {
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
                })
              )}
            </GlassCard>
          )}

          {/* ── Section label ── */}
          <View style={styles.sectionLabelRow}>
            <Text style={styles.slash}>/////</Text>
            <Text style={styles.sectionLabel}>CHOISISSEZ VOTRE TIP</Text>
            <Text style={styles.slash}>/////</Text>
          </View>

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
                hollow
                showStar
              />
            ))}
          </View>

          {/* ── VOTRE TIP card with gradient amount ── */}
          <View style={styles.tipCard}>
            <Text style={styles.votreTip}>VOTRE TIP</Text>
            <GradientAmount value={effectiveAmount} size={104} />
            <View style={styles.thanksPill}>
              <Text style={styles.thanksText}>MERCI POUR VOTRE SOUTIEN !</Text>
              <FontAwesome name="heart" size={13} color="#FF2D78" />
            </View>
          </View>

          {/* ── Money Pull-up promo ── */}
          <TouchableOpacity style={styles.promoRow} activeOpacity={0.85} onPress={handleMoneyPullUp}>
            <View style={styles.promoIcon}>
              <FontAwesome name="dollar" size={18} color="#0A0518" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>MONEY PULL-UP</Text>
              <Text style={[styles.promoSub, { color: colors.mutedForeground }]}>
                Votre tip peut être mis en avant en live !
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* ── Message input ── */}
          <View style={[styles.messageWrap, { borderColor: isDark ? "rgba(255,255,255,0.13)" : "rgba(139,92,246,0.25)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)" }]}>
            <Feather name="message-circle" size={17} color={colors.mutedForeground} />
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Message pour le DJ... (optionnel)"
              placeholderTextColor={colors.mutedForeground}
              maxLength={60}
              style={[styles.messageInput, { color: colors.foreground }]}
            />
            <Feather name="smile" size={17} color={colors.mutedForeground} />
          </View>

          {/* ── Action buttons ── */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => { setShowCustom((v) => !v); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
              style={[styles.sideBtn, { borderColor: showCustom ? "#2E86FF" : "rgba(255,255,255,0.14)" }]}
            >
              <Feather name="plus-circle" size={20} color="#2E86FF" />
              <Text style={[styles.sideBtnLabel, { color: colors.foreground }]}>MONTANT{"\n"}LIBRE</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.sendBtnWrap, sendBtnStyle]}>
              <TouchableOpacity
                onPress={handleSendTip}
                disabled={!selectedDj || effectiveAmount <= 0}
                activeOpacity={0.85}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: lastSentSuccess
                      ? "#00BB44"
                      : !selectedDj || effectiveAmount <= 0
                      ? "#444"
                      : "#FF2D78",
                    shadowColor: lastSentSuccess ? "#00FF66" : "#FF2D78",
                  },
                ]}
              >
                <Feather name={lastSentSuccess ? "check-circle" : "zap"} size={22} color="#fff" />
                <Text style={styles.sendBtnLabel}>{lastSentSuccess ? "ENVOYÉ !" : "SEND TIP"}</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              onPress={handleTopUp}
              disabled={toppingUp}
              style={[styles.sideBtn, { borderColor: "rgba(255,255,255,0.14)" }]}
            >
              <Feather name="credit-card" size={20} color="#2E86FF" />
              <Text style={[styles.sideBtnLabel, { color: colors.foreground }]}>
                {toppingUp ? "…" : "RECHARGER"}
              </Text>
            </TouchableOpacity>
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
                  borderColor: "#2E86FF",
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

  /* Header */
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  djIdentity: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2E86FF",
    backgroundColor: "rgba(46,134,255,0.12)",
    shadowColor: "#2E86FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarEmoji: { fontSize: 26 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  djName: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: 0.5, flexShrink: 1 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  subInfo: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FF2D78", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  walletCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FF2D78",
    backgroundColor: "rgba(255,45,120,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 118,
  },
  walletTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  walletBalance: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  walletBottom: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  walletLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },

  headerActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginBottom: 8 },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  djPicker: { padding: 8, marginBottom: 14, gap: 4 },
  djPickerEmpty: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", padding: 12 },
  djPickerRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12 },
  djPickerName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  djPickerGenre: { fontSize: 11, fontFamily: "Inter_400Regular" },
  livePillSmall: { backgroundColor: "#FF2D78", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  liveTextSmall: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  /* Section label */
  sectionLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12, marginBottom: 16 },
  slash: { fontSize: 12, fontFamily: "Inter_700Bold", color: "rgba(46,134,255,0.55)", letterSpacing: 1 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 3, color: "#2E86FF", textAlign: "center" },

  coinsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 20 },

  /* VOTRE TIP card */
  tipCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(46,134,255,0.35)",
    backgroundColor: "rgba(20,10,44,0.55)",
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#2E86FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 12,
  },
  votreTip: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 4, color: "#FF2D78", marginBottom: 4 },
  thanksPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,45,120,0.4)",
    backgroundColor: "rgba(255,45,120,0.06)",
  },
  thanksText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1, color: "#fff" },

  /* Money Pull-up promo */
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.35)",
    backgroundColor: "rgba(255,215,0,0.05)",
    marginBottom: 16,
  },
  promoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
  },
  promoTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFD700", letterSpacing: 0.5 },
  promoSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  /* Message */
  messageWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  messageInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", padding: 0 },

  /* Actions */
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  sideBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  sideBtnLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.6, textAlign: "center" },
  sendBtnWrap: { flex: 1.35 },
  sendBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 9,
  },
  sendBtnLabel: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  customInput: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 14 },

  pendingBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10 },
  pendingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pendingSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B", marginTop: 2 },
});
