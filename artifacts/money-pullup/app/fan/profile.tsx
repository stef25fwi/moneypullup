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
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassCard } from "@/components/GlassCard";
import { GlowBackground } from "@/components/GlowBackground";
import { useColors } from "@/hooks/useColors";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import {
  acceptCgu,
  subscribeFanProfile,
  updateFanProfile,
  type FanProfile,
} from "@/lib/fanFirestore";
import { generateFanStatement, type FanStatement } from "@/lib/tipFunctions";

type SubTab = "profil" | "legal" | "justificatifs";

const SUB_TABS: { key: SubTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "profil", label: "Profil", icon: "user" },
  { key: "legal", label: "Légal & CGU", icon: "shield" },
  { key: "justificatifs", label: "Justificatifs", icon: "file-text" },
];

const CGU_VERSION = "2025-06";
const AVATARS = ["🎤", "🎸", "🎹", "🥁", "🎧", "🤩", "🔥", "⚡", "🎵", "💜", "🕺", "💃"];

const LEGAL_LINKS = {
  cgu: process.env.EXPO_PUBLIC_CGU_URL || "https://moneypullup.app/cgu",
  privacy: process.env.EXPO_PUBLIC_PRIVACY_URL || "https://moneypullup.app/confidentialite",
  legal: process.env.EXPO_PUBLIC_LEGAL_URL || "https://moneypullup.app/mentions-legales",
};

export default function FanProfilePage() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<SubTab>("profil");
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<FanProfile | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(firebaseAuth(), (user) => setUid(user?.uid ?? null));
  }, []);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured()) return;
    return subscribeFanProfile(uid, setProfile);
  }, [uid]);

  const selectTab = useCallback((t: SubTab) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTab(t);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Mon profil</Text>
        <View style={styles.headerBtn} />
      </View>

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
                style={[styles.tabLabel, { color: active ? colors.primary : colors.mutedForeground }]}
                numberOfLines={1}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "profil" && <ProfilTab uid={uid} profile={profile} colors={colors} />}
        {tab === "legal" && <LegalTab uid={uid} profile={profile} colors={colors} />}
        {tab === "justificatifs" && <JustificatifsTab uid={uid} profile={profile} colors={colors} />}
      </ScrollView>
    </View>
  );
}

type Colors = ReturnType<typeof useColors>;

/* ───────────────────────── 1. PROFIL + COORDONNÉES ───────────────────────── */

function ProfilTab({
  uid,
  profile,
  colors,
}: {
  uid: string | null;
  profile: FanProfile | null;
  colors: Colors;
}) {
  const [showAvatars, setShowAvatars] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const value = (k: keyof FanProfile) =>
    draft[k] !== undefined ? draft[k] : ((profile?.[k] as string | undefined) ?? "");

  const setField = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const save = useCallback(() => {
    if (!uid) return;
    const fields = Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== undefined));
    if (Object.keys(fields).length === 0) return;
    updateFanProfile(uid, fields).catch(() => {});
    setDraft({});
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [uid, draft]);

  const dirty = Object.keys(draft).length > 0;
  const avatar = profile?.avatar || "🎧";

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      {/* Identity */}
      <GlassCard style={styles.identityCard}>
        <TouchableOpacity onPress={() => setShowAvatars((v) => !v)} style={styles.avatarWrap}>
          <Text style={styles.avatar}>{avatar}</Text>
          <View style={[styles.avatarBadge, { backgroundColor: colors.violet }]}>
            <Feather name="edit-2" size={10} color="#fff" />
          </View>
        </TouchableOpacity>

        {showAvatars && (
          <View style={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <TouchableOpacity
                key={a}
                onPress={() => {
                  if (uid) updateFanProfile(uid, { avatar: a }).catch(() => {});
                  setShowAvatars(false);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[
                  styles.avatarOption,
                  {
                    backgroundColor: avatar === a ? colors.violet + "33" : "transparent",
                    borderColor: avatar === a ? colors.violet : "transparent",
                  },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Field
          label="Nom d'affichage"
          value={value("name")}
          onChange={(v) => setField("name", v)}
          placeholder="Votre nom"
          colors={colors}
        />
      </GlassCard>

      {/* Coordonnées */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>COORDONNÉES</Text>
      <GlassCard style={styles.formCard}>
        <Field label="Email" value={value("email")} onChange={(v) => setField("email", v)} placeholder="vous@email.com" keyboardType="email-address" colors={colors} />
        <Field label="Téléphone" value={value("phone")} onChange={(v) => setField("phone", v)} placeholder="+33 6 12 34 56 78" keyboardType="phone-pad" colors={colors} />
        <Field label="Adresse" value={value("address")} onChange={(v) => setField("address", v)} placeholder="N° et rue" colors={colors} />
        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Field label="Code postal" value={value("postalCode")} onChange={(v) => setField("postalCode", v)} placeholder="97110" keyboardType="number-pad" colors={colors} />
          </View>
          <View style={{ flex: 2 }}>
            <Field label="Ville" value={value("city")} onChange={(v) => setField("city", v)} placeholder="Pointe-à-Pitre" colors={colors} />
          </View>
        </View>
        <Field label="Pays" value={value("country")} onChange={(v) => setField("country", v)} placeholder="France" colors={colors} />
      </GlassCard>

      {dirty && (
        <TouchableOpacity activeOpacity={0.85} onPress={save} style={styles.primaryBtn}>
          <LinearGradient colors={["#7C3AED", "#5B11CC"]} style={styles.primaryBtnGrad}>
            <Feather name="check" size={17} color="#fff" />
            <Text style={styles.primaryBtnText}>Enregistrer</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.secureRow}>
        <Feather name="lock" size={12} color={colors.mutedForeground} />
        <Text style={[styles.secureText, { color: colors.mutedForeground }]}>
          Vos coordonnées restent privées et ne sont jamais partagées avec les DJs.
        </Text>
      </View>
    </Animated.View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  colors: Colors;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        style={[
          styles.input,
          { color: colors.foreground, borderColor: colors.glassBorder, backgroundColor: colors.glassBackground },
        ]}
      />
    </View>
  );
}

/* ───────────────────────── 2. LÉGAL & CGU ───────────────────────── */

function LegalTab({
  uid,
  profile,
  colors,
}: {
  uid: string | null;
  profile: FanProfile | null;
  colors: Colors;
}) {
  const accepted = profile?.cguVersion === CGU_VERSION;
  const acceptedAt = profile?.cguAcceptedAt?.toDate?.();

  const handleAcceptCgu = useCallback(() => {
    if (!uid) return;
    acceptCgu(uid, CGU_VERSION).catch(() => {});
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [uid]);

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      {/* CGU acceptance */}
      <GlassCard style={styles.legalCard}>
        <View style={styles.legalHead}>
          <Feather name="file-text" size={16} color={colors.primary} />
          <Text style={[styles.legalTitle, { color: colors.foreground }]}>
            Conditions Générales d'Utilisation
          </Text>
        </View>
        <View style={styles.cguStatusRow}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: (accepted ? colors.neonGreen : "#F59E0B") + "22",
                borderColor: accepted ? colors.neonGreen : "#F59E0B",
              },
            ]}
          >
            <Feather name={accepted ? "check" : "clock"} size={11} color={accepted ? colors.neonGreen : "#F59E0B"} />
            <Text style={[styles.statusText, { color: accepted ? colors.neonGreen : "#F59E0B" }]}>
              {accepted ? "Acceptées" : "Non acceptées"}
            </Text>
          </View>
          <Text style={[styles.cguMeta, { color: colors.mutedForeground }]}>
            Version {CGU_VERSION}
            {accepted && acceptedAt ? ` · ${acceptedAt.toLocaleDateString("fr-FR")}` : ""}
          </Text>
        </View>
        {!accepted && (
          <TouchableOpacity activeOpacity={0.85} onPress={handleAcceptCgu} style={[styles.primaryBtn, { marginTop: 4 }]}>
            <LinearGradient colors={["#7C3AED", "#5B11CC"]} style={styles.primaryBtnGrad}>
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>J'accepte les CGU</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </GlassCard>

      {/* Legal documents */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DOCUMENTS LÉGAUX</Text>
      <GlassCard style={styles.linkCard}>
        <LinkRow label="Conditions Générales d'Utilisation" onPress={() => open(LEGAL_LINKS.cgu)} colors={colors} />
        <Divider colors={colors} />
        <LinkRow label="Politique de confidentialité" onPress={() => open(LEGAL_LINKS.privacy)} colors={colors} />
        <Divider colors={colors} />
        <LinkRow label="Mentions légales" onPress={() => open(LEGAL_LINKS.legal)} colors={colors} />
      </GlassCard>

      {/* RGPD / data */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MES DONNÉES (RGPD)</Text>
      <GlassCard style={styles.linkCard}>
        <View style={styles.optRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.optTitle, { color: colors.foreground }]}>Communications marketing</Text>
            <Text style={[styles.optSub, { color: colors.mutedForeground }]}>
              Recevoir les nouveautés et offres par email
            </Text>
          </View>
          <Switch
            value={!!profile?.marketingOptIn}
            onValueChange={(v) => {
              if (uid) updateFanProfile(uid, { marketingOptIn: v }).catch(() => {});
            }}
            trackColor={{ true: colors.primary, false: colors.glassBorder }}
          />
        </View>
        <Divider colors={colors} />
        <LinkRow
          label="Exporter mes données"
          icon="download"
          onPress={() =>
            Alert.alert(
              "Export RGPD",
              "Générez un justificatif de vos transactions dans l'onglet Justificatifs. Pour une copie complète de vos données, contactez le support.",
            )
          }
          colors={colors}
        />
        <Divider colors={colors} />
        <LinkRow
          label="Supprimer mon compte"
          icon="trash-2"
          destructive
          onPress={() =>
            Alert.alert(
              "Supprimer le compte",
              "Cette action est irréversible. Contactez le support à privacy@moneypullup.app pour demander la suppression de votre compte et de vos données.",
            )
          }
          colors={colors}
        />
      </GlassCard>
    </Animated.View>
  );
}

function LinkRow({
  label,
  onPress,
  icon = "external-link",
  destructive,
  colors,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  destructive?: boolean;
  colors: Colors;
}) {
  const tint = destructive ? colors.destructive : colors.foreground;
  return (
    <TouchableOpacity onPress={onPress} style={styles.linkRow}>
      <Text style={[styles.linkLabel, { color: tint }]}>{label}</Text>
      <Feather name={icon} size={16} color={destructive ? colors.destructive : colors.mutedForeground} />
    </TouchableOpacity>
  );
}

function Divider({ colors }: { colors: Colors }) {
  return <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />;
}

/* ───────────────────────── 3. JUSTIFICATIFS ───────────────────────── */

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function JustificatifsTab({
  uid,
  profile,
  colors,
}: {
  uid: string | null;
  profile: FanProfile | null;
  colors: Colors;
}) {
  const [format, setFormat] = useState<"PDF" | "CSV">("PDF");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<FanStatement | null>(null);

  const from = useMemo(() => startOfMonth(), []);
  const to = useMemo(() => new Date(), []);

  const handleGenerate = useCallback(async () => {
    if (!uid) {
      Alert.alert("Indisponible", "Connectez-vous pour générer un justificatif.");
      return;
    }
    setGenerating(true);
    try {
      const stmt = await generateFanStatement({
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
  }, [uid, format, from, to]);

  const handleDownload = useCallback(async () => {
    if (!result?.downloadUrl) return;
    try {
      await Linking.openURL(result.downloadUrl);
    } catch {
      Alert.alert("Téléchargement impossible", "Impossible d'ouvrir le document.");
    }
  }, [result]);

  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.tabContent}>
      <GlassCard style={styles.justifCard}>
        <View style={styles.legalHead}>
          <MaterialCommunityIcons name="receipt" size={20} color={colors.gold} />
          <Text style={[styles.legalTitle, { color: colors.foreground }]}>Reçu de tips envoyés</Text>
        </View>

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
                <Feather name={f === "PDF" ? "file-text" : "grid"} size={14} color={active ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.formatText, { color: active ? colors.primary : colors.mutedForeground }]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleGenerate}
          disabled={generating}
          style={[styles.primaryBtn, { marginTop: 8, opacity: generating ? 0.7 : 1 }]}
        >
          <LinearGradient colors={["#7C3AED", "#5B11CC"]} style={styles.primaryBtnGrad}>
            {generating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Feather name="file-plus" size={17} color="#fff" />
            )}
            <Text style={styles.primaryBtnText}>{generating ? "Génération…" : "Générer le justificatif"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      {result && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DOCUMENT GÉNÉRÉ</Text>
          <GlassCard style={styles.docCard}>
            <DocRow label="N° document" value={result.documentNumber} colors={colors} />
            <DocRow label="Période" value={`${fmtFr(from)} – ${fmtFr(to)}`} colors={colors} />
            <DocRow label="Nom" value={profile?.name || "Fan"} colors={colors} />
            <DocRow label="Nb de tips" value={`${result.tipCount}`} colors={colors} />
            <DocRow label="Total" value={`${(result.totalCents / 100).toFixed(2)} €`} colors={colors} />
            <DocRow label="Format" value={result.format.toUpperCase()} colors={colors} />

            <TouchableOpacity activeOpacity={0.85} onPress={handleDownload} style={[styles.primaryBtn, { marginTop: 4 }]}>
              <LinearGradient colors={["#7C3AED", "#5B11CC"]} style={styles.primaryBtnGrad}>
                <Feather name="download" size={17} color="#fff" />
                <Text style={styles.primaryBtnText}>Télécharger le {result.format.toUpperCase()}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.attestRow}>
              <Feather name="info" size={12} color={colors.mutedForeground} />
              <Text style={[styles.attestText, { color: colors.mutedForeground }]}>
                Ce reçu atteste les tips que vous avez envoyés via la plateforme.
              </Text>
            </View>
          </GlassCard>
        </>
      )}
    </Animated.View>
  );
}

function DocRow({ label, value, colors }: { label: string; value: string; colors: Colors }) {
  return (
    <View style={styles.docRow}>
      <Text style={[styles.docLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.docValue, { color: colors.foreground }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  scroll: { paddingHorizontal: 16, paddingTop: 6 },
  tabContent: { gap: 14 },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 2, marginTop: 6 },

  /* Identity */
  identityCard: { padding: 18, alignItems: "center", gap: 14 },
  avatarWrap: { position: "relative" },
  avatar: { fontSize: 56 },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  avatarOption: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },

  /* Forms */
  formCard: { padding: 16, gap: 12 },
  field: { gap: 6, width: "100%" },
  fieldRow: { flexDirection: "row", gap: 12 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  secureRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: 6, marginTop: 2 },
  secureText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },

  /* Legal */
  legalCard: { padding: 16, gap: 12 },
  legalHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  legalTitle: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  cguStatusRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cguMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },

  linkCard: { paddingHorizontal: 16, paddingVertical: 4 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  linkLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, paddingRight: 12 },
  divider: { height: 1 },

  optRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  optTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  optSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  /* Justificatifs */
  justifCard: { padding: 18, gap: 12 },
  dateRangeRow: { flexDirection: "row", gap: 12 },
  dateField: { flex: 1, gap: 6 },
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

  docCard: { padding: 18, gap: 12 },
  docRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  docLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  docValue: { fontSize: 12, fontFamily: "Inter_600SemiBold", flexShrink: 1, textAlign: "right", marginLeft: 12 },
  attestRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 2 },
  attestText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
});
