import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import Svg, { Defs, LinearGradient as SvgGrad, Stop, Text as SvgText } from "react-native-svg";
import {
  Alert,
  Dimensions,
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

const { width: W } = Dimensions.get("window");

// ─── Design tokens ────────────────────────────────────────────────────────────
const NEON_PINK   = "#FF1B8D";
const HOT_PINK    = "#EF167F";
const ELEC_BLUE   = "#008BEA";
const WHITE       = "#FFFFFF";
const TEXT_SOFT   = "#C9C3D8";
const TEXT_MUTED  = "#8D879D";
const DARK_BORDER = "#2D1A40";

const PRESET_AMOUNTS = [5, 10, 15, 20];

// ─── Pulsing glow wrapper ─────────────────────────────────────────────────────
function PulseGlow({ color, radius = 20, children }: { color: string; radius?: number; children: React.ReactNode }) {
  const g = useSharedValue(0.5);
  useEffect(() => {
    g.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5,  { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
  }, []);
  const s = useAnimatedStyle(() => ({ shadowOpacity: g.value }));
  return (
    <Animated.View style={[{ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: radius, elevation: 8 }, s]}>
      {children}
    </Animated.View>
  );
}

// ─── DJ Hero card ─────────────────────────────────────────────────────────────
function DjHeroCard({ dj, onPress }: { dj: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.heroCard}>

      {/* ── Glass base — transparent so background photo shows through ── */}
      <LinearGradient
        colors={["rgba(8,3,20,0.18)", "rgba(4,2,14,0.30)", "rgba(6,3,18,0.45)"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Bottom gradient for text readability ── */}
      <LinearGradient
        colors={["transparent", "rgba(3,2,12,0.72)"]}
        start={{ x: 0.5, y: 0.3 }} end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Magenta stage spotlight (top right) ── */}
      <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
        <View style={styles.heroSpotRight} />
        <View style={styles.heroSpotLeft} />
      </View>

      {/* ── Equalizer bar decorations ── */}
      <View style={styles.eqBars}>
        {[22, 14, 28, 18, 24, 12, 20].map((h, i) => (
          <View key={i} style={[styles.eqBar, { height: h, opacity: 0.35 + i * 0.04 }]} />
        ))}
      </View>

      {/* ── LIVE badge ── */}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      {/* ── Wallet button (top right inside card) ── */}
      <View style={styles.heroTopRight}>
        <Feather name="chevron-down" size={14} color="rgba(255,255,255,0.35)" />
      </View>

      {/* ── DJ text info ── */}
      <View style={styles.heroBody}>
        <Text style={styles.djSmallLabel}>DJ</Text>
        <Text style={styles.djBigName} numberOfLines={1}>
          {(dj?.name ?? "MASTER BEAT").toUpperCase().replace(/^DJ\s*/i, "")}
        </Text>
        <View style={styles.genreRow}>
          {/* Mini equalizer icon */}
          <View style={styles.eqIconWrap}>
            {[6, 9, 6, 11, 8].map((h, i) => (
              <View key={i} style={[styles.eqIconBar, { height: h }]} />
            ))}
          </View>
          <Text style={styles.genreText}>{dj?.genre ?? "House • Techno • Live Set"}</Text>
        </View>
      </View>

      {/* ── Stats bar (bottom of card) ── */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Feather name="heart" size={12} color={NEON_PINK} />
          <Text style={styles.statVal}>12.5K</Text>
          <Text style={styles.statLbl}>Fans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="account-outline" size={13} color={NEON_PINK} />
          <Text style={styles.statVal}>340</Text>
          <Text style={styles.statLbl}>En live</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Amount display with SVG gradient text ────────────────────────────────────
function AmountPanel({ amount }: { amount: number }) {
  const label = amount > 0 ? `${amount} €` : "0 €";
  const fontSize = 50;
  const svgH = fontSize + 14;
  return (
    <View style={styles.amountPanelWrap}>
      <View style={styles.amountPanel}>
        <Svg width="100%" height={svgH} style={{ overflow: "visible" }}>
          <Defs>
            <SvgGrad id="tipGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0"   stopColor="#FF9EDA" stopOpacity="1" />
              <Stop offset="0.5" stopColor="#FF3FA0" stopOpacity="1" />
              <Stop offset="1"   stopColor="#EF167F" stopOpacity="1" />
            </SvgGrad>
          </Defs>
          <SvgText
            fill="url(#tipGrad)"
            fontSize={fontSize}
            fontWeight="700"
            fontFamily="Inter_700Bold"
            x="50%"
            y={svgH - 4}
            textAnchor="middle"
            letterSpacing="-1"
          >
            {label}
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({
  label, icon, onPress, variant, disabled, success,
}: {
  label: string; icon: string; onPress: () => void;
  variant: "libre" | "send" | "recharge"; disabled?: boolean; success?: boolean;
}) {
  const scale = useSharedValue(1);
  const tap = () => {
    scale.value = withSequence(withSpring(0.93, { damping: 8 }), withSpring(1, { damping: 10 }));
    onPress();
  };
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (variant === "send") {
    const mainColor = success ? "#00CC55" : disabled ? "#2A1540" : NEON_PINK;
    return (
      <Animated.View style={[{ flex: 1 }, anim]}>
        <PulseGlow color={success ? "#00CC55" : NEON_PINK} radius={24}>
          <TouchableOpacity onPress={tap} disabled={disabled} activeOpacity={0.87}>
            <LinearGradient
              colors={success ? ["#00AA44","#00CC55","#009944"] : disabled ? ["#221133","#1A0D28"] : ["#D91279","#FF1B8D","#E8127A"]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={styles.sendBtn}
            >
              <Feather name={success ? "check-circle" : (icon as any)} size={17} color={disabled ? "#555" : WHITE} />
              <Text style={[styles.sendBtnTxt, disabled && { color: "#555" }]}>
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
    <Animated.View style={[styles.sideBtn, anim]}>
      <TouchableOpacity onPress={tap} activeOpacity={0.85}
        style={[styles.sideBtnInner, {
          borderColor: isLibre ? "rgba(255,27,141,0.65)" : "rgba(0,139,234,0.75)",
          backgroundColor: "rgba(8,5,18,0.75)",
        }]}
      >
        <MaterialCommunityIcons name={icon as any} size={20} color={isLibre ? NEON_PINK : ELEC_BLUE} />
        {label.split("\n").map((l, i) => (
          <Text key={i} style={styles.sideBtnTxt}>{l}</Text>
        ))}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FanScreen() {
  const insets = useSafeAreaInsets();
  const { wallet, djs, selectedDj, setSelectedDj, sendTip, openStripeModal, isStripeModalVisible, closeStripeModal } = useTips();

  const [selectedAmount, setSelectedAmount]   = useState<number>(10);
  const [customAmount,   setCustomAmount]     = useState("");
  const [message,        setMessage]          = useState("");
  const [showCustom,     setShowCustom]       = useState(false);
  const [showDjPicker,   setShowDjPicker]     = useState(false);
  const [lastSent,       setLastSent]         = useState(false);
  const [lastSentName,   setLastSentName]     = useState("");

  const effectiveAmount = showCustom ? parseFloat(customAmount) || 0 : selectedAmount;
  const liveDjs = djs.filter((d) => d.isLive);
  const topPad  = Platform.OS === "web" ? 67 : insets.top;

  const handleSend = useCallback(() => {
    if (!selectedDj) { Alert.alert("Aucun DJ", "Choisissez un DJ."); return; }
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
      setLastSent(true); setLastSentName(selectedDj.name); setMessage("");
      setTimeout(() => setLastSent(false), 3000);
    }
  }, [selectedDj, effectiveAmount, wallet.balance, sendTip, message, openStripeModal]);

  return (
    <View style={styles.root}>
      <GlowBackground />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scroll, {
            paddingTop: topPad + 6,
            paddingBottom: Platform.OS === "web" ? 130 : insets.bottom + 100,
          }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled
        >

          {/* ── Wallet pill (top right) ── */}
          <View style={styles.topRow}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={openStripeModal}>
              <View style={styles.walletPill}>
                <MaterialCommunityIcons name="wallet-outline" size={14} color={NEON_PINK} />
                <Text style={styles.walletTxt}>{wallet.balance.toFixed(2)} €</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── DJ Hero card ── */}
          <DjHeroCard dj={selectedDj} onPress={() => setShowDjPicker((v) => !v)} />

          {/* ── DJ picker ── */}
          {showDjPicker && (
            <View style={styles.djPicker}>
              {liveDjs.length === 0
                ? <Text style={styles.noDj}>Aucun DJ en live pour le moment</Text>
                : liveDjs.map((dj) => {
                    const sel = selectedDj?.id === dj.id;
                    return (
                      <TouchableOpacity key={dj.id}
                        onPress={() => { setSelectedDj(dj); setShowDjPicker(false); }}
                        style={[styles.djRow, sel && { backgroundColor: "rgba(255,27,141,0.1)" }]}
                      >
                        <Text style={{ fontSize: 18 }}>{dj.avatar}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.djRowName, sel && { color: NEON_PINK }]}>{dj.name}</Text>
                          <Text style={styles.djRowGenre}>{dj.genre}</Text>
                        </View>
                        <View style={styles.livePillSm}><Text style={styles.liveTxtSm}>LIVE</Text></View>
                      </TouchableOpacity>
                    );
                  })}
            </View>
          )}

          {/* ── CHOISISSEZ VOTRE TIP ── */}
          <Text style={styles.sectionLbl}>CHOISISSEZ VOTRE TIP</Text>

          {/* ── 4 dark glass coins ── */}
          <View style={styles.coinsRow}>
            {PRESET_AMOUNTS.map((amt) => (
              <AmountChip3D
                key={amt}
                amount={amt}
                isSelected={!showCustom && selectedAmount === amt}
                size={Math.round(W * 0.155)}
                onPress={(a) => {
                  setSelectedAmount(a);
                  setShowCustom(false);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
              />
            ))}
          </View>

          {/* ── VOTRE TIP ── */}
          <Text style={[styles.sectionLbl, { marginTop: 2, marginBottom: 6 }]}>VOTRE TIP</Text>

          {/* ── Amount display ── */}
          <AmountPanel amount={effectiveAmount} />

          {/* ── Money Pull-up info ── */}
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
              placeholder="Un message pour le DJ... (optionnel)"
              placeholderTextColor="rgba(141,135,157,0.7)"
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
              success={lastSent}
              onPress={handleSend}
            />
            <ActionBtn label="RECHARGER" icon="wallet-plus" variant="recharge" onPress={openStripeModal} />
          </View>

          {/* ── Success toast ── */}
          {lastSent && (
            <View style={styles.toast}>
              <MaterialCommunityIcons name="check-circle-outline" size={14} color="#F59E0B" />
              <Text style={styles.toastTxt}>Tip envoyé à {lastSentName}</Text>
            </View>
          )}

          {/* ── Low balance ── */}
          {wallet.balance < 5 && (
            <TouchableOpacity onPress={openStripeModal} style={styles.lowBal}>
              <Feather name="alert-circle" size={12} color="#F59E0B" />
              <Text style={styles.lowBalTxt}>Solde faible — Recharger</Text>
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
  root:   { flex: 1, backgroundColor: "#040212" },
  scroll: { paddingHorizontal: 16 },

  // ── Top ──
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  walletPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 13, paddingVertical: 8,
    backgroundColor: "rgba(10,8,20,0.72)",
    borderRadius: 24, borderWidth: 1, borderColor: "rgba(60,20,80,0.8)",
  },
  walletTxt: { fontSize: 14, fontFamily: "Inter_500Medium", color: WHITE },

  // ── Hero card ──
  heroCard: {
    borderRadius: 20, overflow: "hidden", marginBottom: 14,
    borderWidth: 1, borderColor: "rgba(180,80,255,0.22)",
    minHeight: 200,
    shadowColor: "#CC20AA", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 14,
  },
  heroSpotRight: {
    position: "absolute", top: -40, right: -40,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(200,20,120,0.28)",
  },
  heroSpotLeft: {
    position: "absolute", bottom: -20, left: -20,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(40,20,180,0.12)",
  },
  // Decorative EQ bars (background)
  eqBars: {
    position: "absolute", bottom: 52, right: 14,
    flexDirection: "row", alignItems: "flex-end", gap: 3,
  },
  eqBar: {
    width: 3, borderRadius: 2, backgroundColor: NEON_PINK,
  },
  liveBadge: {
    position: "absolute", top: 12, left: 14,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#E01679", borderRadius: 7,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: WHITE },
  liveText: { fontSize: 10, fontFamily: "Inter_700Bold", color: WHITE, letterSpacing: 0.8 },
  heroTopRight: { position: "absolute", top: 14, right: 14 },
  heroBody: { paddingLeft: 16, paddingTop: 42, paddingBottom: 8, paddingRight: 80 },
  djSmallLabel: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)", letterSpacing: 1.5,
  },
  djBigName: {
    fontSize: 30, fontFamily: "Inter_700Bold",
    color: WHITE, letterSpacing: 0.5, lineHeight: 34,
  },
  genreRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  eqIconWrap: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  eqIconBar: { width: 2, borderRadius: 1, backgroundColor: NEON_PINK },
  genreText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.82)", letterSpacing: 0.3 },
  // Stats bar inside hero
  statsBar: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 12, marginBottom: 12,
    backgroundColor: "rgba(5,3,14,0.65)",
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(45,26,64,0.8)",
    paddingVertical: 8,
  },
  statItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  statDivider: { width: 1, height: 28, backgroundColor: "rgba(45,26,64,0.9)" },
  statVal: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: WHITE },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular", color: TEXT_SOFT },

  // ── DJ picker ──
  djPicker: {
    backgroundColor: "rgba(10,6,20,0.95)", borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DARK_BORDER,
  },
  noDj: { fontSize: 12, color: TEXT_MUTED, textAlign: "center", paddingVertical: 12, fontFamily: "Inter_400Regular" },
  djRow: { flexDirection: "row", alignItems: "center", gap: 9, padding: 11, borderRadius: 12 },
  djRowName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: WHITE },
  djRowGenre: { fontSize: 10, fontFamily: "Inter_400Regular", color: TEXT_MUTED },
  livePillSm: { backgroundColor: "#E01679", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  liveTxtSm: { fontSize: 8, fontFamily: "Inter_700Bold", color: WHITE, letterSpacing: 1 },

  // ── Labels ──
  sectionLbl: {
    fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 4,
    color: "rgba(190,184,204,0.75)", textAlign: "center",
    marginBottom: 10, marginTop: 4,
  },

  // ── Coins ──
  coinsRow: { flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", marginBottom: 6 },

  // ── Amount panel ──
  amountPanelWrap: { marginBottom: 10 },
  amountPanel: {
    backgroundColor: "rgba(10,6,20,0.7)",
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(40,24,58,0.85)",
    paddingVertical: 12, paddingHorizontal: 24, alignItems: "center",
  },
  amountText: {
    fontSize: 46, fontFamily: "Inter_700Bold",
    color: NEON_PINK,
    textShadowColor: "rgba(255,27,141,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    letterSpacing: -1,
  },

  // ── Info row ──
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 10 },
  dollarCircle: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1.5, borderColor: NEON_PINK,
    alignItems: "center", justifyContent: "center",
  },
  dollarSign: { fontSize: 14, fontFamily: "Inter_700Bold", color: NEON_PINK },
  infoTitle: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#FFD3EC" },
  infoSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },

  // ── Message ──
  msgWrap: { marginBottom: 10, position: "relative" },
  msgInput: {
    backgroundColor: "rgba(8,5,16,0.6)",
    borderRadius: 13, borderWidth: 1, borderColor: "rgba(40,24,56,0.9)",
    paddingHorizontal: 14, paddingVertical: 11, paddingRight: 52,
    fontSize: 13, fontFamily: "Inter_400Regular", color: WHITE,
  },
  charCount: {
    position: "absolute", right: 13, top: "50%",
    fontSize: 10, fontFamily: "Inter_400Regular", color: TEXT_SOFT,
    transform: [{ translateY: -8 }],
  },
  customInput: {
    borderWidth: 1.5, borderRadius: 12, borderColor: "rgba(255,27,141,0.6)",
    backgroundColor: "rgba(8,5,16,0.6)",
    paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 24, fontFamily: "Inter_700Bold", color: WHITE,
    textAlign: "center", marginBottom: 10,
  },

  // ── Action buttons ──
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  sideBtn: { width: 80 },
  sideBtnInner: {
    borderWidth: 1, borderRadius: 14,
    paddingVertical: 12, alignItems: "center", justifyContent: "center", gap: 4, minHeight: 72,
  },
  sideBtnTxt: { fontSize: 9, fontFamily: "Inter_700Bold", color: WHITE, letterSpacing: 0.7, textAlign: "center" },
  sendBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: "center", justifyContent: "center", gap: 5, minHeight: 72,
  },
  sendBtnTxt: { fontSize: 12, fontFamily: "Inter_700Bold", color: WHITE, letterSpacing: 1.5, textAlign: "center" },

  // ── Toast / low bal ──
  toast: {
    flexDirection: "row", alignItems: "center", gap: 8, padding: 10,
    borderRadius: 10, marginBottom: 6,
    backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.25)",
  },
  toastTxt: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B" },
  lowBal: {
    flexDirection: "row", alignItems: "center", gap: 7, padding: 9, borderRadius: 10,
    backgroundColor: "rgba(245,158,11,0.05)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)",
  },
  lowBalTxt: { flex: 1, fontSize: 11, fontFamily: "Inter_500Medium", color: "#F59E0B" },
});
