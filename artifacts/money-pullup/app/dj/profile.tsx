import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabBar, BOTTOM_TAB_BAR_HEIGHT } from "@/components/BottomTabBar";
import { GlassCard } from "@/components/GlassCard";
import { GlowBackground } from "@/components/GlowBackground";
import { useColors } from "@/hooks/useColors";
import { useDjWallet } from "@/hooks/useDjWallet";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { subscribeDjBookings } from "@/lib/bookings";
import { subscribeDjProfile, type DjProfile } from "@/lib/djFirestore";
import { subscribeDjReviews, type Review } from "@/lib/reviews";
import { generateTipStatement, type TipStatement } from "@/lib/tipFunctions";
import { subscribeReceivedTipsForDj, type StreamTip } from "@/lib/tipStream";

type SubTab = "profil" | "tips" | "justificatifs" | "verification";

const SUB_TABS: { key: SubTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "profil", label: "Profil", icon: "user" },
  { key: "tips", label: "Tips reçus", icon: "trending-up" },
  { key: "justificatifs", label: "Justificatifs", icon: "file-text" },
  { key: "verification", label: "Vérification", icon: "shield" },
];

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1571266028243-d220c9c3b7e8?q=80&w=600&auto=format&fit=crop";

export default function DjProfilePage() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const wallet = useDjWallet();

  const [tab, setTab] = useState<SubTab>("profil");
  const [djId, setDjId] = useState<string | null>(null);
  const [profile, setProfile] = useState<DjProfile | null>(null);
  const [tips, setTips] = useState<StreamTip[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eventsCount, setEventsCount] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(firebaseAuth(), (user) => setDjId(user?.uid ?? null));
  }, []);

  useEffect(() => {
    if (!djId || !isFirebaseConfigured()) return;
    const unsubProfile = subscribeDjProfile(djId, setProfile);
    const unsubTips = subscribeReceivedTipsForDj(djId, setTips, () => {});
    const unsubReviews = subscribeDjReviews(djId, setReviews, () => {});
    const unsubBookings = subscribeDjBookings(
      djId,
      (b) => setEventsCount(b.filter((x) => x.status === "accepted").length),
      () => {},
    );
    return () => {
      unsubProfile();
      unsubTips();
      unsubReviews();
      unsubBookings();
    };
  }, [djId]);

  const selectTab = useCallback((t: SubTab) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTab(t);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profil DJ</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Sub-tab selector */}
      <View style={styles.tabBar}>
        {SUB_TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => selectTab(t.key)}
              style={[
                styles.tabBtn,
                active && { backgroundColor: colors.primary + "22", borderColor: colors.primary },
              ]}
            >
              <Feather name={t.icon} size={15} color={active ? colors.primary : colors.mutedForeground} />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.primary : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + BOTTOM_TAB_BAR_HEIGHT + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === "profil" && (
          <ProfilTab
            profile={profile}
            wallet={wallet}
            reviews={reviews}
            eventsCount={eventsCount}
            colors={colors}
          />
        )}
        {tab === "tips" && (
          <TipsTab tips={tips} colors={colors} onGenerate={() => setTab("justificatifs")} />
        )}
        {tab === "justificatifs" && (
          <JustificatifsTab djId={djId} profile={profile} wallet={wallet} colors={colors} />
        )}
        {tab === "verification" && <VerificationTab profile={profile} colors={colors} />}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

type Colors = ReturnType<typeof useColors>;

/* ───────────────────────── 1. PROFIL ───────────────────────── */

function ProfilTab({
  profile,
  wallet,
  reviews,
  eventsCount,
  colors,
}: {
  profile: DjProfile | null;
  wallet: ReturnType<typeof useDjWallet>;
  reviews: Review[];
  eventsCount: number;
  colors: Colors;
}) {
  const name = profile?.name || "DJ";
  const city = profile?.city || "—";
  const bio = profile?.bio || "Aucune description pour le moment.";
  const genres = profile?.genres && profile.genres.length > 0 ? profile.genres : [];
  const avatar = profile?.avatarUrl || DEFAULT_AVATAR;
  const verified = profile?.verified ?? (profile?.chargesEnabled && profile?.payoutsEnabled);
  const ratingAvg = profile?.ratingAvg ?? 0;
  const ratingCount = profile?.ratingCount ?? 0;

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      {/* Hero card */}
      <View style={styles.heroCard}>
        <ImageBackground source={{ uri: avatar }} style={styles.heroBg} imageStyle={styles.heroImg}>
          <LinearGradient
            colors={["transparent", "rgba(13,0,24,0.85)", "#0d0018"]}
            style={styles.heroOverlay}
          />
        </ImageBackground>

        <View style={styles.heroBody}>
          <View style={styles.nameRow}>
            <Text style={[styles.djName, { color: colors.foreground }]}>{name}</Text>
            {verified && (
              <MaterialCommunityIcons name="check-decagram" size={20} color="#3B82F6" />
            )}
          </View>

          {verified && (
            <View style={[styles.pill, { backgroundColor: "#3B82F6" + "22", borderColor: "#3B82F6" }]}>
              <Feather name="check-circle" size={11} color="#3B82F6" />
              <Text style={[styles.pillText, { color: "#3B82F6" }]}>Profil vérifié</Text>
            </View>
          )}

          <View style={styles.cityRow}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.cityText, { color: colors.mutedForeground }]}>{city}</Text>
          </View>

          {genres.length > 0 && (
            <View style={styles.genreRow}>
              {genres.map((g) => (
                <View key={g} style={[styles.genrePill, { backgroundColor: colors.primary + "1A" }]}>
                  <Text style={[styles.genreText, { color: colors.primary }]}>{g}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.bio, { color: colors.mutedForeground }]}>{bio}</Text>
        </View>
      </View>

      {/* Stats */}
      <GlassCard style={styles.statsCard}>
        <Stat
          value={ratingCount > 0 ? `${ratingAvg}/5` : "—"}
          label={ratingCount > 0 ? `${ratingCount} avis` : "Note moyenne"}
          colors={colors}
          accent={colors.gold}
        />
        <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
        <Stat value={`${wallet.count}`} label="tips" colors={colors} accent={colors.neonGreen} />
        <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
        <Stat value={`${eventsCount}`} label="événements" colors={colors} accent={colors.neonPink} />
      </GlassCard>

      {/* Actions */}
      <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn}>
        <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.primaryBtnGrad}>
          <Feather name="zap" size={17} color="#fff" />
          <Text style={styles.primaryBtnText}>Envoyer un tip</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.glassBorder }]}>
        <MaterialCommunityIcons name="calendar-check" size={17} color={colors.foreground} />
        <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>Réserver</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.glassBorder }]}>
        <Feather name="message-circle" size={17} color={colors.foreground} />
        <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>Message</Text>
      </TouchableOpacity>

      {/* Infos pro */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>INFOS PRO</Text>
      <GlassCard style={styles.infoCard}>
        <InfoRow label="Statut" value={profile?.proStatus || "Non renseigné"} colors={colors} />
        <View style={[styles.rowDivider, { backgroundColor: colors.glassBorder }]} />
        <InfoRow
          label="SIRET"
          value={profile?.siretVerified ? "SIRET vérifié" : "Non vérifié"}
          colors={colors}
          ok={profile?.siretVerified}
        />
      </GlassCard>

      <View style={styles.secureRow}>
        <Feather name="lock" size={12} color={colors.mutedForeground} />
        <Text style={[styles.secureText, { color: colors.mutedForeground }]}>
          Contact via la messagerie sécurisée
        </Text>
      </View>

      {/* Reviews */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        AVIS {ratingCount > 0 ? `(${ratingCount})` : ""}
      </Text>
      {reviews.length === 0 ? (
        <GlassCard style={styles.infoCard}>
          <Text style={[styles.secureText, { color: colors.mutedForeground, textAlign: "center" }]}>
            Aucun avis pour le moment.
          </Text>
        </GlassCard>
      ) : (
        reviews.slice(0, 10).map((r) => (
          <GlassCard key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHead}>
              <Text style={[styles.reviewName, { color: colors.foreground }]}>{r.fanName}</Text>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <FontAwesome
                    key={n}
                    name={n <= r.rating ? "star" : "star-o"}
                    size={12}
                    color={n <= r.rating ? "#FFD700" : colors.mutedForeground}
                  />
                ))}
              </View>
            </View>
            {r.comment ? (
              <Text style={[styles.reviewComment, { color: colors.mutedForeground }]}>{r.comment}</Text>
            ) : null}
          </GlassCard>
        ))
      )}
    </Animated.View>
  );
}

function Stat({
  value,
  label,
  colors,
  accent,
}: {
  value: string;
  label: string;
  colors: Colors;
  accent: string;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  colors,
  ok,
}: {
  label: string;
  value: string;
  colors: Colors;
  ok?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
        {ok && <Feather name="check" size={13} color={colors.neonGreen} />}
      </View>
    </View>
  );
}

/* ───────────────────────── 2. TIPS REÇUS ───────────────────────── */

const PERIODS = ["7j", "30j", "Mois", "Tout"] as const;
type Period = (typeof PERIODS)[number];

function TipsTab({
  tips,
  colors,
  onGenerate,
}: {
  tips: StreamTip[];
  colors: Colors;
  onGenerate: () => void;
}) {
  const [period, setPeriod] = useState<Period>("30j");

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff =
      period === "7j" ? now - 7 * 864e5 : period === "30j" || period === "Mois" ? now - 30 * 864e5 : 0;
    return tips.filter((t) => t.createdAt.getTime() >= cutoff);
  }, [tips, period]);

  const brut = filtered.reduce((s, t) => s + t.amount, 0);
  const frais = Math.round(brut * 0.09);
  const net = brut - frais;
  const verse = Math.round(net * 0.85);

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PÉRIODE</Text>
      <View style={styles.periodRow}>
        {PERIODS.map((p) => {
          const active = period === p;
          return (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.periodPill,
                {
                  backgroundColor: active ? colors.primary : colors.glassBackground,
                  borderColor: active ? colors.primary : colors.glassBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: active ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stat grid */}
      <View style={styles.statGrid}>
        <StatBox icon="download" label="Brut reçu" value={`${brut} €`} tint="#3B82F6" colors={colors} />
        <StatBox icon="minus-circle" label="Frais" value={`${frais} €`} tint={colors.neonPink} colors={colors} />
        <StatBox icon="trending-up" label="Net estimé" value={`${net} €`} tint={colors.neonGreen} colors={colors} />
        <StatBox icon="check-circle" label="Versé" value={`${verse} €`} tint={colors.gold} colors={colors} />
      </View>

      {/* Table */}
      <GlassCard style={styles.tableCard}>
        <View style={[styles.tableHead, { borderBottomColor: colors.glassBorder }]}>
          <Text style={[styles.thDate, { color: colors.mutedForeground }]}>Date</Text>
          <Text style={[styles.thId, { color: colors.mutedForeground }]}>ID</Text>
          <Text style={[styles.thAmount, { color: colors.mutedForeground }]}>Montant</Text>
          <Text style={[styles.thStatus, { color: colors.mutedForeground }]}>Statut</Text>
        </View>

        {filtered.length === 0 ? (
          <Text style={[styles.tableEmpty, { color: colors.mutedForeground }]}>
            Aucun tip sur cette période.
          </Text>
        ) : (
          filtered.slice(0, 30).map((t) => (
            <View key={t.id} style={[styles.tableRow, { borderBottomColor: colors.glassBorder }]}>
              <Text style={[styles.tdDate, { color: colors.foreground }]}>
                {t.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </Text>
              <Text style={[styles.tdId, { color: colors.mutedForeground }]} numberOfLines={1}>
                TIP-{t.id.slice(0, 4).toUpperCase()}
              </Text>
              <Text style={[styles.tdAmount, { color: colors.foreground }]}>{t.amount},00 €</Text>
              <View style={styles.tdStatus}>
                <Feather name="check-circle" size={14} color={colors.neonGreen} />
              </View>
            </View>
          ))
        )}
      </GlassCard>

      <TouchableOpacity activeOpacity={0.85} onPress={onGenerate} style={styles.primaryBtn}>
        <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.primaryBtnGrad}>
          <Feather name="file-plus" size={17} color="#fff" />
          <Text style={styles.primaryBtnText}>Générer un relevé</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function StatBox({
  icon,
  label,
  value,
  tint,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  tint: string;
  colors: Colors;
}) {
  return (
    <GlassCard style={styles.statBox}>
      <View style={[styles.statBoxIcon, { backgroundColor: tint + "22" }]}>
        <Feather name={icon} size={16} color={tint} />
      </View>
      <Text style={[styles.statBoxLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.statBoxValue, { color: colors.foreground }]}>{value}</Text>
    </GlassCard>
  );
}

/* ───────────────────────── 3. JUSTIFICATIFS ───────────────────────── */

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function JustificatifsTab({
  djId,
  profile,
  wallet,
  colors,
}: {
  djId: string | null;
  profile: DjProfile | null;
  wallet: ReturnType<typeof useDjWallet>;
  colors: Colors;
}) {
  const [format, setFormat] = useState<"PDF" | "CSV">("PDF");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<TipStatement | null>(null);

  const from = useMemo(() => startOfMonth(), []);
  const to = useMemo(() => new Date(), []);

  // Live preview totals (replaced by server-authoritative figures after generate).
  const brut = result ? result.brutCents / 100 : wallet.totalReceived;
  const frais = result ? result.fraisCents / 100 : Math.round(wallet.totalReceived * 0.09);
  const net = result ? result.netCents / 100 : brut - frais;
  const count = result ? result.tipCount : wallet.count;

  const handleGenerate = useCallback(async () => {
    if (!djId) {
      Alert.alert("Indisponible", "Connectez-vous en tant que DJ pour générer un relevé.");
      return;
    }
    setGenerating(true);
    try {
      const stmt = await generateTipStatement({
        djId,
        format: format === "PDF" ? "pdf" : "csv",
        from: from.toISOString(),
        to: to.toISOString(),
      });
      setResult(stmt);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Génération impossible", e instanceof Error ? e.message : "Réessayez plus tard.");
    } finally {
      setGenerating(false);
    }
  }, [djId, format, from, to]);

  const handleDownload = useCallback(async () => {
    if (!result?.downloadUrl) return;
    try {
      await Linking.openURL(result.downloadUrl);
    } catch {
      Alert.alert("Téléchargement impossible", "Impossible d'ouvrir le document.");
    }
  }, [result]);

  const periodLabel = `${fmtFr(from)} – ${fmtFr(to)}`;

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      <GlassCard style={styles.justifCard}>
        <View style={styles.justifHead}>
          <MaterialCommunityIcons name="certificate" size={20} color={colors.gold} />
          <Text style={[styles.justifTitle, { color: colors.foreground }]}>Relevé certifié de tips</Text>
        </View>

        {/* Date range */}
        <View style={styles.dateRangeRow}>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Du</Text>
            <View style={[styles.dateBox, { borderColor: colors.glassBorder }]}>
              <Feather name="calendar" size={13} color={colors.mutedForeground} />
              <Text style={[styles.dateValue, { color: colors.foreground }]}>{fmtFr(from)}</Text>
            </View>
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Au</Text>
            <View style={[styles.dateBox, { borderColor: colors.glassBorder }]}>
              <Feather name="calendar" size={13} color={colors.mutedForeground} />
              <Text style={[styles.dateValue, { color: colors.foreground }]}>{fmtFr(to)}</Text>
            </View>
          </View>
        </View>

        {/* Format toggle */}
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 4 }]}>Format</Text>
        <View style={styles.formatRow}>
          {(["PDF", "CSV"] as const).map((f) => {
            const active = format === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => { setFormat(f); setResult(null); }}
                style={[
                  styles.formatBtn,
                  {
                    backgroundColor: active ? colors.primary + "22" : colors.glassBackground,
                    borderColor: active ? colors.primary : colors.glassBorder,
                  },
                ]}
              >
                <Feather
                  name={f === "PDF" ? "file-text" : "grid"}
                  size={14}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text style={[styles.formatText, { color: active ? colors.primary : colors.mutedForeground }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Totals */}
        <View style={[styles.totalsRow, { borderTopColor: colors.glassBorder }]}>
          <Total label="Nb de tips" value={`${count}`} colors={colors} />
          <Total label="Brut" value={`${brut} €`} colors={colors} />
          <Total label="Frais" value={`${frais} €`} colors={colors} />
          <Total label="Net" value={`${net} €`} colors={colors} />
        </View>

        {/* Generate */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGenerate}
          disabled={generating}
          style={[styles.primaryBtn, { marginTop: 4, opacity: generating ? 0.7 : 1 }]}
        >
          <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.primaryBtnGrad}>
            {generating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Feather name="file-plus" size={17} color="#fff" />
            )}
            <Text style={styles.primaryBtnText}>
              {generating ? "Génération…" : "Générer le relevé"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      {/* Generated document */}
      {result && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DOCUMENT GÉNÉRÉ</Text>
          <GlassCard style={styles.docCard}>
            <DocRow label="N° document" value={result.documentNumber} colors={colors} mono />
            <DocRow
              label="Date d'édition"
              value={new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              colors={colors}
            />
            <DocRow label="Période" value={periodLabel} colors={colors} />
            <DocRow label="DJ" value={profile?.name || "DJ"} colors={colors} />
            <DocRow label="Format" value={result.format.toUpperCase()} colors={colors} />
            <View style={styles.docStatusRow}>
              <Text style={[styles.docLabel, { color: colors.mutedForeground }]}>Statut</Text>
              <View style={[styles.certifiedPill, { backgroundColor: colors.neonGreen + "22", borderColor: colors.neonGreen }]}>
                <Feather name="check-circle" size={11} color={colors.neonGreen} />
                <Text style={[styles.certifiedText, { color: colors.neonGreen }]}>Certifié</Text>
              </View>
            </View>

            <View style={styles.qrRow}>
              <View style={styles.qrPlaceholder}>
                <MaterialCommunityIcons name="qrcode" size={48} color="#130028" />
              </View>
              <Text style={[styles.qrCaption, { color: colors.mutedForeground }]}>
                N° {result.documentNumber}
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.85} onPress={handleDownload} style={styles.primaryBtn}>
              <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.primaryBtnGrad}>
                <Feather name="download" size={17} color="#fff" />
                <Text style={styles.primaryBtnText}>Télécharger le {result.format.toUpperCase()}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.attestRow}>
              <Feather name="info" size={12} color={colors.mutedForeground} />
              <Text style={[styles.attestText, { color: colors.mutedForeground }]}>
                Ce document atteste les transactions enregistrées par la plateforme.
              </Text>
            </View>
          </GlassCard>
        </>
      )}
    </Animated.View>
  );
}

function fmtFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Total({ label, value, colors }: { label: string; value: string; colors: Colors }) {
  return (
    <View style={styles.totalItem}>
      <Text style={[styles.totalValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function DocRow({
  label,
  value,
  colors,
  mono,
}: {
  label: string;
  value: string;
  colors: Colors;
  mono?: boolean;
}) {
  return (
    <View style={styles.docRow}>
      <Text style={[styles.docLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text
        style={[
          styles.docValue,
          { color: colors.foreground },
          mono && Platform.OS === "ios" ? { fontFamily: "Menlo" } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ───────────────────────── 4. VÉRIFICATION ───────────────────────── */

function VerificationTab({ profile, colors }: { profile: DjProfile | null; colors: Colors }) {
  const profileReqs = [
    { label: "Nom d'artiste", ok: !!profile?.name },
    { label: "Ville", ok: !!profile?.city },
    { label: "Styles musicaux", ok: !!(profile?.genres && profile.genres.length > 0) },
    { label: "Bio courte", ok: !!profile?.bio },
  ];

  const payoutReqs = [
    { label: "Identité", ok: !!profile?.detailsSubmitted },
    { label: "Email", ok: !!profile?.email },
    { label: "Téléphone", ok: !!profile?.phone },
    { label: "SIRET (si pro)", ok: !!profile?.siretVerified },
    { label: "IBAN", ok: !!profile?.ibanProvided || !!profile?.payoutsEnabled },
  ];

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      <ReqCard
        icon="user"
        title="Requis pour le profil"
        reqs={profileReqs}
        colors={colors}
      />
      <ReqCard
        icon="briefcase"
        title="Requis pour les versements"
        reqs={payoutReqs}
        colors={colors}
      />

      <View style={[styles.privateBanner, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}>
        <Feather name="lock" size={14} color={colors.mutedForeground} />
        <Text style={[styles.privateText, { color: colors.mutedForeground }]}>
          Données privées non publiques
        </Text>
      </View>
    </Animated.View>
  );
}

function ReqCard({
  icon,
  title,
  reqs,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  reqs: { label: string; ok: boolean }[];
  colors: Colors;
}) {
  return (
    <GlassCard style={styles.reqCard}>
      <View style={styles.reqHead}>
        <Feather name={icon} size={16} color={colors.primary} />
        <Text style={[styles.reqTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {reqs.map((r, i) => (
        <View
          key={r.label}
          style={[
            styles.reqRow,
            i < reqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
          ]}
        >
          <Text style={[styles.reqLabel, { color: colors.foreground }]}>{r.label}</Text>
          <View
            style={[
              styles.reqBadge,
              {
                backgroundColor: (r.ok ? colors.neonGreen : "#F59E0B") + "22",
                borderColor: r.ok ? colors.neonGreen : "#F59E0B",
              },
            ]}
          >
            <Feather
              name={r.ok ? "check" : "clock"}
              size={11}
              color={r.ok ? colors.neonGreen : "#F59E0B"}
            />
            <Text
              style={[styles.reqBadgeText, { color: r.ok ? colors.neonGreen : "#F59E0B" }]}
            >
              {r.ok ? "Validé" : "En attente"}
            </Text>
          </View>
        </View>
      ))}
    </GlassCard>
  );
}

/* ───────────────────────── STYLES ───────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  tabBar: { flexDirection: "row", paddingHorizontal: 12, gap: 6, marginBottom: 8 },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  scroll: { paddingHorizontal: 16, paddingTop: 6 },
  tabContent: { gap: 14 },

  /* Profil */
  heroCard: { borderRadius: 22, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)" },
  heroBg: { height: 160, justifyContent: "flex-end" },
  heroImg: { resizeMode: "cover" },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroBody: { padding: 18, gap: 8, marginTop: -30 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  djName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  cityText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  genrePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  genreText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bio: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginTop: 2 },

  statsCard: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  statDivider: { width: 1, height: 32 },

  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  outlineBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2, marginTop: 6 },

  infoCard: { padding: 16, gap: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  infoValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rowDivider: { height: 1 },

  secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 },
  secureText: { fontSize: 11, fontFamily: "Inter_400Regular" },

  reviewCard: { padding: 14, gap: 6 },
  reviewHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewComment: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },

  /* Tips */
  periodRow: { flexDirection: "row", gap: 8 },
  periodPill: { flex: 1, paddingVertical: 9, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  periodText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: { width: "47%", flexGrow: 1, padding: 14, gap: 8 },
  statBoxIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statBoxLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statBoxValue: { fontSize: 20, fontFamily: "Inter_700Bold" },

  tableCard: { padding: 14 },
  tableHead: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1 },
  thDate: { flex: 2, fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  thId: { flex: 2, fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  thAmount: { flex: 2, fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textAlign: "right" },
  thStatus: { flex: 1, fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textAlign: "right" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  tdDate: { flex: 2, fontSize: 12, fontFamily: "Inter_400Regular" },
  tdId: { flex: 2, fontSize: 12, fontFamily: "Inter_400Regular" },
  tdAmount: { flex: 2, fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  tdStatus: { flex: 1, alignItems: "flex-end" },
  tableEmpty: { paddingVertical: 24, textAlign: "center", fontSize: 13, fontFamily: "Inter_400Regular" },

  /* Justificatifs */
  justifCard: { padding: 18, gap: 12 },
  justifHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  justifTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  dateRangeRow: { flexDirection: "row", gap: 12 },
  dateField: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  formatRow: { flexDirection: "row", gap: 10 },
  formatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  formatText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  totalsRow: { flexDirection: "row", borderTopWidth: 1, paddingTop: 14, marginTop: 4 },
  totalItem: { flex: 1, alignItems: "center", gap: 3 },
  totalValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  totalLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },

  docCard: { padding: 18, gap: 12 },
  docRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  docLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  docValue: { fontSize: 12, fontFamily: "Inter_600SemiBold", flexShrink: 1, textAlign: "right", marginLeft: 12 },
  docStatusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  certifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  certifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  qrRow: { alignItems: "center", gap: 6, paddingVertical: 8 },
  qrPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCaption: { fontSize: 11, fontFamily: "Inter_400Regular" },
  attestRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 2 },
  attestText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },

  /* Vérification */
  reqCard: { padding: 16 },
  reqHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  reqTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  reqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  reqLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  reqBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  reqBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  privateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  privateText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
