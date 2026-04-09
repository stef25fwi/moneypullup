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

const COIN_CONFIG = [
  { color: "#E85C1A", highlightColor: "#FFA040", shadowColor: "#A02800" },
  { color: "#27A84C", highlightColor: "#6FE87D", shadowColor: "#0F5C28" },
  { color: "#1A72E8", highlightColor: "#56B8FF", shadowColor: "#0038BB" },
  { color: "#8B22CC", highlightColor: "#CC66FF", shadowColor: "#5C0099" },
];

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
  const [lastSentDjName, setLastSentDjName] = useState("");
  const [showDjPicker, setShowDjPicker] = useState(false);

  const sendBtnScale = useSharedValue(1);
  const sendBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendBtnScale.value }],
  }));

  const effectiveAmount = showCustom ? parseFloat(customAmount) || 0 : selectedAmount;
  const liveDjs = djs.filter((d) => d.isLive);

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
        withSpring(0.88, { damping: 8 }),
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
      setLastSentSuccess(true);
      setLastSentDjName(selectedDj.name);
      setMessage("");
      setTimeout(() => setLastSentSuccess(false), 3500);
    }
  }, [selectedDj, effectiveAmount, wallet.balance, sendTip, message, sendBtnScale, openStripeModal]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bgColor = isDark ? "#0d0018" : "#f3eeff";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <GlowBackground />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: topPadding + 8,
              paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar: wallet + theme toggle */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                toggleTheme();
                if (Platform.OS !== "web") Haptics.selectionAsync();
              }}
              style={[styles.themeBtn, { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }]}
            >
              <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? "#FFD700" : "#8B5CF6"} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openStripeModal}
              style={styles.walletPill}
            >
              <LinearGradient
                colors={["rgba(255,215,0,0.18)", "rgba(255,215,0,0.08)"]}
                style={styles.walletGradient}
              >
                <Feather name="credit-card" size={14} color="#FFD700" />
                <Text style={styles.walletBalance}>{wallet.balance.toFixed(2)}€</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* DJ Header Banner */}
          <TouchableOpacity onPress={() => setShowDjPicker((v) => !v)} activeOpacity={0.85}>
            <LinearGradient
              colors={isDark ? ["#4A1280", "#6A22AA", "#3A0888"] : ["#7C3AED", "#9B59B6", "#6A1FC2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.djBanner}
            >
              <MaterialCommunityIcons name="music-circle" size={22} color="rgba(255,255,255,0.7)" />
              <Text style={styles.djBannerName} numberOfLines={1}>
                {selectedDj ? selectedDj.name.toUpperCase() : "CHOISIR UN DJ"}
              </Text>
              {selectedDj?.isLive && (
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
              <Feather name={showDjPicker ? "chevron-up" : "chevron-down"} size={16} color="rgba(255,255,255,0.6)" style={{ marginLeft: "auto" }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* DJ Picker dropdown */}
          {showDjPicker && (
            <GlassCard style={styles.djPicker}>
              {liveDjs.map((dj) => {
                const isSelected = selectedDj?.id === dj.id;
                return (
                  <TouchableOpacity
                    key={dj.id}
                    onPress={() => {
                      setSelectedDj(dj);
                      setShowDjPicker(false);
                    }}
                    style={[styles.djPickerRow, isSelected && { backgroundColor: "rgba(138,43,226,0.25)" }]}
                  >
                    <Text style={styles.djPickerAvatar}>{dj.avatar}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.djPickerName, { color: isSelected ? "#CC66FF" : colors.foreground }]}>
                        {dj.name}
                      </Text>
                      <Text style={[styles.djPickerGenre, { color: colors.mutedForeground }]}>{dj.genre}</Text>
                    </View>
                    <View style={[styles.livePillSmall, { backgroundColor: "#FF2D78" }]}>
                      <Text style={styles.liveTextSmall}>LIVE</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </GlassCard>
          )}

          {/* Coin buttons */}
          <Text style={[styles.sectionLabel, { color: isDark ? "rgba(255,255,255,0.45)" : "rgba(80,0,160,0.5)" }]}>
            CHOISISSEZ VOTRE TIP
          </Text>
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

          {/* YOUR TIP label + neon amount box */}
          <Text style={[styles.yourTipLabel, { color: isDark ? "rgba(255,255,255,0.7)" : "rgba(80,0,160,0.6)" }]}>
            YOUR TIP
          </Text>

          <View style={styles.amountBoxWrapper}>
            <LinearGradient
              colors={isDark ? ["#1E0044", "#2A0060", "#180038"] : ["rgba(255,255,255,0.9)", "rgba(240,230,255,0.9)"]}
              style={styles.amountBox}
            >
              <View style={[styles.amountBorder, { borderColor: isDark ? "#FF2D78" : "#8B5CF6", shadowColor: isDark ? "#FF2D78" : "#8B5CF6" }]}>
                <Text style={[styles.amountValue, { color: isDark ? "#FF2D78" : "#8B5CF6" }]}>
                  {effectiveAmount > 0 ? `${effectiveAmount} €` : "0 €"}
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Money Pull-up logo */}
          <View style={styles.logoRow}>
            <View style={styles.dollarIconWrapper}>
              <LinearGradient colors={["#FFD700", "#FF8C00"]} style={styles.dollarCircle}>
                <Text style={styles.dollarSign}>$</Text>
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.logoMoney}>Money</Text>
              <Text style={styles.logoPullup}>Pull-up</Text>
            </View>
          </View>

          {/* Message input */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message pour le DJ... (optionnel)"
            placeholderTextColor={isDark ? "rgba(200,170,255,0.4)" : "rgba(100,0,200,0.35)"}
            maxLength={60}
            style={[
              styles.messageInput,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.65)",
                color: colors.foreground,
                borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(139,92,246,0.3)",
              },
            ]}
          />

          {/* Action buttons row */}
          <View style={styles.actionRow}>
            {/* Enter Amount */}
            <TouchableOpacity
              onPress={() => {
                setShowCustom((v) => !v);
                if (Platform.OS !== "web") Haptics.selectionAsync();
              }}
              style={styles.actionBtnWrap}
            >
              <LinearGradient
                colors={showCustom ? ["#7B22CC", "#5511AA"] : ["#3A1580", "#2A0D60"]}
                style={styles.actionBtn}
              >
                <MaterialCommunityIcons name="calculator-variant" size={18} color="#fff" />
                <Text style={styles.actionBtnLabel}>ENTER{"\n"}AMOUNT</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Send Tip */}
            <Animated.View style={[styles.actionBtnWrap, styles.sendBtnWrapper, sendBtnStyle]}>
              <TouchableOpacity
                onPress={handleSendTip}
                disabled={!selectedDj || effectiveAmount <= 0}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    lastSentSuccess
                      ? ["#39FF14", "#22C55E"]
                      : !selectedDj || effectiveAmount <= 0
                      ? ["#555", "#333"]
                      : ["#FF4466", "#CC1133"]
                  }
                  style={[styles.actionBtn, styles.sendBtnInner, {
                    shadowColor: lastSentSuccess ? "#39FF14" : "#FF2D78",
                  }]}
                >
                  <Feather name={lastSentSuccess ? "check-circle" : "zap"} size={20} color="#fff" />
                  <Text style={[styles.actionBtnLabel, styles.sendBtnText]}>
                    {lastSentSuccess ? "ENVOYÉ !" : "SEND TIP"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Recharge / Favorites */}
            <TouchableOpacity onPress={openStripeModal} style={styles.actionBtnWrap}>
              <LinearGradient colors={["#CC7A00", "#AA5500"]} style={styles.actionBtn}>
                <MaterialCommunityIcons name="heart-circle" size={18} color="#fff" />
                <Text style={styles.actionBtnLabel}>RECHARGER</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Custom amount input */}
          {showCustom && (
            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="Montant personnalisé €"
              placeholderTextColor={isDark ? "rgba(200,170,255,0.4)" : "rgba(100,0,200,0.35)"}
              keyboardType="numeric"
              style={[
                styles.customInput,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.65)",
                  color: colors.foreground,
                  borderColor: isDark ? "#8B5CF6" : "#7C3AED",
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

          {/* Low balance bar */}
          {wallet.balance < 5 && (
            <TouchableOpacity
              onPress={openStripeModal}
              style={[styles.lowBalBar, { backgroundColor: "rgba(255,215,0,0.1)", borderColor: "#FFD700" }]}
            >
              <Feather name="alert-circle" size={14} color="#FFD700" />
              <Text style={styles.lowBalText}>Solde faible — Appuyez pour recharger</Text>
              <Feather name="chevron-right" size={14} color="#FFD700" />
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
  scroll: { paddingHorizontal: 18 },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  themeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  walletPill: { borderRadius: 22, overflow: "hidden", borderWidth: 1.5, borderColor: "rgba(255,215,0,0.4)" },
  walletGradient: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9 },
  walletBalance: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFD700" },

  djBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 16, marginBottom: 10,
    shadowColor: "#8B22CC", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  djBannerName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1, flex: 1 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FF2D78", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  livePillSmall: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  liveTextSmall: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  djPicker: { padding: 8, marginBottom: 14, gap: 4 },
  djPickerRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12 },
  djPickerAvatar: { fontSize: 24 },
  djPickerName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  djPickerGenre: { fontSize: 11, fontFamily: "Inter_400Regular" },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2.5, textAlign: "center", marginTop: 12, marginBottom: 14 },

  coinsRow: { flexDirection: "row", justifyContent: "center", gap: 14, marginBottom: 20 },

  yourTipLabel: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 3, textAlign: "center", marginBottom: 12 },

  amountBoxWrapper: { marginHorizontal: 8, marginBottom: 18, borderRadius: 20, overflow: "hidden" },
  amountBox: { padding: 4 },
  amountBorder: {
    borderWidth: 2.5, borderRadius: 16, paddingVertical: 18, alignItems: "center",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 16, elevation: 12,
  },
  amountValue: { fontSize: 58, fontFamily: "Inter_700Bold", letterSpacing: -1 },

  logoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 },
  dollarIconWrapper: { shadowColor: "#FFD700", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.7, shadowRadius: 8, elevation: 6 },
  dollarCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  dollarSign: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  logoMoney: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFD700", letterSpacing: 1, lineHeight: 22 },
  logoPullup: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FF8C00", letterSpacing: 1, lineHeight: 22 },

  messageInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 14 },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  actionBtnWrap: { flex: 1 },
  sendBtnWrapper: { flex: 1.3 },
  actionBtn: { alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 14, borderRadius: 16 },
  sendBtnInner: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.7, shadowRadius: 12, elevation: 10 },
  actionBtnLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8, textAlign: "center" },
  sendBtnText: { fontSize: 12, letterSpacing: 1 },

  customInput: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 14 },

  pendingBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10 },
  pendingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pendingSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B", marginTop: 2 },

  lowBalBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 13, borderRadius: 13, borderWidth: 1 },
  lowBalText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", color: "#FFD700" },
});
