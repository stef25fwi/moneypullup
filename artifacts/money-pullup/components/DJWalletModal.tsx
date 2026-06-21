import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { useDjWallet } from "@/hooks/useDjWallet";
import {
  type AccountStatus,
  createDjConnectAccount,
  createDjOnboardingLink,
  getDjAccountStatus,
} from "@/lib/tipFunctions";

interface Props {
  visible: boolean;
  onClose: () => void;
  djId: string;
}

type Tab = "balance" | "bank";

export function DJWalletModal({ visible, onClose, djId }: Props) {
  const djWallet = useDjWallet();

  const [tab, setTab] = useState<Tab>("balance");
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [busy, setBusy] = useState(false);

  const payoutsEnabled = status?.payoutsEnabled ?? false;

  const refreshStatus = useCallback(async () => {
    if (!djId) return;
    setLoadingStatus(true);
    try {
      setStatus(await getDjAccountStatus(djId));
    } catch {
      // Account may not exist yet — keep null status.
    } finally {
      setLoadingStatus(false);
    }
  }, [djId]);

  useEffect(() => {
    if (visible) {
      setTab("balance");
      refreshStatus();
    }
  }, [visible]);

  const handleConnect = useCallback(async () => {
    setBusy(true);
    try {
      // Idempotent: creates the Stripe Express account if it doesn't exist yet.
      await createDjConnectAccount(djId);

      const returnUrl = Linking.createURL("dj/connect");
      const { url } = await createDjOnboardingLink({ djId, refreshUrl: returnUrl, returnUrl });

      if ((Platform.OS as string) === "web") {
        if (typeof window !== "undefined") window.location.assign(url);
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);
      if (result.type === "success") await refreshStatus();
      Haptics.selectionAsync();
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir la configuration Stripe. Vérifiez votre connexion.");
    } finally {
      setBusy(false);
    }
  }, [djId, refreshStatus]);

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "balance", label: "Solde", icon: "wallet" },
    { key: "bank", label: "Paiements", icon: "bank" },
  ];

  const connectLabel = payoutsEnabled
    ? "Mettre à jour mes informations"
    : status
      ? "Continuer la configuration"
      : "Configurer avec Stripe";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.sheetWrapper}>
          <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
            {/* Header */}
            <LinearGradient
              colors={["#2A0060", "#4A12A0", "#2A0060"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sheetHeader}
            >
              <View style={styles.sheetHeaderLeft}>
                <MaterialCommunityIcons name="wallet" size={22} color="#FFD700" />
                <Text style={styles.sheetTitle}>Wallet DJ</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Tab bar */}
            <View style={styles.tabBar}>
              {TABS.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
                >
                  <MaterialCommunityIcons
                    name={t.icon as any}
                    size={16}
                    color={tab === t.key ? "#7C3AED" : "#9ca3af"}
                  />
                  <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* BALANCE TAB */}
              {tab === "balance" && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <View style={styles.balanceGrid}>
                    <LinearGradient
                      colors={["#FFD70022", "#FFD70008"]}
                      style={[styles.balanceCard, { borderColor: "#FFD70044" }]}
                    >
                      <Text style={styles.balanceCardLabel}>Total encaissé</Text>
                      <Text style={[styles.balanceCardValue, { color: "#FFD700" }]}>
                        {djWallet.totalReceived.toFixed(2)}€
                      </Text>
                    </LinearGradient>
                    <LinearGradient
                      colors={["#22C55E22", "#22C55E08"]}
                      style={[styles.balanceCard, { borderColor: "#22C55E44" }]}
                    >
                      <Text style={styles.balanceCardLabel}>Ce soir</Text>
                      <Text style={[styles.balanceCardValue, { color: "#22C55E" }]}>
                        {djWallet.tonightReceived.toFixed(2)}€
                      </Text>
                    </LinearGradient>
                  </View>

                  {djWallet.biggest > 0 && (
                    <View style={[styles.infoRow, { backgroundColor: "#FFF7E6" }]}>
                      <MaterialCommunityIcons name="trophy" size={16} color="#B8860B" />
                      <Text style={[styles.infoRowText, { color: "#B8860B" }]}>
                        Record du soir : {djWallet.biggest.toFixed(2)}€
                      </Text>
                    </View>
                  )}

                  <View style={styles.divider} />

                  <View style={[styles.infoBox, { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }]}>
                    <MaterialCommunityIcons name="bank-transfer" size={18} color="#4338ca" />
                    <Text style={[styles.infoBoxText, { color: "#3730a3" }]}>
                      Les tips acceptés sont automatiquement virés sur votre compte Stripe. Gérez vos
                      virements bancaires depuis votre tableau de bord Stripe Express.
                    </Text>
                  </View>

                  {!payoutsEnabled && (
                    <TouchableOpacity
                      onPress={() => setTab("bank")}
                      style={[styles.noBankBtn, { borderColor: "#F59E0B" }]}
                    >
                      <Feather name="alert-circle" size={16} color="#F59E0B" />
                      <Text style={[styles.noBankText, { color: "#F59E0B" }]}>
                        Configurer les paiements Stripe
                      </Text>
                      <Feather name="chevron-right" size={16} color="#F59E0B" />
                    </TouchableOpacity>
                  )}
                </Animated.View>
              )}

              {/* PAYMENTS (STRIPE CONNECT) TAB */}
              {tab === "bank" && (
                <Animated.View entering={FadeIn.duration(200)} style={{ gap: 14 }}>
                  <Text style={styles.sectionTitle}>Paiements Stripe</Text>
                  <Text style={styles.sectionSub}>
                    Connectez un compte Stripe pour recevoir vos tips directement sur votre banque.
                  </Text>

                  {loadingStatus ? (
                    <View style={styles.statusLoading}>
                      <ActivityIndicator color="#7C3AED" />
                    </View>
                  ) : payoutsEnabled ? (
                    <View style={[styles.connectedCard, { backgroundColor: "#f0fdf4", borderColor: "#22C55E44" }]}>
                      <MaterialCommunityIcons name="check-decagram" size={28} color="#22C55E" />
                      <Text style={styles.connectedTitle}>Compte Stripe connecté</Text>
                      <Text style={styles.connectedSub}>Vos virements sont activés.</Text>
                    </View>
                  ) : status ? (
                    <View style={[styles.connectedCard, { backgroundColor: "#fffbeb", borderColor: "#F59E0B44" }]}>
                      <MaterialCommunityIcons name="progress-clock" size={28} color="#F59E0B" />
                      <Text style={styles.connectedTitle}>Configuration incomplète</Text>
                      <Text style={styles.connectedSub}>Terminez la vérification pour activer les virements.</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity onPress={handleConnect} disabled={busy} style={styles.saveBankBtn}>
                    <LinearGradient colors={["#635BFF", "#4B45D6"]} style={styles.saveBankGrad}>
                      {busy ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <MaterialCommunityIcons name="bank-outline" size={18} color="#fff" />
                      )}
                      <Text style={styles.saveBankText}>{connectLabel}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={[styles.securityNote, { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }]}>
                    <Feather name="shield" size={14} color="#4338ca" />
                    <Text style={[styles.securityText, { color: "#3730a3" }]}>
                      Vos informations bancaires sont collectées et sécurisées directement par Stripe.
                      L'application n'y a jamais accès.
                    </Text>
                  </View>
                </Animated.View>
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheetWrapper: { justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "88%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: "#7C3AED" },
  tabLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#9ca3af" },
  tabLabelActive: { color: "#7C3AED", fontFamily: "Inter_700Bold" },

  body: { padding: 20, paddingBottom: 40 },

  balanceGrid: { flexDirection: "row", gap: 12, marginBottom: 14 },
  balanceCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  balanceCardLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#6b7280" },
  balanceCardValue: { fontSize: 22, fontFamily: "Inter_700Bold" },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, marginBottom: 4 },
  infoRowText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 16 },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  infoBoxText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },

  noBankBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  noBankText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },

  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6b7280", marginBottom: 4 },

  statusLoading: { alignItems: "center", paddingVertical: 24 },
  connectedCard: {
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  connectedTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#111827", marginTop: 4 },
  connectedSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6b7280", textAlign: "center" },

  saveBankBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  saveBankGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  saveBankText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  securityText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
