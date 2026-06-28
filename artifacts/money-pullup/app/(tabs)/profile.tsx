import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

type Mode = "login" | "register";

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

/* ─── Logged-in profile summary ─── */
function ProfileSummary({ uid, email }: { uid: string; email: string | null }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await signOutUser();
      await ensureSignedIn(); // back to anonymous
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
          styles.summaryScroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <LinearGradient
          colors={["#FF2D78", "#9B0020"]}
          style={styles.avatar}
        >
          <Text style={styles.avatarLetter}>
            {email ? email[0].toUpperCase() : "?"}
          </Text>
        </LinearGradient>

        <Text style={[styles.emailText, { color: colors.foreground }]}>
          {email ?? "Compte anonyme"}
        </Text>
        <Text style={[styles.uidText, { color: colors.mutedForeground }]}>
          ID : {uid.slice(0, 8)}…
        </Text>

        {/* Role shortcuts */}
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, { backgroundColor: "#EE003322", borderColor: "#EE0033" }]}
            onPress={() => { if (Platform.OS !== "web") Haptics.selectionAsync(); router.navigate("/(tabs)/"); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleBtnIcon]}>👥</Text>
            <Text style={[styles.roleBtnLabel, { color: "#EE0033" }]}>Fan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, { backgroundColor: "#4A12A022", borderColor: "#7C3AED" }]}
            onPress={() => { if (Platform.OS !== "web") Haptics.selectionAsync(); router.navigate("/(tabs)/dj"); }}
            activeOpacity={0.8}
          >
            <Text style={styles.roleBtnIcon}>🎧</Text>
            <Text style={[styles.roleBtnLabel, { color: "#9B59B6" }]}>DJ</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <View style={[styles.linksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.navigate("/fan/profile" as never)}>
            <Feather name="user" size={18} color={colors.primary} />
            <Text style={[styles.linkLabel, { color: colors.foreground }]}>Mon profil Fan</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.linkRow} onPress={() => router.navigate("/dj/profile" as never)}>
            <MaterialCommunityIcons name="music-circle" size={18} color={colors.primary} />
            <Text style={[styles.linkLabel, { color: colors.foreground }]}>Mon profil DJ</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={busy}
          style={[styles.logoutBtn, { borderColor: colors.border }]}
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

/* ─── Login / Register form ─── */
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

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(firebaseAuth(), (user) => {
      setUid(user?.uid ?? null);
      setUserEmail(user?.email ?? null);
      setIsAnonymous(user?.isAnonymous ?? true);
    });
  }, []);

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
    if (!email.trim() || !password) { shake(); return; }
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

  // Show profile summary if logged in with real account
  if (uid && !isAnonymous) {
    return <ProfileSummary uid={uid} email={userEmail} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: "#050010" }]}>
      <GlowBackground />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Branding ── */}
          <View style={styles.hero}>
            <LinearGradient
              colors={["#FF2D78", "#9B0020"]}
              style={styles.logoCircle}
            >
              <Text style={styles.logoEmoji}>🎧</Text>
            </LinearGradient>
            <Text style={styles.appName}>Money Pull Up</Text>
            <Text style={[styles.tagline, { color: "rgba(255,255,255,0.5)" }]}>
              Tips · Réservations · Live
            </Text>
          </View>

          {/* ── Mode toggle ── */}
          <View style={[styles.modeToggle, { backgroundColor: "rgba(255,255,255,0.07)" }]}>
            {(["login", "register"] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modeBtn,
                  mode === m && styles.modeBtnActive,
                ]}
                onPress={() => { setMode(m); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.modeBtnText,
                  { color: mode === m ? "#fff" : "rgba(255,255,255,0.45)" },
                ]}>
                  {m === "login" ? "Connexion" : "Inscription"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Form ── */}
          <Animated.View
            style={[
              styles.formCard,
              { borderColor: "rgba(255,255,255,0.1)", transform: [{ translateX: shakeAnim }] },
            ]}
          >
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

          {/* ── CTA ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={busy}
            activeOpacity={0.85}
            style={styles.ctaWrap}
          >
            <LinearGradient
              colors={["#FF2D78", "#C0004A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name={mode === "login" ? "log-in" : "user-plus"} size={18} color="#fff" />
                  <Text style={styles.ctaText}>
                    {mode === "login" ? "Se connecter" : "Créer un compte"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
            <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "Inter_400Regular" }}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
          </View>

          {/* ── Anonymous ── */}
          <TouchableOpacity
            onPress={handleAnonymous}
            disabled={busy}
            style={[styles.anonBtn, { borderColor: "rgba(255,255,255,0.15)" }]}
            activeOpacity={0.7}
          >
            <Feather name="user-x" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={styles.anonText}>Continuer sans compte</Text>
          </TouchableOpacity>

          {/* ── Legal note ── */}
          <Text style={styles.legal}>
            En vous connectant vous acceptez nos{" "}
            <Text style={{ color: "#FF2D78" }}>CGU</Text> et notre{" "}
            <Text style={{ color: "#FF2D78" }}>politique de confidentialité</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ─── STYLES ─── */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Login form */
  scroll: {
    paddingHorizontal: 24,
    alignItems: "stretch",
    gap: 16,
  },

  hero: { alignItems: "center", gap: 10, marginBottom: 8 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF2D78",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: { fontSize: 38 },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  tagline: { fontSize: 13, fontFamily: "Inter_400Regular" },

  modeToggle: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: "center" },
  modeBtnActive: { backgroundColor: "#FF2D78" },
  modeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  fieldWrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 54 },
  fieldIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#fff",
  },
  eyeBtn: { padding: 6 },
  fieldDivider: { height: 1 },

  ctaWrap: { borderRadius: 16, overflow: "hidden" },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
  },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },

  anonBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
  },
  anonText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },

  legal: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    lineHeight: 16,
  },

  /* Profile summary */
  summaryScroll: {
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#FF2D78",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  avatarLetter: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff" },
  emailText: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  uidText: { fontSize: 11, fontFamily: "Inter_400Regular" },

  roleRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  roleBtnIcon: { fontSize: 22 },
  roleBtnLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },

  linksCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  linkLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  divider: { height: 1, marginHorizontal: 18 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#EF4444" },
});
