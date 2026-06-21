import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { GlowBackground } from "@/components/GlowBackground";
import { useColors } from "@/hooks/useColors";
import { firebaseAuth, firestore, isFirebaseConfigured } from "@/lib/firebase";

interface TipRecord {
  id: string;
  djName: string;
  amountCents: number;
  message?: string;
  status: string;
  createdAt: { toDate?: () => Date } | null;
}

const STATUS_COLOR: Record<string, string> = {
  requires_capture: "#F59E0B",
  captured: "#22C55E",
  cancelled: "#EF4444",
  awaiting_payment: "#6B7280",
};

const STATUS_LABEL: Record<string, string> = {
  requires_capture: "En attente",
  captured: "Accepté",
  cancelled: "Refusé",
  awaiting_payment: "En cours",
};

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) { setLoading(false); return; }
    return onAuthStateChanged(firebaseAuth(), (user) => setUid(user?.uid ?? null));
  }, []);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) { setLoading(false); return; }
    const q = query(
      collection(firestore(), "tips"),
      where("fanUid", "==", uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setTips(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TipRecord, "id">) })),
      );
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  const topPadding = (Platform.OS as string) === "web" ? 67 : insets.top;
  const total = tips.filter((t) => t.status === "captured").reduce((s, t) => s + t.amountCents, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPadding + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Mes Tips</Text>

        {/* Summary banner */}
        {tips.length > 0 && (
          <LinearGradient
            colors={["#2A0060", "#4A12A0", "#2A0060"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View style={styles.bannerStat}>
              <Text style={styles.bannerValue}>{tips.length}</Text>
              <Text style={styles.bannerLabel}>Tips envoyés</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerStat}>
              <Text style={styles.bannerValue}>{(total / 100).toFixed(0)}€</Text>
              <Text style={styles.bannerLabel}>Total accepté</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerStat}>
              <Text style={styles.bannerValue}>
                {tips.filter((t) => t.status === "captured").length}
              </Text>
              <Text style={styles.bannerLabel}>Acceptés</Text>
            </View>
          </LinearGradient>
        )}

        {/* List */}
        {loading ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Chargement…</Text>
          </GlassCard>
        ) : tips.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <MaterialCommunityIcons name="cash-remove" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucun tip envoyé</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Scannez un QR code ou allez dans l'onglet Fan pour envoyer votre premier tip.
            </Text>
          </GlassCard>
        ) : (
          <View style={styles.list}>
            {tips.map((tip) => {
              const color = STATUS_COLOR[tip.status] ?? "#6B7280";
              const label = STATUS_LABEL[tip.status] ?? tip.status;
              const date = tip.createdAt?.toDate?.();
              return (
                <GlassCard key={tip.id} style={styles.item}>
                  <View style={[styles.amountBadge, { backgroundColor: color + "22", borderColor: color }]}>
                    <Text style={[styles.amountText, { color }]}>
                      {(tip.amountCents / 100).toFixed(0)}€
                    </Text>
                  </View>

                  <View style={styles.itemBody}>
                    <Text style={[styles.djName, { color: colors.foreground }]} numberOfLines={1}>
                      {tip.djName || "DJ"}
                    </Text>
                    {tip.message ? (
                      <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={1}>
                        "{tip.message}"
                      </Text>
                    ) : null}
                    {date ? (
                      <Text style={[styles.date, { color: colors.mutedForeground }]}>
                        {date.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    ) : null}
                  </View>

                  <View style={[styles.statusPill, { backgroundColor: color + "22", borderColor: color }]}>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={[styles.statusLabel, { color }]}>{label}</Text>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 18 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 20 },

  banner: {
    flexDirection: "row",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  bannerStat: { flex: 1, alignItems: "center", gap: 4 },
  bannerValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  bannerLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", textAlign: "center" },
  bannerDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.15)" },

  emptyCard: { alignItems: "center", gap: 12, paddingVertical: 48, paddingHorizontal: 24, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  list: { gap: 10 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },

  amountBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  amountText: { fontSize: 16, fontFamily: "Inter_700Bold" },

  itemBody: { flex: 1, gap: 3 },
  djName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  message: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  date: { fontSize: 11, fontFamily: "Inter_400Regular" },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
