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

const C = {
  neonPink: "#FF1B8D",
  electricBlue: "#008BEA",
  white: "#FFFFFF",
  textSoft: "#C9C3D8",
  textMuted: "#8D879D",
  darkPurpleBorder: "#3B1452",
};

const PRESET_AMOUNTS = [5, 10, 15, 20];

// ─── Pulsing glow ─────────────────────────────────────────────────────────────
function PulseGlow({ color, children }: { color: string; children: React.ReactNode }) {
  const glow = useSharedValue(0.5);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));
  return (
    <Animated.View
      style={[{ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: 22, elevation: 8 }, style]}
    >
      {children}
    </Animated.View>
  );
}

// ─── DJ hero card (compact) ───────────────────────────────────────────────────
function DjHeroCard({ dj, onPress }: { dj: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.heroCard}>
      <LinearGradient
        colors={["#1A0340", "#0D0128", "#20054088"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,27,141,0.04)" }]} />

      {/* Top row: LIVE badge + avatar + DJ info + chevron */}
      <View style={styles.heroRow}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* Avatar */}
        <LinearGradient colors={["#FF1B8D", "#8D2CFF"]} style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarEmoji}>{dj?.avatar ?? "🎧"}</Text>
          </View>
        </LinearGradient>

        {/* Name + genre */}
        <View style={styles.djInfo}>
          <Text style={styles.djSubLabel}>DJ</Text>
          <Text style={styles.djName} numberOfLines={1}>
            {(dj?.name ?? "MASTER BEAT").toUpperCase()}
          </Text>
          <View style={styles.genreRow}>
            <MaterialCommunityIcons name="music" size={10} color={C.neonPink} />
            <Text style={styles.djGenre} numberOfLines={1}>{dj?.genre ?? "House • Techno"}</Text>
          </View>
        </View>

        <Feather name="chevron-down" size={14} color="rgba(255,255,255,0.35)" />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Feather name="heart" size={11} color={C.neonPink} />
          <Text style={styles.statValue}>12.5K</Text>
          <Text style={styles.statLabel}>Fans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Feather name="users" size={11} color={C.neonPink} />
          <Text style={styles.statValue}>340</Text>
          <Text style={styles.statLabel}>En live</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Amount panel ─────────────────────────────────────────────────────────────
function NeonAmountPanel({ amount }: { amount: number }) {
  return (
    <PulseGlow color={C.neonPink}>
      <View style={styles.amountPanel}>
        <Text style={styles.amountText}>{amount > 0 ? `${amount} €` : "0 €"}</Text>
      </View>
    </PulseGlow>
  );
}

// ─── Premium action button ────────────────────────────────────────────────────
function ActionBtn({
  label, icon, onPress, variant, disabled, success,
}: {
  label: string; icon: string; onPress: () => void;
  variant: "libre" | "send" | "recharge"; disabled?: boolean; success?: boolean;
}) {
  const scale = useSharedValue(1);
  const tap = () => {
    scale.value = withSequence(withSpring(0.94, { damping: 8 }), withSpring(1, { damping: 10 }));
    onPress();
  };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (variant === "send") {
    return (
      <Animated.View style={[{ flex: 1 }, animStyle]}>
        <PulseGlow color={success ? "#00DD77" : C.neonPink}>
          <TouchableOpacity onPress={tap} disabled={disabled} activeOpacity={0.87}>
            <LinearGradient
              colors={
                success ? ["#00BB55", "#00CC66", "#009944"]
                  : disabled ? ["#221133", "#1A0D28"]
                  : ["#ED1581", "#FF1B8D", "#E90F74"]
              }
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.sendBtn}
            >
              <Feather name={success ? "check-circle" : (icon as any)} size={18} color={disabled ? "#555" : "#FFF"} />
              <Text style={[styles.sendBtnLabel, disabled && { color: "#555" }]}>
                {success ? "ENVOYÉ !" : label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </PulseGlow>
      </Animated.View>
    );
  }

  const isLibre = variant === "libre";
  return (
    <Animated.View style={[styles.sideBtn, animStyle]}>
      <TouchableOpacity
        onPress={tap} activeOpacity={0.85}
        style={[
          styles.sideBtnInner,
          {
            borderColor: isLibre ? "rgba(183,34,156,0.75)" : "rgba(0,139,234,0.85)",
            backgroundColor: isLibre ? "rgba(10,6,19,0.4)" : "rgba(5,10,20,0.42)",
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any} size={18}
          color={isLibre ? C.neonPink : C.electricBlue}
        />
        {label.split("\n").map((line, i) => (
          <Text key={i} style={styles.sideBtnLabel}>{line}</Text>
        ))}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FanScreen() {
  const insets = useSafeAreaInsets();
  const {
    wallet, djs, selectedDj, setSelectedDj,
    sendTip, openStripeModal, isStripeModalVisible, closeStripeModal,
  } = useTips();

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
    if (!selectedDj) { Alert.alert("Aucun DJ", "Veuillez choisir un DJ."); return; }
    if (effectiveAmount <= 0) { Alert.alert("Montant invalide", "Choisissez un montant."); return; }
    if (wallet.balance < effectiveAmount) {
      Alert.alert("Solde insuffisant", `Solde: ${wallet.balance.toFixed(2)}€`, [
        { text: "Annuler", style: "cancel" },
        { text: "Recharger", onPress: openStripeModal },
      ]);
      return;
    }
    if (sendTip(selectedDj.id, effectiveAmount, message)) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLastSentSuccess(true);
      setLastSentDjName(selectedDj.name);
      setMessage("");
      setTimeout(() => setLastSentSuccess(false), 3000);
    }
  }, [selectedDj, effectiveAmount, wallet.balance, sendTip, message, openStripeModal]);

  return (
    <View style={styles.container}>
      <GlowBackground />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 4, paddingBottom: Platform.OS === "web" ? 80 : insets.bottom + 80 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={showDjPicker || showCustom || lastSentSuccess || wallet.balance < 5}
        >
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <Text style={styles.appTag}>MONEY PULL-UP</Text>
            <TouchableOpacity onPress={openStripeModal}>
              <View style={styles.walletPill}>
                <MaterialCommunityIcons name="wallet" size={14} color={C.neonPink} />
                <Text style={styles.walletText}>{wallet.balance.toFixed(2)} €</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── DJ Hero card ── */}
          <DjHeroCard dj={selectedDj} onPress={() => setShowDjPicker((v) => !v)} />

          {/* ── DJ picker ── */}
          {showDjPicker && (
            <View style={styles.djPicker}>
              {liveDjs.length === 0
                ? <Text style={styles.emptyPicker}>Aucun DJ en live</Text>
                : liveDjs.map((dj) => {
                    const sel = selectedDj?.id === dj.id;
                    return (
                      <TouchableOpacity
                        key={dj.id}
                        onPress={() => { setSelectedDj(dj); setShowDjPicker(false); }}
                        style={[styles.djRow, sel && { backgroundColor: "rgba(255,27,141,0.1)" }]}
                      >
                        <Text style={{ fontSize: 18 }}>{dj.avatar}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.djRowName, sel && { color: C.neonPink }]}>{dj.name}</Text>
                          <Text style={styles.djRowGenre}>{dj.genre}</Text>
                        </View>
                        <View style={styles.livePillSm}><Text style={styles.liveTxtSm}>LIVE</Text></View>
                      </TouchableOpacity>
                    );
                  })}
            </View>
          )}

          {/* ── Section label ── */}
          <Text style={styles.sectionLabel}>CHOISISSEZ VOTRE TIP</Text>

          {/* ── Coins ── */}
          <View style={styles.coinsRow}>
            {PRESET_AMOUNTS.map((amt) => (
              <AmountChip3D
                key={amt}
                amount={amt}
                isSelected={!showCustom && selectedAmount === amt}
                size={58}
                onPress={(a) => {
                  setSelectedAmount(a);
                  setShowCustom(false);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
              />
            ))}
          </View>

          {/* ── VOTRE TIP ── */}
          <Text style={[styles.sectionLabel, { marginTop: 2 }]}>VOTRE TIP</Text>

          {/* ── Amount panel ── */}
          <NeonAmountPanel amount={effectiveAmount} />

          {/* ── Info block ── */}
          <View style={styles.infoRow}>
            <View style={styles.dollarCircle}>
              <Text style={styles.dollarSign}>$</Text>
            </View>
            <View>
              <Text style={styles.infoTitle}>Money Pull-up</Text>
              <Text style={styles.infoSub}>Le soutien qui fait monter le son.</Text>
            </View>
          </View>

          {/* ── Message input ── */}
          <View style={styles.msgWrap}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Message pour le DJ... (optionnel)"
              placeholderTextColor="#A9A3B8"
              maxLength={120}
              style={styles.msgInput}
            />
            <Text style={styles.charCount}>{message.length}/120</Text>
          </View>

          {/* ── Custom amount ── */}
          {showCustom && (
            <TextInput
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder={`Max: ${wallet.balance.toFixed(2)}€`}
              placeholderTextColor="rgba(201,195,216,0.35)"
              keyboardType="numeric"
              style={styles.customInput}
            />
          )}

          {/* ── 3 Action buttons ── */}
          <View style={styles.actionRow}>
            <ActionBtn
              label={"MONTANT\nLIBRE"} icon="view-grid-outline" variant="libre"
              onPress={() => { setShowCustom((v) => !v); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
            />
            <ActionBtn
              label="ENVOYER LE TIP" icon="zap" variant="send"
              disabled={!selectedDj || effectiveAmount <= 0}
              success={lastSentSuccess}
              onPress={handleSendTip}
            />
            <ActionBtn label="RECHARGER" icon="wallet-plus" variant="recharge" onPress={openStripeModal} />
          </View>

          {/* ── Success toast ── */}
          {lastSentSuccess && (
            <View style={styles.toast}>
              <MaterialCommunityIcons name="check-circle-outline" size={14} color="#F59E0B" />
              <Text style={styles.toastText}>Tip envoyé à {lastSentDjName} — en attente du DJ</Text>
            </View>
          )}

          {wallet.balance < 5 && (
            <TouchableOpacity onPress={openStripeModal} style={styles.lowBal}>
              <Feather name="alert-circle" size={12} color="#F59E0B" />
              <Text style={styles.lowBalText}>Solde faible — Recharger</Text>
              <Feather name="chevron-right" size={12} color="#F59E0B" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <StripeModal visible={isStripeModalVisible} onClose={closeStripeModal} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#03020A" },
  scroll: { paddingHorizontal: 14 },

  // Top bar
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  appTag: { fontSize: 9, fontFamily: "Inter_700Bold", color: "rgba(201,195,216,0.45)", letterSpacing: 3 },
  walletPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: "rgba(12,10,21,0.6)", borderRadius: 24,
    borderWidth: 1, borderColor: "rgba(74,24,93,0.75)",
  },
  walletText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // Hero card
  heroCard: {
    borderRadius: 16, overflow: "hidden", marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(52,35,74,0.5)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, paddingBottom: 8 },
  liveBadge: {
    position: "absolute", top: 10, left: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#E91679", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8 },
  avatarRing: { width: 44, height: 44, borderRadius: 22, padding: 2, alignItems: "center", justifyContent: "center", marginTop: 16 },
  avatarInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A0240", alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 20 },
  djInfo: { flex: 1, marginTop: 16 },
  djSubLabel: { fontSize: 9, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.4)", letterSpacing: 2.5 },
  djName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5, lineHeight: 20 },
  genreRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  djGenre: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },

  // Stats (inside hero card)
  statsRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 12, marginBottom: 10,
    backgroundColor: "rgba(8,6,23,0.5)", borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(53,22,73,0.5)",
    paddingVertical: 7,
  },
  statItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  statDivider: { width: 1, height: 28, backgroundColor: "#2A1938" },
  statValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textSoft },

  // DJ picker
  djPicker: {
    backgroundColor: "rgba(12,10,21,0.92)", borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.darkPurpleBorder,
  },
  emptyPicker: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.textMuted, textAlign: "center", paddingVertical: 10 },
  djRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  djRowName: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  djRowGenre: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.textMuted },
  livePillSm: { backgroundColor: "#E91679", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  liveTxtSm: { fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  // Labels
  sectionLabel: {
    fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 4,
    color: "rgba(190,184,204,0.8)", textAlign: "center", marginBottom: 8,
  },

  // Coins
  coinsRow: { flexDirection: "row", justifyContent: "center", gap: 4, marginBottom: 4 },

  // Amount panel
  amountPanel: {
    marginBottom: 8, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(52,32,68,0.7)",
    backgroundColor: "rgba(16,7,25,0.5)",
    paddingVertical: 10, alignItems: "center",
  },
  amountText: {
    fontSize: 44, fontFamily: "Inter_700Bold", color: C.neonPink,
    textShadowColor: "rgba(255,27,141,0.55)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14,
    letterSpacing: -1,
  },

  // Info row
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 },
  dollarCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: C.neonPink, alignItems: "center", justifyContent: "center" },
  dollarSign: { fontSize: 14, fontFamily: "Inter_700Bold", color: C.neonPink },
  infoTitle: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#FFD3EC" },
  infoSub: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },

  // Message
  msgWrap: { marginBottom: 8, position: "relative" },
  msgInput: {
    backgroundColor: "rgba(10,6,19,0.45)", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(49,32,62,0.8)",
    paddingHorizontal: 14, paddingVertical: 10, paddingRight: 50,
    fontSize: 13, fontFamily: "Inter_400Regular", color: "#fff",
  },
  charCount: {
    position: "absolute", right: 12, top: "50%",
    fontSize: 10, fontFamily: "Inter_400Regular", color: C.textSoft,
    transform: [{ translateY: -8 }],
  },
  customInput: {
    borderWidth: 1.5, borderRadius: 12, borderColor: "rgba(183,34,156,0.75)",
    backgroundColor: "rgba(10,6,19,0.45)",
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center", marginBottom: 8,
  },

  // Action buttons
  actionRow: { flexDirection: "row", gap: 7, marginBottom: 8 },
  sideBtn: { width: 80 },
  sideBtnInner: {
    borderWidth: 1, borderRadius: 12,
    paddingVertical: 12, alignItems: "center", justifyContent: "center", gap: 4, minHeight: 70,
  },
  sideBtnLabel: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8, textAlign: "center" },
  sendBtn: {
    borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8,
    alignItems: "center", justifyContent: "center", gap: 5, minHeight: 70,
  },
  sendBtnLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1.2, textAlign: "center" },

  // Toast / low bal
  toast: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 10, borderRadius: 10, marginBottom: 6,
    backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.25)",
  },
  toastText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B" },
  lowBal: {
    flexDirection: "row", alignItems: "center", gap: 7,
    padding: 10, borderRadius: 10,
    backgroundColor: "rgba(245,158,11,0.05)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)",
  },
  lowBalText: { flex: 1, fontSize: 11, fontFamily: "Inter_500Medium", color: "#F59E0B" },
});
