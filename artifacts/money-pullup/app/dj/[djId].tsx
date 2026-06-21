import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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

import { BookingModal } from "@/components/BookingModal";
import { GlassCard } from "@/components/GlassCard";
import { GlowBackground } from "@/components/GlowBackground";
import { RatingModal } from "@/components/RatingModal";
import { TipButton } from "@/components/TipButton";
import { useColors } from "@/hooks/useColors";
import { useTipCheckout } from "@/hooks/useTipCheckout";
import { subscribeDjProfile, type DjProfile } from "@/lib/djFirestore";
import { isFirebaseConfigured } from "@/lib/firebase";

const PRESET_AMOUNTS = [2, 5, 10, 20];

export default function DjFanPage() {
  const { djId } = useLocalSearchParams<{ djId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tipCheckout = useTipCheckout();

  const [dj, setDj] = useState<DjProfile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  useEffect(() => {
    if (!djId || !isFirebaseConfigured()) return;
    return subscribeDjProfile(djId, (profile) => {
      if (profile === null) setLoadError(true);
      else setDj(profile);
    });
  }, [djId]);

  const handleSend = useCallback(async () => {
    if (!djId || selectedAmount <= 0) return;
    try {
      const outcome = await tipCheckout(djId, selectedAmount, message);
      if (outcome === "authorized") {
        btnScale.value = withSequence(
          withSpring(0.88, { damping: 8 }),
          withSpring(1.1, { damping: 8 }),
          withSpring(1, { damping: 10 }),
        );
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSent(true);
        setMessage("");
        setTimeout(() => setSent(false), 4000);
      }
    } catch (e) {
      Alert.alert("Paiement impossible", e instanceof Error ? e.message : "Réessayez plus tard.");
    }
  }, [djId, selectedAmount, message, tipCheckout, btnScale]);

  const djName = dj?.name ?? (djId ?? "DJ");
  const isLive = dj?.isLive ?? false;
  const canTip = dj?.chargesEnabled && dj?.payoutsEnabled;
  const ratingAvg = dj?.ratingAvg ?? 0;
  const ratingCount = dj?.ratingCount ?? 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Money Pull Up",
          headerStyle: { backgroundColor: "#130028" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 4 }}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <GlowBackground />
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: 16, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* DJ banner */}
          <LinearGradient
            colors={["#2A0060", "#4A12A0", "#2A0060"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.djBanner}
          >
            <MaterialCommunityIcons name="music-circle" size={28} color="rgba(255,255,255,0.7)" />
            <View style={{ flex: 1 }}>
              <Text style={styles.djName}>{djName.toUpperCase()}</Text>
              {ratingCount > 0 && (
                <View style={styles.ratingRow}>
                  <FontAwesome name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {ratingAvg}/5 · {ratingCount} avis
                  </Text>
                </View>
              )}
              {isLive && (
                <View style={styles.liveRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>EN DIRECT</Text>
                </View>
              )}
            </View>
            {!isLive && (
              <View style={[styles.offlinePill]}>
                <Text style={styles.offlineText}>OFFLINE</Text>
              </View>
            )}
          </LinearGradient>

          {loadError && (
            <GlassCard style={styles.errorCard}>
              <Feather name="alert-circle" size={20} color="#EF4444" />
              <Text style={[styles.errorText, { color: colors.foreground }]}>
                DJ introuvable. Vérifiez le lien ou le QR code.
              </Text>
            </GlassCard>
          )}

          {!loadError && (
            <>
              {!canTip && dj !== null && (
                <GlassCard style={[styles.errorCard, { borderColor: "#F59E0B" }]}>
                  <Feather name="clock" size={18} color="#F59E0B" />
                  <Text style={[styles.errorText, { color: colors.foreground }]}>
                    Ce DJ n'a pas encore activé les paiements Stripe.
                  </Text>
                </GlassCard>
              )}

              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                CHOISISSEZ VOTRE TIP
              </Text>

              <View style={styles.coinsRow}>
                {PRESET_AMOUNTS.map((amt) => (
                  <TipButton
                    key={amt}
                    amount={amt}
                    isSelected={selectedAmount === amt}
                    onPress={(a) => {
                      setSelectedAmount(a);
                      if (Platform.OS !== "web") Haptics.selectionAsync();
                    }}
                    color="#7C3AED"
                    highlightColor="#9F5AED"
                    shadowColor="#3A0080"
                  />
                ))}
              </View>

              {/* Amount display */}
              <View style={[styles.amountBox, { backgroundColor: colors.glassBackground, borderColor: colors.primary }]}>
                <Text style={[styles.amountValue, { color: colors.primary }]}>
                  {selectedAmount} €
                </Text>
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
              <Animated.View style={btnStyle}>
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!canTip || selectedAmount <= 0}
                  activeOpacity={0.85}
                  style={[
                    styles.sendBtn,
                    { backgroundColor: sent ? "#22C55E" : (!canTip ? "#444" : "#EE0033") },
                  ]}
                >
                  <Feather name={sent ? "check-circle" : "zap"} size={22} color="#fff" />
                  <Text style={styles.sendBtnText}>
                    {sent ? "ENVOYÉ !" : `ENVOYER ${selectedAmount}€`}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Pending notice */}
              {sent && (
                <GlassCard style={[styles.pendingCard, { borderColor: "#F59E0B" }]} borderColor="#F59E0B">
                  <MaterialCommunityIcons name="clock-check-outline" size={18} color="#F59E0B" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pendingTitle, { color: colors.foreground }]}>
                      Tip envoyé à {djName}
                    </Text>
                    <Text style={styles.pendingSub}>En attente d'acceptation par le DJ</Text>
                  </View>
                </GlassCard>
              )}

              {/* Secondary actions */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  onPress={() => setBookingOpen(true)}
                  style={[styles.secondaryBtn, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}
                >
                  <MaterialCommunityIcons name="calendar-check" size={18} color={colors.primary} />
                  <Text style={[styles.secondaryText, { color: colors.foreground }]}>Réserver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRatingOpen(true)}
                  style={[styles.secondaryBtn, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}
                >
                  <FontAwesome name="star" size={16} color="#FFD700" />
                  <Text style={[styles.secondaryText, { color: colors.foreground }]}>Noter</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {djId && (
        <>
          <BookingModal visible={bookingOpen} onClose={() => setBookingOpen(false)} djId={djId} djName={djName} />
          <RatingModal visible={ratingOpen} onClose={() => setRatingOpen(false)} djId={djId} djName={djName} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 18 },

  djBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
  },
  djName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1.5 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  ratingText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)" },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF0055" },
  liveText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#FF6699", letterSpacing: 2 },
  offlinePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.12)" },
  offlineText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.5)", letterSpacing: 1 },

  errorCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, marginBottom: 16 },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },

  sectionLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 3, textAlign: "center", marginBottom: 16 },

  coinsRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 18 },

  amountBox: {
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 18,
    alignItems: "center",
  },
  amountValue: { fontSize: 52, fontFamily: "Inter_700Bold", letterSpacing: -1 },

  messageInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },

  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#EE0033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  sendBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },

  pendingCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  pendingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  pendingSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B", marginTop: 2 },

  secondaryActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
