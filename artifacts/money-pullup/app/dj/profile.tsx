import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useDjWallet } from "@/hooks/useDjWallet";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { subscribeDjBookings } from "@/lib/bookings";
import { subscribeDjProfile, type DjProfile } from "@/lib/djFirestore";
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

/* ─── Navy dark palette — matches the reference mockup pixel-for-pixel ─── */
const C = {
  bg: "#0A0F1E",
  card: "#121A2E",
  cardBorder: "rgba(255,255,255,0.07)",
  text: "#FFFFFF",
  muted: "#8992A8",
  blue: "#2563EB",
  blueSoft: "rgba(37,99,235,0.16)",
  gold: "#F59E0B",
  goldSoft: "rgba(245,158,11,0.14)",
  green: "#22C55E",
  greenSoft: "rgba(34,197,94,0.14)",
  purple: "#8B5CF6",
  purpleSoft: "rgba(139,92,246,0.14)",
  pink: "#F43F5E",
  pinkSoft: "rgba(244,63,94,0.14)",
  divider: "rgba(255,255,255,0.08)",
  lightCard: "#F5F7FA",
  lightCardBorder: "rgba(15,23,42,0.06)",
  lightText: "#0F172A",
  lightMuted: "#64748B",
};

const GENRE_STYLES = [
  { color: "#3B82F6" },
  { color: "#D97706" },
  { color: "#94A3B8" },
  { color: "#14B8A6" },
];

export default function DjProfilePage() {
  const insets = useSafeAreaInsets();
  const wallet = useDjWallet();

  const [tab, setTab] = useState<SubTab>("profil");
  const [djId, setDjId] = useState<string | null>(null);
  const [profile, setProfile] = useState<DjProfile | null>(null);
  const [tips, setTips] = useState<StreamTip[]>([]);
  const [eventsCount, setEventsCount] = useState(0);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(firebaseAuth(), (user) => setDjId(user?.uid ?? null));
  }, []);

  useEffect(() => {
    if (!djId || !isFirebaseConfigured()) return;
    const unsubProfile = subscribeDjProfile(djId, setProfile);
    const unsubTips = subscribeReceivedTipsForDj(djId, setTips, () => {});
    const unsubBookings = subscribeDjBookings(
      djId,
      (b) => setEventsCount(b.filter((x) => x.status === "accepted").length),
      () => {},
    );
    return () => {
      unsubProfile();
      unsubTips();
      unsubBookings();
    };
  }, [djId]);

  const selectTab = useCallback((t: SubTab) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTab(t);
  }, []);

  const titleForTab: Record<SubTab, string> = {
    profil: "Profil",
    tips: "Tips reçus",
    justificatifs: "Justificatifs",
    verification: "Vérification",
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titleForTab[tab]}</Text>
        {tab === "profil" ? (
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="more-vertical" size={20} color={C.text} />
          </TouchableOpacity>
        ) : tab === "tips" ? (
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="filter" size={19} color={C.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {/* Sub-tab selector */}
      <View style={styles.tabBar}>
        {SUB_TABS.map((t) => {
          const active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={() => selectTab(t.key)}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
            >
              <Feather name={t.icon} size={14} color={active ? C.blue : C.muted} />
              <Text style={[styles.tabLabel, { color: active ? C.blue : C.muted }]} numberOfLines={1}>
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
          <ProfilTab profile={profile} wallet={wallet} eventsCount={eventsCount} />
        )}
        {tab === "tips" && <TipsTab tips={tips} onGenerate={() => setTab("justificatifs")} />}
        {tab === "justificatifs" && (
          <JustificatifsTab djId={djId} profile={profile} wallet={wallet} />
        )}
        {tab === "verification" && <VerificationTab profile={profile} />}
      </ScrollView>

      <BottomTabBar />
    </View>
  );
}

/* ───────────────────────── 1. PROFIL ───────────────────────── */

function ProfilTab({
  profile,
  wallet,
  eventsCount,
}: {
  profile: DjProfile | null;
  wallet: ReturnType<typeof useDjWallet>;
  eventsCount: number;
}) {
  const name = profile?.name || "DJ Heat";
  const city = profile?.city || "—";
  const bio = profile?.bio || "DJ open-format pour clubs, mariages et événements privés.";
  const genres = profile?.genres && profile.genres.length > 0 ? profile.genres : [];
  const avatar = profile?.avatarUrl || DEFAULT_AVATAR;
  const verified = profile?.verified ?? (profile?.chargesEnabled && profile?.payoutsEnabled);
  const ratingAvg = profile?.ratingAvg ?? 4.9;
  const ratingCount = profile?.ratingCount ?? 0;

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      {/* Avatar + identity */}
      <View style={styles.identityBlock}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {verified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={20} color={C.blue} />
            </View>
          )}
        </View>

        <Text style={styles.djName}>{name}</Text>

        {verified && (
          <View style={styles.verifiedPill}>
            <Feather name="check-circle" size={11} color={C.blue} />
            <Text style={styles.verifiedPillText}>Profil vérifié</Text>
          </View>
        )}

        <View style={styles.cityRow}>
          <Feather name="map-pin" size={13} color={C.muted} />
          <Text style={styles.cityText}>{city}</Text>
        </View>

        {genres.length > 0 && (
          <View style={styles.genreRow}>
            {genres.map((g, i) => {
              const gs = GENRE_STYLES[i % GENRE_STYLES.length];
              return (
                <View key={g} style={[styles.genrePill, { borderColor: gs.color }]}>
                  <Text style={[styles.genreText, { color: gs.color }]}>{g}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bioRow}>
          <Feather name="music" size={12} color={C.muted} />
          <Text style={styles.bio}>{bio}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Feather name="star" size={15} color={C.gold} />
          <Text style={styles.statValue}>{ratingCount > 0 ? `${ratingAvg}/5` : `${ratingAvg}/5`}</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Feather name="gift" size={15} color={C.blue} />
          <Text style={styles.statValue}>{wallet.count}</Text>
          <Text style={styles.statLabel}>tips</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Feather name="calendar" size={15} color={C.pink} />
          <Text style={styles.statValue}>{eventsCount}</Text>
          <Text style={styles.statLabel}>événements</Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn}>
        <Feather name="gift" size={17} color="#fff" />
        <Text style={styles.primaryBtnText}>Envoyer un tip</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.85} style={styles.goldOutlineBtn}>
        <MaterialCommunityIcons name="calendar-check" size={17} color={C.gold} />
        <Text style={styles.goldOutlineBtnText}>Réserver</Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.85} style={styles.outlineBtn}>
        <Feather name="message-circle" size={17} color={C.text} />
        <Text style={styles.outlineBtnText}>Message</Text>
      </TouchableOpacity>

      {/* Infos pro */}
      <View style={styles.sectionHead}>
        <Feather name="briefcase" size={14} color={C.muted} />
        <Text style={styles.sectionLabel}>Infos pro</Text>
      </View>
      <View style={styles.infoCard}>
        <InfoRow label="Statut" value={profile?.proStatus || "Micro-entrepreneur"} />
        <View style={styles.rowDivider} />
        <InfoRow
          label="SIRET"
          value={profile?.siretVerified ? "SIRET vérifié" : "Non vérifié"}
          ok={profile?.siretVerified}
        />
      </View>

      <View style={styles.secureRow}>
        <Feather name="lock" size={12} color={C.muted} />
        <Text style={styles.secureText}>Contact via la messagerie sécurisée</Text>
      </View>
    </Animated.View>
  );
}

function InfoRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={styles.infoValue}>{value}</Text>
        {ok && <Feather name="check" size={13} color={C.green} />}
      </View>
    </View>
  );
}

/* ───────────────────────── 2. TIPS REÇUS ───────────────────────── */

const PERIODS = ["7j", "30j", "Mois", "Personnalisé"] as const;
type Period = (typeof PERIODS)[number];

function TipsTab({ tips, onGenerate }: { tips: StreamTip[]; onGenerate: () => void }) {
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
      <Text style={styles.sectionLabel}>Période</Text>
      <View style={styles.periodRow}>
        {PERIODS.map((p) => {
          const active = period === p;
          return (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodPill, active && styles.periodPillActive]}
            >
              <Text style={[styles.periodText, { color: active ? "#fff" : C.muted }]}>{p}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stat grid */}
      <View style={styles.statGrid}>
        <StatBox icon="download" label="Brut reçu" value={`${brut} €`} tint={C.blue} tintSoft={C.blueSoft} />
        <StatBox icon="percent" label="Frais" value={`${frais} €`} tint={C.purple} tintSoft={C.purpleSoft} />
        <StatBox icon="trending-up" label="Net estimé" value={`${net} €`} tint={C.green} tintSoft={C.greenSoft} />
        <StatBox
          icon="check-circle"
          label="Versé"
          value={`${verse} €`}
          tint={C.gold}
          tintSoft={C.goldSoft}
        />
      </View>

      {/* Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableHead}>
          <Text style={[styles.thDate]}>Date</Text>
          <Text style={[styles.thId]}>ID</Text>
          <Text style={[styles.thAmount]}>Montant</Text>
          <Text style={[styles.thStatus]}>Statut</Text>
        </View>

        {filtered.length === 0 ? (
          <Text style={styles.tableEmpty}>Aucun tip sur cette période.</Text>
        ) : (
          filtered.slice(0, 30).map((t) => (
            <View key={t.id} style={styles.tableRow}>
              <Text style={styles.tdDate}>
                {t.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
              </Text>
              <Text style={styles.tdId} numberOfLines={1}>
                TIP-{t.id.slice(0, 4).toUpperCase()}
              </Text>
              <Text style={styles.tdAmount}>{t.amount},00 €</Text>
              <View style={styles.tdStatus}>
                <StatusBadge status="Versé" />
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={onGenerate} style={styles.primaryBtn}>
        <Feather name="file-plus" size={17} color="#fff" />
        <Text style={styles.primaryBtnText}>Générer un relevé</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function StatusBadge({ status }: { status: "Versé" | "Accepté" | "En attente" }) {
  const cfg =
    status === "Versé"
      ? { color: C.green, icon: "check-circle" as const }
      : status === "Accepté"
        ? { color: C.blue, icon: "check-circle" as const }
        : { color: C.gold, icon: "clock" as const };
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.color + "1F", borderColor: cfg.color }]}>
      <Feather name={cfg.icon} size={11} color={cfg.color} />
      <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{status}</Text>
    </View>
  );
}

function StatBox({
  icon,
  label,
  value,
  tint,
  tintSoft,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  tint: string;
  tintSoft: string;
}) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statBoxIcon, { backgroundColor: tintSoft }]}>
        <Feather name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.statBoxLabel}>{label}</Text>
      <Text style={styles.statBoxValue}>{value}</Text>
    </View>
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
}: {
  djId: string | null;
  profile: DjProfile | null;
  wallet: ReturnType<typeof useDjWallet>;
}) {
  const [format, setFormat] = useState<"PDF" | "CSV">("PDF");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<TipStatement | null>(null);

  const from = useMemo(() => startOfMonth(), []);
  const to = useMemo(() => new Date(), []);

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
      <View style={styles.justifCard}>
        <View style={styles.justifHead}>
          <Feather name="shield" size={19} color={C.blue} />
          <Text style={styles.justifTitle}>Relevé certifié de tips</Text>
        </View>

        {/* Date range */}
        <View style={styles.dateRangeRow}>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>Du</Text>
            <View style={styles.dateBox}>
              <Feather name="calendar" size={13} color={C.muted} />
              <Text style={styles.dateValue}>{fmtFr(from)}</Text>
            </View>
          </View>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>Au</Text>
            <View style={styles.dateBox}>
              <Feather name="calendar" size={13} color={C.muted} />
              <Text style={styles.dateValue}>{fmtFr(to)}</Text>
            </View>
          </View>
        </View>

        {/* Format toggle */}
        <Text style={[styles.fieldLabel, { marginTop: 4 }]}>Format</Text>
        <View style={styles.formatRow}>
          {(["PDF", "CSV"] as const).map((f) => {
            const active = format === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  setFormat(f);
                  setResult(null);
                }}
                style={[styles.formatBtn, active && styles.formatBtnActive]}
              >
                <Feather
                  name={f === "PDF" ? "file-text" : "grid"}
                  size={14}
                  color={active ? "#fff" : C.muted}
                />
                <Text style={[styles.formatText, { color: active ? "#fff" : C.muted }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsRow}>
          <Total label="Nombre de tips" value={`${count}`} />
          <Total label="Montant brut" value={`${brut} €`} />
          <Total label="Frais" value={`${frais} €`} />
          <Total label="Net" value={`${net} €`} />
        </View>

        {/* Generate */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGenerate}
          disabled={generating}
          style={[styles.primaryBtn, { marginTop: 4, opacity: generating ? 0.7 : 1 }]}
        >
          {generating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Feather name="file-plus" size={17} color="#fff" />
          )}
          <Text style={styles.primaryBtnText}>{generating ? "Génération…" : "Générer le relevé"}</Text>
        </TouchableOpacity>
      </View>

      {/* Generated document */}
      {result && (
        <>
          <Text style={styles.sectionLabel}>Document généré</Text>
          <View style={styles.docCard}>
            <DocRow label="N° document" value={result.documentNumber} mono />
            <DocRow
              label="Date d'édition"
              value={new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
            />
            <DocRow label="Période" value={periodLabel} />
            <DocRow label="DJ" value={profile?.name || "DJ Heat"} />
            <View style={styles.docStatusRow}>
              <Text style={styles.docLabel}>Statut</Text>
              <View style={styles.certifiedPill}>
                <Feather name="check-circle" size={11} color={C.green} />
                <Text style={styles.certifiedText}>Certifié</Text>
              </View>
            </View>

            <View style={styles.qrRow}>
              <View style={styles.qrPlaceholder}>
                <MaterialCommunityIcons name="qrcode" size={48} color="#0A0F1E" />
              </View>
              <Text style={styles.qrCaption}>QR vérification · N° {result.documentNumber}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.85} onPress={handleDownload} style={styles.primaryBtn}>
              <Feather name="download" size={17} color="#fff" />
              <Text style={styles.primaryBtnText}>Télécharger le {result.format.toUpperCase()}</Text>
            </TouchableOpacity>

            <View style={styles.attestRow}>
              <Feather name="info" size={12} color={C.muted} />
              <Text style={styles.attestText}>
                Ce document atteste les transactions enregistrées par la plateforme.
              </Text>
            </View>
          </View>
        </>
      )}
    </Animated.View>
  );
}

function fmtFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.totalItem}>
      <Text style={styles.totalValue}>{value}</Text>
      <Text style={styles.totalLabel}>{label}</Text>
    </View>
  );
}

function DocRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.docRow}>
      <Text style={styles.docLabel}>{label}</Text>
      <Text style={[styles.docValue, mono && Platform.OS === "ios" ? { fontFamily: "Menlo" } : null]}>
        {value}
      </Text>
    </View>
  );
}

/* ───────────────────────── 4. VÉRIFICATION ───────────────────────── */

function VerificationTab({ profile }: { profile: DjProfile | null }) {
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
      <ReqCard icon="user" title="Requis pour le profil" reqs={profileReqs} />
      <ReqCard icon="briefcase" title="Requis pour les versements" reqs={payoutReqs} />

      <View style={styles.privateBanner}>
        <Feather name="lock" size={14} color={C.muted} />
        <Text style={styles.privateText}>Données privées non publiques</Text>
      </View>
    </Animated.View>
  );
}

function ReqCard({
  icon,
  title,
  reqs,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  reqs: { label: string; ok: boolean }[];
}) {
  return (
    <View style={styles.reqCard}>
      <View style={styles.reqHead}>
        <Feather name={icon} size={16} color={C.blue} />
        <Text style={styles.reqTitle}>{title}</Text>
      </View>
      {reqs.map((r, i) => (
        <View key={r.label} style={[styles.reqRow, i < reqs.length - 1 && styles.reqRowBorder]}>
          <Text style={styles.reqLabel}>{r.label}</Text>
          <View
            style={[
              styles.reqBadge,
              {
                backgroundColor: (r.ok ? C.green : C.gold) + "1F",
                borderColor: r.ok ? C.green : C.gold,
              },
            ]}
          >
            <Feather name={r.ok ? "check" : "clock"} size={11} color={r.ok ? C.green : C.gold} />
            <Text style={[styles.reqBadgeText, { color: r.ok ? C.green : C.gold }]}>
              {r.ok ? "Validé" : "En attente"}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ───────────────────────── STYLES ───────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },

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
  tabBtnActive: { backgroundColor: C.blueSoft, borderColor: C.blue },
  tabLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  scroll: { paddingHorizontal: 16, paddingTop: 6 },
  tabContent: { gap: 14 },

  /* Profil */
  identityBlock: { alignItems: "center", gap: 8, paddingTop: 8 },
  avatarWrap: { width: 104, height: 104, marginBottom: 4 },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: C.blue,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  djName: { fontSize: 22, fontFamily: "Inter_700Bold", color: C.text },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: C.blueSoft,
    borderColor: C.blue,
  },
  verifiedPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.blue },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  cityText: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.muted },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 2 },
  genrePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  genreText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bioRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 4, paddingHorizontal: 12 },
  bio: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, color: C.muted, textAlign: "center" },

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: C.text },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.muted, textAlign: "center" },
  statDivider: { width: 1, height: 36, backgroundColor: C.divider },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: C.blue,
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  goldOutlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  goldOutlineBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.gold },

  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: C.card,
  },
  outlineBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: C.text },

  sectionHead: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.6, color: C.muted, marginTop: 6 },

  infoCard: {
    padding: 16,
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.muted },
  infoValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.text },
  rowDivider: { height: 1, backgroundColor: C.divider },

  secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 },
  secureText: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.muted },

  /* Tips */
  periodRow: { flexDirection: "row", gap: 8 },
  periodPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: C.card,
    borderColor: C.cardBorder,
  },
  periodPillActive: { backgroundColor: C.blue, borderColor: C.blue },
  periodText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: {
    width: "47%",
    flexGrow: 1,
    padding: 14,
    gap: 8,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  statBoxIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statBoxLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.muted },
  statBoxValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: C.text },

  tableCard: {
    padding: 14,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  tableHead: { flexDirection: "row", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.divider },
  thDate: { flex: 2, fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, color: C.muted },
  thId: { flex: 2, fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, color: C.muted },
  thAmount: {
    flex: 2,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textAlign: "right",
    color: C.muted,
  },
  thStatus: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textAlign: "right",
    color: C.muted,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  tdDate: { flex: 2, fontSize: 12, fontFamily: "Inter_400Regular", color: C.text },
  tdId: { flex: 2, fontSize: 12, fontFamily: "Inter_400Regular", color: C.muted },
  tdAmount: { flex: 2, fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right", color: C.text },
  tdStatus: { flex: 1, alignItems: "flex-end" },
  tableEmpty: {
    paddingVertical: 24,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.muted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  /* Justificatifs */
  justifCard: {
    padding: 18,
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  justifHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  justifTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: C.text },
  dateRangeRow: { flexDirection: "row", gap: 12 },
  dateField: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.muted },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  dateValue: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.text },
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
    borderColor: C.cardBorder,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  formatBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
  formatText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  totalsRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 14, marginTop: 4 },
  totalItem: { flex: 1, alignItems: "center", gap: 3 },
  totalValue: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.text },
  totalLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: C.muted, textAlign: "center" },

  docCard: {
    padding: 18,
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  docRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  docLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: C.muted },
  docValue: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
    color: C.text,
  },
  docStatusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  certifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: C.greenSoft,
    borderColor: C.green,
  },
  certifiedText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: C.green },
  qrRow: { alignItems: "center", gap: 6, paddingVertical: 8 },
  qrPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCaption: { fontSize: 11, fontFamily: "Inter_400Regular", color: C.muted },
  attestRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 2 },
  attestText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16, color: C.muted },

  /* Vérification — light cards, matching mockup contrast */
  reqCard: {
    padding: 16,
    backgroundColor: C.lightCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.lightCardBorder,
  },
  reqHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  reqTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: C.lightText },
  reqRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  reqRowBorder: { borderBottomWidth: 1, borderBottomColor: C.lightCardBorder },
  reqLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: C.lightText },
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
    backgroundColor: C.card,
    borderColor: C.cardBorder,
  },
  privateText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: C.muted },
});
