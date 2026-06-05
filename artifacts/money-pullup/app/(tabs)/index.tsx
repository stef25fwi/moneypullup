import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
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
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AmountChip3D } from "@/components/AmountChip3D";
import { GlowBackground } from "@/components/GlowBackground";
import { StripeModal } from "@/components/StripeModal";
import { useTips } from "@/contexts/TipsContext";

// ─── Design tokens (PRD palette) ─────────────────────────────────────────────
const C = {
  bgCard: "#0C0A15",
  bgCardPurple: "#1D0531",
  neonPink: "#FF1B8D",
  hotPink: "#EF167F",
  electricBlue: "#008BEA",
  neonPurple: "#8D2CFF",
  darkPurpleBorder: "#3B1452",
  white: "#FFFFFF",
  textSoft: "#C9C3D8",
  textMuted: "#8D879D",
};

const PRESET_AMOUNTS = [5, 10, 15, 20];

// ─── Pulsing glow wrapper ────────────────────────────────────────────────────
function PulseGlow({ color, children }: { color: string; children: React.ReactNode }) {
  const glow = useSharedValue(0.45);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ shadowOpacity: glow.value }));
  return (
    <Animated.View
      style={[
        { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: 28, elevation: 10 },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ─── DJ Hero card ────────────────────────────────────────────────────────────
function DjHeroCard({ dj, onPress }: { dj: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.heroCard}>
      {/* Background art */}
      <LinearGradient
        colors={["#1A0340", "#0D0128", "#200540"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Side light effects */}
      <View style={styles.heroGlowLeft} />
      <View style={styles.heroGlowRight} />

      {/* Content */}
      <View style={styles.heroContent}>
        {/* LIVE badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* DJ avatar */}
        <View style={styles.djAvatarWrap}>
          <LinearGradient
            colors={["#FF1B8D", "#8D2CFF"]}
            style={styles.djAvatarRing}
          >
            <View style={styles.djAvatarInner}>
              <Text style={styles.djEmoji}>{dj?.avatar ?? "🎧"}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* DJ info */}
        <View style={styles.djInfo}>
          <Text style={styles.djLabel}>DJ</Text>
          <Text style={styles.djName} numberOfLines={1}>
            {(dj?.name ?? "MASTER BEAT").toUpperCase()}
          </Text>
          {/* Equalizer bars */}
          <View style={styles.eqRow}>
            <MaterialCommunityIcons name="music" size={12} color={C.neonPink} />
            <Text style={styles.djGenre}>{dj?.genre ?? "House • Techno • Live Set"}</Text>
          </View>
        </View>

        <Feather name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
      </View>

      {/* Stats block */}
      <View style={styles.statsBlock}>
        <View style={styles.statItem}>
          <Feather name="heart" size={14} color={C.neonPink} />
          <Text style={styles.statValue}>12.5K</Text>
          <Text style={styles.statLabel}>Fans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Feather name="users" size={14} color={C.neonPink} />
          <Text style={styles.statValue}>340</Text>
          <Text style={styles.statLabel}>En live</Text>
        </View>
      </View>

      {/* Bottom overlay */}
      <LinearGradient
        colors={["transparent", "rgba(3,2,10,0.7)"]}
        style={styles.heroBottomOverlay}
        pointerEvents="none"
      />
    </TouchableOpacity>
  );
}

// ─── Neon amount panel ───────────────────────────────────────────────────────
function NeonAmountPanel({ amount }: { amount: number }) {
  const displayText = amount > 0 ? `${amount} €` : "0 €";
  return (
    <PulseGlow color={C.neonPink}>
      <View style={styles.amountPanel}>
        <Text style={styles.amountText}>{displayText}</Text>
      </View>
    </PulseGlow>
  );
}

// ─── Premium action button ───────────────────────────────────────────────────
function PremiumActionButton({
  label,
  icon,
  onPress,
  variant,
  disabled,
  success,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  variant: "libre" | "send" | "recharge";
  disabled?: boolean;
  success?: boolean;
}) {
  const scale = useSharedValue(1);
  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (variant === "send") {
    return (
      <Animated.View style={[styles.sendBtnWrap, animStyle]}>
        <PulseGlow color={success ? "#00DD77" : C.neonPink}>
          <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={0.88}>
            <LinearGradient
              colors={
                success
                  ? ["#00BB55", "#00DD66", "#009944"]
                  : disabled
                  ? ["#2A1540", "#1E0F30", "#2A1540"]
                  : ["#ED1581", "#FF1B8D", "#E90F74"]
              }
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.sendBtn}
            >
              <Feather
                name={success ? "check-circle" : (icon as any)}
                size={22}
                color={disabled ? "#555" : "#FFF"}
              />
              <Text style={[styles.sendBtnLabel, disabled && { color: "#555" }]}>
                {success ? "ENVOYÉ !" : label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </PulseGlow>
      </Animated.View>
    );
  }

  const borderColor = variant === "libre" ? "rgba(183,34,156,0.75)" : "rgba(0,139,234,0.85)";
  const bgColor = variant === "libre" ? "rgba(10,6,19,0.4)" : "rgba(5,10,20,0.42)";
  const iconColor = variant === "libre" ? C.neonPink : C.electricBlue;

  return (
    <Animated.View style={[styles.sideBtn, animStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[styles.sideBtnInner, { backgroundColor: bgColor, borderColor }]}
      >
        <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
        {label.split("\n").map((line, i) => (
          <Text key={i} style={styles.sideBtnLabel}>{line}</Text>
        ))}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function FanScreen() {
  const insets = useSafeAreaInsets();
  const { wallet, djs, selectedDj, setSelectedDj, sendTip, openStripeModal, isStripeModalVisible, closeStripeModal } = useTips();

  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [showDjPicker, setShowDjPicker] = useState(false);
  const [lastSentSuccess, setLastSentSuccess] = useState(false);
  const [lastSentDjName, setLastSentDjName] = useState("");

  const effectiveAmount = showCustom ? parseFloat(customAmount) || 0 : selectedAmount;
  const liveDjs = djs.filter((d) => d.isLive);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSendTip = useCallback(() => {
    if (!selectedDj) {
      Alert.alert("Aucun DJ sélectionné", "Veuillez choisir un DJ.");
      return;
    }
    if (effectiveAmount <= 0) {
      Alert.alert("Montant invalide", "Veuillez saisir un montant valide.");
      return;
    }
    if (wallet.balance < effectiveAmount) {
      Alert.alert(
        "Solde insuffisant",
        `Votre solde est de ${wallet.balance.toFixed(2)}€.`,
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
      setLastSentSuccess(true);
      setLastSentDjName(selectedDj.name);
      setMessage("");
      setTimeout(() => setLastSentSuccess(false), 3500);
    }
  }, [selectedDj, effectiveAmount, wallet.balance, sendTip, message, openStripeModal]);

  return (
    <View style={styles.container}>
      <GlowBackground />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 6, paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Wallet pill ── */}
          <View style={styles.topBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.appTag}>MONEY PULL-UP</Text>
            </View>
            <TouchableOpacity onPress={openStripeModal}>
              <View style={styles.walletPill}>
                <MaterialCommunityIcons name="wallet" size={16} color={C.neonPink} />
                <Text style={styles.walletText}>{wallet.balance.toFixed(2)} €</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── DJ Hero Card ── */}
          <DjHeroCard dj={selectedDj} onPress={() => setShowDjPicker((v) => !v)} />

          {/* ── DJ Picker dropdown ── */}
          {showDjPicker && (
            <View style={styles.djPicker}>
              {liveDjs.length === 0 ? (
                <Text style={[styles.sectionLabel, { textAlign: "center", paddingVertical: 12 }]}>
                  Aucun DJ en live pour le moment
                </Text>
              ) : (
                liveDjs.map((dj) => {
                  const isSel = selectedDj?.id === dj.id;
                  return (
                    <TouchableOpacity
                      key={dj.id}
                      onPress={() => { setSelectedDj(dj); setShowDjPicker(false); }}
                      style={[styles.djPickerRow, isSel && { backgroundColor: "rgba(255,27,141,0.12)" }]}
                    >
                      <Text style={{ fontSize: 20 }}>{dj.avatar}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.djPickerName, isSel && { color: C.neonPink }]}>{dj.name}</Text>
                        <Text style={styles.djPickerGenre}>{dj.genre}</Text>
                      </View>
                      <View style={styles.livePillSmall}>
                        <Text style={styles.liveTextSmall}>LIVE</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* ── Section label ── */}
          <Text style={styles.sectionLabel}>CHOISISSEZ VOTRE TIP</Text>

          {/* ── 3D Coin buttons ── */}
          <View style={styles.coinsRow}>
            {PRESET_AMOUNTS.map((amt) => (
              <AmountChip3D
                key={amt}
                amount={amt}
                isSelected={!showCustom && selectedAmount === amt}
                onPress={(a) => {
                  setSelectedAmount(a);
                  setShowCustom(false);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
              />
            ))}
          </View>

          {/* ── VOTRE TIP label ── */}
          <Text style={[styles.sectionLabel, { marginTop: 4 }]}>VOTRE TIP</Text>

          {/* ── Neon amount panel ── */}
          <NeonAmountPanel amount={effectiveAmount} />

          {/* ── Money Pull-up info block ── */}
          <View style={styles.infoBlock}>
            <View style={styles.dollarCircle}>
              <Text style={styles.dollarSign}>$</Text>
            </View>
            <View>
              <Text style={styles.infoTitle}>Money Pull-up</Text>
              <Text style={styles.infoSub}>Le soutien qui fait monter le son.</Text>
            </View>
          </View>

          {/* ── Message input ── */}
          <View style={styles.messageWrap}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Un message pour le DJ ... (optionnel)"
              placeholderTextColor="#A9A3B8"
              maxLength={120}
              style={styles.messageInput}
            />
            <Text style={styles.charCount}>{message.length}/120</Text>
          </View>

          {/* ── Custom amount input ── */}
          {showCustom && (
            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder={`Max: ${wallet.balance.toFixed(2)}€`}
              placeholderTextColor="rgba(201,195,216,0.4)"
              keyboardType="numeric"
              style={styles.customInput}
            />
          )}

          {/* ── 3 Action buttons ── */}
          <View style={styles.actionRow}>
            <PremiumActionButton
              label={"MONTANT\nLIBRE"}
              icon="view-grid-outline"
              variant="libre"
              onPress={() => { setShowCustom((v) => !v); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
            />
            <PremiumActionButton
              label="ENVOYER LE TIP"
              icon="zap"
              variant="send"
              disabled={!selectedDj || effectiveAmount <= 0}
              success={lastSentSuccess}
              onPress={handleSendTip}
            />
            <PremiumActionButton
              label="RECHARGER"
              icon="wallet-plus"
              variant="recharge"
              onPress={openStripeModal}
            />
          </View>

          {/* ── Success banner ── */}
          {lastSentSuccess && (
            <View style={styles.successBanner}>
              <MaterialCommunityIcons name="check-circle-outline" size={16} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.successTitle}>Tip envoyé à {lastSentDjName}</Text>
                <Text style={styles.successSub}>En attente d'acceptation par le DJ</Text>
              </View>
            </View>
          )}

          {/* Low balance warning */}
          {wallet.balance < 5 && (
            <TouchableOpacity onPress={openStripeModal} style={styles.lowBalBar}>
              <Feather name="alert-circle" size={13} color="#F59E0B" />
              <Text style={styles.lowBalText}>Solde faible — Appuyez pour recharger</Text>
              <Feather name="chevron-right" size={13} color="#F59E0B" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <StripeModal visible={isStripeModalVisible} onClose={closeStripeModal} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#03020A" },
  scroll: { paddingHorizontal: 16 },

  // Top bar
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  appTag: { fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(201,195,216,0.5)", letterSpacing: 3 },
  walletPill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: "rgba(12,10,21,0.58)", borderRadius: 28,
    borderWidth: 1, borderColor: "rgba(74,24,93,0.75)",
  },
  walletText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.white },

  // Hero card
  heroCard: {
    borderRadius: 18, overflow: "hidden", marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(52,35,74,0.55)",
    minHeight: 160,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 12,
  },
  heroGlowLeft: {
    position: "absolute", top: 0, left: 0, bottom: 0, width: "40%",
    backgroundColor: "rgba(255,27,141,0.06)",
  },
  heroGlowRight: {
    position: "absolute", top: 0, right: 0, bottom: 0, width: "35%",
    backgroundColor: "rgba(0,139,234,0.06)",
  },
  heroBottomOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60 },
  heroContent: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 10 },
  liveBadge: {
    position: "absolute", top: 12, left: 14,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#E91679", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.7 },
  djAvatarWrap: { paddingTop: 24 },
  djAvatarRing: { width: 56, height: 56, borderRadius: 28, padding: 2, alignItems: "center", justifyContent: "center" },
  djAvatarInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#1A0240", alignItems: "center", justifyContent: "center" },
  djEmoji: { fontSize: 26 },
  djInfo: { flex: 1, paddingTop: 22 },
  djLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.45)", letterSpacing: 2 },
  djName: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.white, letterSpacing: 0.8, lineHeight: 24 },
  eqRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  djGenre: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.82)", letterSpacing: 0.5 },
  statsBlock: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: "rgba(8,6,23,0.58)", borderRadius: 13,
    borderWidth: 1, borderColor: "rgba(53,22,73,0.6)",
    paddingVertical: 12, paddingHorizontal: 24, gap: 0,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statDivider: { width: 1, height: 44, backgroundColor: "#2A1938" },
  statValue: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: C.white },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textSoft },

  // DJ picker
  djPicker: {
    backgroundColor: "rgba(12,10,21,0.9)", borderRadius: 14, marginBottom: 12,
    borderWidth: 1, borderColor: C.darkPurpleBorder,
  },
  djPickerRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12 },
  djPickerName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.white },
  djPickerGenre: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.textMuted },
  livePillSmall: { backgroundColor: "#E91679", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  liveTextSmall: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  // Tip section
  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 5,
    color: "rgba(190,184,204,0.82)", textAlign: "center",
    marginBottom: 14, marginTop: 4,
  },
  coinsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 8 },

  // Amount panel
  amountPanel: {
    marginHorizontal: 2, marginBottom: 16, borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(52,32,68,0.7)",
    backgroundColor: "rgba(16,7,25,0.5)",
    paddingVertical: 18, paddingHorizontal: 20, alignItems: "center",
  },
  amountText: {
    fontSize: 58, fontFamily: "Inter_700Bold",
    color: C.neonPink,
    textShadowColor: "rgba(255,27,141,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    letterSpacing: -1,
  },

  // Info block
  infoBlock: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 12, marginBottom: 14,
  },
  dollarCircle: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: C.neonPink,
    alignItems: "center", justifyContent: "center",
  },
  dollarSign: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.neonPink },
  infoTitle: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#FFD3EC" },
  infoSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.88)" },

  // Message
  messageWrap: { marginBottom: 14, position: "relative" },
  messageInput: {
    backgroundColor: "rgba(10,6,19,0.45)", borderRadius: 15,
    borderWidth: 1, borderColor: "rgba(49,32,62,0.8)",
    paddingHorizontal: 16, paddingVertical: 14, paddingRight: 52,
    fontSize: 14, fontFamily: "Inter_400Regular", color: C.white,
  },
  charCount: {
    position: "absolute", right: 14, top: "50%",
    fontSize: 11, fontFamily: "Inter_400Regular", color: C.textSoft,
    transform: [{ translateY: -9 }],
  },

  customInput: {
    borderWidth: 1.5, borderRadius: 14, borderColor: "rgba(183,34,156,0.75)",
    backgroundColor: "rgba(10,6,19,0.45)",
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 26, fontFamily: "Inter_700Bold", color: C.white, textAlign: "center",
    marginBottom: 12,
  },

  // Action buttons
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 12 },

  sideBtn: { width: 88 },
  sideBtnInner: {
    borderWidth: 1, borderRadius: 14,
    paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 5,
    minHeight: 88,
  },
  sideBtnLabel: {
    fontSize: 10, fontFamily: "Inter_700Bold",
    color: C.white, letterSpacing: 0.8, textAlign: "center",
  },

  sendBtnWrap: { flex: 1 },
  sendBtn: {
    borderRadius: 13, paddingVertical: 20, paddingHorizontal: 10,
    alignItems: "center", justifyContent: "center", gap: 6, minHeight: 88,
  },
  sendBtnLabel: {
    fontSize: 13, fontFamily: "Inter_700Bold", color: C.white,
    letterSpacing: 1.5, textAlign: "center",
  },

  // Banners
  successBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, marginBottom: 10,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderWidth: 1, borderColor: "rgba(245,158,11,0.3)",
  },
  successTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.white },
  successSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B", marginTop: 2 },

  lowBalBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 12,
    backgroundColor: "rgba(245,158,11,0.06)",
    borderWidth: 1, borderColor: "rgba(245,158,11,0.25)",
  },
  lowBalText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", color: "#F59E0B" },
});
