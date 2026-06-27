import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar, BOTTOM_TAB_BAR_HEIGHT } from "@/components/BottomTabBar";
import { GlassCard } from "@/components/GlassCard";
import { GlowBackground } from "@/components/GlowBackground";
import { useColors } from "@/hooks/useColors";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import {
  respondBooking,
  subscribeDjBookings,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings";

const STATUS: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: "En attente", color: "#F59E0B" },
  accepted: { label: "Acceptée", color: "#22C55E" },
  declined: { label: "Refusée", color: "#EF4444" },
  cancelled: { label: "Annulée", color: "#6B7280" },
};

export default function DjBookingsPage() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [uid, setUid] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(firebaseAuth(), (user) => setUid(user?.uid ?? null));
  }, []);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) return;
    return subscribeDjBookings(uid, setBookings, () => {});
  }, [uid]);

  const respond = useCallback(async (id: string, action: "accept" | "decline") => {
    setBusy(id);
    try {
      await respondBooking(id, action);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Erreur", e instanceof Error ? e.message : "Réessayez plus tard.");
    } finally {
      setBusy(null);
    }
  }, []);

  const pending = bookings.filter((b) => b.status === "pending");
  const past = bookings.filter((b) => b.status !== "pending");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Réservations</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + BOTTOM_TAB_BAR_HEIGHT + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 && (
          <GlassCard style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucune réservation</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Les demandes de réservation de vos fans apparaîtront ici.
            </Text>
          </GlassCard>
        )}

        {pending.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              EN ATTENTE ({pending.length})
            </Text>
            {pending.map((b) => (
              <BookingCard key={b.id} booking={b} colors={colors} busy={busy === b.id} onRespond={respond} />
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
              HISTORIQUE
            </Text>
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} colors={colors} busy={false} onRespond={respond} />
            ))}
          </>
        )}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

type Colors = ReturnType<typeof useColors>;

function BookingCard({
  booking,
  colors,
  busy,
  onRespond,
}: {
  booking: Booking;
  colors: Colors;
  busy: boolean;
  onRespond: (id: string, action: "accept" | "decline") => void;
}) {
  const st = STATUS[booking.status];
  return (
    <Animated.View entering={FadeIn.duration(200)} layout={Layout.springify()}>
      <GlassCard style={styles.card}>
        <View style={styles.cardHead}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.client, { color: colors.foreground }]}>{booking.clientName}</Text>
            <View style={styles.metaRow}>
              <Feather name="calendar" size={12} color={colors.mutedForeground} />
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{booking.eventDate}</Text>
              {booking.eventType ? (
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>· {booking.eventType}</Text>
              ) : null}
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: st.color + "22", borderColor: st.color }]}>
            <View style={[styles.dot, { backgroundColor: st.color }]} />
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        {booking.location ? (
          <Row icon="map-pin" text={booking.location} colors={colors} />
        ) : null}
        {booking.clientPhone ? <Row icon="phone" text={booking.clientPhone} colors={colors} /> : null}
        {booking.clientEmail ? <Row icon="mail" text={booking.clientEmail} colors={colors} /> : null}
        {booking.message ? (
          <Text style={[styles.message, { color: colors.mutedForeground }]}>"{booking.message}"</Text>
        ) : null}

        {booking.status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onRespond(booking.id, "decline")}
              disabled={busy}
              style={[styles.declineBtn, { borderColor: colors.glassBorder }]}
            >
              <Feather name="x" size={16} color="#EF4444" />
              <Text style={styles.declineText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRespond(booking.id, "accept")}
              disabled={busy}
              style={styles.acceptBtn}
            >
              <Feather name="check" size={16} color="#fff" />
              <Text style={styles.acceptText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

function Row({ icon, text, colors }: { icon: keyof typeof Feather.glyphMap; text: string; colors: Colors }) {
  return (
    <View style={styles.row}>
      <Feather name={icon} size={13} color={colors.mutedForeground} />
      <Text style={[styles.rowText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 16, paddingTop: 6, gap: 12 },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2 },

  empty: { alignItems: "center", gap: 12, paddingVertical: 48, paddingHorizontal: 24, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  card: { padding: 16, gap: 8 },
  cardHead: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  client: { fontSize: 15, fontFamily: "Inter_700Bold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3, flexWrap: "wrap" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },

  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  message: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic", marginTop: 2 },

  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  declineBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  declineText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
  acceptBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: "#22C55E" },
  acceptText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
