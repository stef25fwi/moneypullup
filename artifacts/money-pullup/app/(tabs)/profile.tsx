import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlowBackground } from "@/components/GlowBackground";
import { useColors } from "@/hooks/useColors";
import {
  ensureSignedIn,
  firebaseAuth,
  isFirebaseConfigured,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@/lib/firebase";
import { subscribeFanProfile, updateFanProfile, type AccountRole } from "@/lib/fanFirestore";

type Mode = "login" | "register";
type Role = AccountRole | null;

function errorMessage(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/user-not-found": "Aucun compte avec cet e-mail.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/email-already-in-use": "Cet e-mail est déjà utilisé.",
    "auth/weak-password": "Mot de passe trop court (6 caractères min).",
    "auth/invalid-credential": "Identifiants incorrects.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
    "auth/network-request-failed": "Connexion réseau impossible.",
  };
  return map[code] ?? "Une erreur s'est produite. Réessayez.";
}

/* ─── Role selection screen ─── */
function RoleSelector({ uid, email, onSelectRole }: { uid: string; email: string | null; onSelectRole: (role: Role) => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await signOutUser();
      await ensureSignedIn();
    } catch {
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 90, alignItems: "stretch" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + email */}
        <View style={styles.header}>
          <LinearGradient colors={["#FF2D78", "#9B0020"]} style={styles.avatarSmall}>
            <Text style={styles.avatarLetter}>{email ? email[0].toUpperCase() : "?"}</Text>
          </LinearGradient>
          <Text style={[styles.emailSmall, { color: colors.foreground }]}>{email}</Text>
        </View>

        {/* Role cards */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Choisissez votre rôle</Text>

        {/* FAN card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            onSelectRole("fan");
          }}
          style={styles.roleCard}
        >
          <LinearGradient
            colors={["#EE0033", "#9B0020"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.roleCardGrad}
          >
            <View style={styles.roleCardInner}>
              <Text style={styles.roleCardEmoji}>👥</Text>
              <View style={styles.roleCardText}>
                <Text style={styles.roleCardTitle}>Fan</Text>
                <Text style={styles.roleCardDesc}>Envoyez des tips à vos DJs</Text>
              </View>
              <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* DJ card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            onSelectRole("dj");
          }}
          style={styles.roleCard}
        >
          <LinearGradient
            colors={["#4A12A0", "#2A0060"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.roleCardGrad}
          >
            <View style={styles.roleCardInner}>
              <Text style={styles.roleCardEmoji}>🎧</Text>
              <View style={styles.roleCardText}>
                <Text style={styles.roleCardTitle}>DJ</Text>
                <Text style={styles.roleCardDesc}>Gérez vos tips et réservations</Text>
              </View>
              <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={busy}
          style={[styles.logoutBtn, { borderColor: colors.border, marginTop: 16 }]}
          activeOpacity={0.7}
        >
          {busy ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Feather name="log-out" size={16} color="#EF4444" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ─── Main component ─── */
export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [role, setRole] = useState<Role>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [roleBusy, setRoleBusy] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(firebaseAuth(), (user) => {
      setUid(user?.uid ?? null);
      setUserEmail(user?.email ?? null);
      setIsAnonymous(user?.isAnonymous ?? true);
    });
  }, []);

  // Persisted role: read once per authenticated session so a returning user
  // is routed straight to their profile instead of re-picking Fan/DJ.
  useEffect(() => {
    if (!uid || isAnonymous) {
      setRole(null);
      setRoleLoading(true);
      return;
    }
    setRoleLoading(true);
    return subscribeFanProfile(uid, (profile) => {
      setRole(profile?.role ?? null);
      setRoleLoading(false);
    });
  }, [uid, isAnonymous]);

  // Once a role is known, this screen is just a gateway — hand off to the
  // full profile page that actually owns editing for that role.
  useEffect(() => {
    if (roleLoading || !role) return;
    router.replace(role === "fan" ? "/fan/profile" : "/dj/profile");
  }, [role, roleLoading]);

  const handleSelectRole = async (picked: Role) => {
    if (!uid || !picked) return;
    setRoleBusy(true);
    try {
      await updateFanProfile(uid, { role: picked });
      setRole(picked);
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer votre rôle. Réessayez.");
    } finally {
      setRoleBusy(false);
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      shake();
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      shake();
      Alert.alert("Erreur", errorMessage(e.code ?? ""));
    } finally {
      setBusy(false);
    }
  };

  const handleAnonymous = async () => {
    setBusy(true);
    try {
      await ensureSignedIn();
      router.navigate("/(tabs)/");
    } catch {
      Alert.alert("Erreur", "Connexion anonyme impossible.");
    } finally {
      setBusy(false);
    }
  };

  // State 1: Unauthenticated
  if (!uid || isAnonymous) {
    return (
      <View style={[styles.container, { backgroundColor: "#050010" }]}>
        <GlowBackground />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Branding */}
            <View style={styles.hero}>
              <LinearGradient colors={["#FF2D78", "#9B0020"]} style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🎧</Text>
              </LinearGradient>
              <Text style={styles.appName}>Money Pull Up</Text>
              <Text style={[styles.tagline, { color: "rgba(255,255,255,0.5)" }]}>Tips · Réservations · Live</Text>
            </View>

            {/* Mode toggle */}
            <View style={[styles.modeToggle, { backgroundColor: "rgba(255,255,255,0.07)" }]}>
              {(["login", "register"] as Mode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                  onPress={() => {
                    setMode(m);
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modeBtnText, { color: mode === m ? "#fff" : "rgba(255,255,255,0.45)" }]}>
                    {m === "login" ? "Connexion" : "Inscription"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form */}
            <Animated.View style={[styles.formCard, { borderColor: "rgba(255,255,255,0.1)", transform: [{ translateX: shakeAnim }] }]}>
              {/* Email */}
              <View style={styles.fieldWrap}>
                <Feather name="mail" size={16} color="rgba(255,255,255,0.4)" style={styles.fieldIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Adresse e-mail"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.fieldDivider, { backgroundColor: "rgba(255,255,255,0.08)" }]} />

              {/* Password */}
              <View style={styles.fieldWrap}>
                <Feather name="lock" size={16} color="rgba(255,255,255,0.4)" style={styles.fieldIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mot de passe"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={styles.eyeBtn}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={16} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* CTA */}
            <TouchableOpacity onPress={handleSubmit} disabled={busy} activeOpacity={0.85} style={styles.ctaWrap}>
              <LinearGradient colors={["#FF2D78", "#C0004A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name={mode === "login" ? "log-in" : "user-plus"} size={18} color="#fff" />
                    <Text style={styles.ctaText}>{mode === "login" ? "Se connecter" : "Créer un compte"}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
              <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular" }}>ou</Text>
              <View style={[styles.dividerLine, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
            </View>

            {/* Anonymous */}
            <TouchableOpacity onPress={handleAnonymous} disabled={busy} style={[styles.anonBtn, { borderColor: "rgba(255,255,255,0.15)" }]} activeOpacity={0.7}>
              <Feather name="user-x" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.anonText}>Continuer sans compte</Text>
            </TouchableOpacity>

            {/* Legal */}
            <Text style={styles.legal}>
              En vous connectant vous acceptez nos <Text style={{ color: "#FF2D78" }}>CGU</Text> et notre{" "}
              <Text style={{ color: "#FF2D78" }}>politique de confidentialité</Text>.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // State 2: Authenticated, role not yet known/picked, or busy redirecting.
  if (roleLoading || role || roleBusy) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <GlowBackground />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // State 3: Authenticated, no role saved yet — let the user pick one.
  return <RoleSelector uid={uid} email={userEmail} onSelectRole={handleSelectRole} />;
}

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 24, alignItems: "stretch", gap: 16 },

  /* Login form */
  hero: { alignItems: "center", gap: 10, marginBottom: 8 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", shadowColor: "#FF2D78", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 12 },
  logoEmoji: { fontSize: 38 },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },
  tagline: { fontSize: 13, fontFamily: "Inter_400Regular" },

  modeToggle: { flexDirection: "row", borderRadius: 14, padding: 4 },
  modeBtn: { flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: "center" },
  modeBtnActive: { backgroundColor: "#FF2D78" },
  modeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  formCard: { borderRadius: 18, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden" },
  fieldWrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 54 },
  fieldIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#fff" },
  eyeBtn: { padding: 6 },
  fieldDivider: { height: 1 },

  ctaWrap: { borderRadius: 16, overflow: "hidden" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 17 },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },

  anonBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 14, borderWidth: 1 },
  anonText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },

  legal: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 16 },

  /* Role selector */
  header: { alignItems: "center", gap: 12, marginBottom: 24 },
  avatarSmall: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff" },
  emailSmall: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1, marginBottom: 8 },

  roleCard: { borderRadius: 20, overflow: "hidden", marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  roleCardGrad: { padding: 2, borderRadius: 20 },
  roleCardInner: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 24, paddingHorizontal: 22 },
  roleCardEmoji: { fontSize: 36 },
  roleCardText: { flex: 1, gap: 4 },
  roleCardTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  roleCardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },

  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, borderWidth: 1 },
  logoutText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
});
