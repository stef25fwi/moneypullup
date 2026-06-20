import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { DJTransfer, useTips } from "@/contexts/TipsContext";
import {
  AccountStatus,
  createConnectedAccount,
  getAccountStatus,
  requestPayout,
  startOnboarding,
} from "@/lib/connect";
import { PaymentConfigError } from "@/lib/payments";

interface Props {
  visible: boolean;
  onClose: () => void;
  djId: string;
}

type Tab = "balance" | "bank" | "history";

function maskIban(iban: string) {
  if (iban.length < 8) return iban;
  return iban.slice(0, 4) + " **** **** " + iban.slice(-4);
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function DJWalletModal({ visible, onClose, djId }: Props) {
  const {
    getDJBalance,
    getDJAvailableBalance,
    djStripeAccounts,
    djTransfers,
    setDJStripeAccount,
    recordPayout,
  } = useTips();

  const [tab, setTab] = useState<Tab>("balance");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [busy, setBusy] = useState(false);

  const balance = getDJBalance(djId);
  const available = getDJAvailableBalance(djId);
  const transferred = balance - available;
  const accountId = djStripeAccounts[djId];
  const payoutsEnabled = status?.payoutsEnabled ?? false;
  const transfers = djTransfers.filter((t) => t.djId === djId);

  const refreshStatus = useCallback(async (id: string) => {
    setLoadingStatus(true);
    try {
      setStatus(await getAccountStatus(id));
    } catch {
      /* ignore — keep last known status */
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setTab("balance");
      setTransferSuccess(false);
      setTransferAmount(available > 0 ? available.toFixed(2) : "");
      if (accountId) refreshStatus(accountId);
      else setStatus(null);
    }
  }, [visible]);

  useEffect(() => {
    setTransferAmount(available > 0 ? available.toFixed(2) : "");
  }, [available]);

  const handleConnect = useCallback(async () => {
    setBusy(true);
    try {
      let id = accountId;
      if (!id) {
        id = await createConnectedAccount(djId);
        setDJStripeAccount(djId, id);
      }
      const result = await startOnboarding(id);
      if (result === "returned") await refreshStatus(id);
      if (Platform.OS !== "web") Haptics.selectionAsync();
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof PaymentConfigError
          ? "Les paiements ne sont pas configurés. Réessayez plus tard."
          : "Impossible d'ouvrir la configuration Stripe.",
      );
    } finally {
      setBusy(false);
    }
  }, [accountId, djId, setDJStripeAccount, refreshStatus]);

  const handleTransfer = useCallback(async () => {
    const amt = parseFloat(transferAmount);
    if (!accountId || !payoutsEnabled) {
      Alert.alert(
        "Compte non configuré",
        "Configurez d'abord vos paiements Stripe pour recevoir des virements.",
        [{ text: "Configurer", onPress: () => setTab("bank") }],
      );
      return;
    }
    if (!amt || amt <= 0 || amt > available) {
      Alert.alert("Montant invalide", `Montant disponible : ${available.toFixed(2)}€`);
      return;
    }
    setBusy(true);
    try {
      const transferId = await requestPayout(accountId, amt, djId);
      recordPayout(djId, amt, { destinationLabel: "Compte Stripe", stripeTransferId: transferId });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTransferSuccess(true);
      setTimeout(() => setTransferSuccess(false), 3000);
    } catch {
      Alert.alert("Virement échoué", "Le virement n'a pas pu être effectué. Réessayez plus tard.");
    } finally {
      setBusy(false);
    }
  }, [transferAmount, accountId, payoutsEnabled, available, djId, recordPayout]);

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "balance", label: "Solde", icon: "wallet" },
    { key: "bank", label: "Paiements", icon: "bank" },
    { key: "history", label: "Historique", icon: "history" },
  ];

  const connectLabel = payoutsEnabled
    ? "Mettre à jour mes informations"
    : accountId
      ? "Continuer la configuration"
      : "Configurer avec Stripe";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.sheetWrapper}>
          <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
            {/* Header */}
            <LinearGradient colors={["#2A0060", "#4A12A0", "#2A0060"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sheetHeader}>
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
                <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.tabItem, tab === t.key && styles.tabItemActive]}>
                  <MaterialCommunityIcons name={t.icon as any} size={16} color={tab === t.key ? "#7C3AED" : "#9ca3af"} />
                  <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

              {/* BALANCE TAB */}
              {tab === "balance" && (
                <Animated.View entering={FadeIn.duration(200)}>
                  {/* Balance cards */}
                  <View style={styles.balanceGrid}>
                    <LinearGradient colors={["#FFD70022", "#FFD70008"]} style={[styles.balanceCard, { borderColor: "#FFD70044" }]}>
                      <Text style={styles.balanceCardLabel}>Total encaissé</Text>
                      <Text style={[styles.balanceCardValue, { color: "#FFD700" }]}>{balance.toFixed(2)}€</Text>
                    </LinearGradient>
                    <LinearGradient colors={["#22C55E22", "#22C55E08"]} style={[styles.balanceCard, { borderColor: "#22C55E44" }]}>
                      <Text style={styles.balanceCardLabel}>Disponible</Text>
                      <Text style={[styles.balanceCardValue, { color: "#22C55E" }]}>{available.toFixed(2)}€</Text>
                    </LinearGradient>
                  </View>

                  {transferred > 0 && (
                    <View style={[styles.transferredRow, { backgroundColor: "#f3f4f6" }]}>
                      <MaterialCommunityIcons name="bank-transfer" size={16} color="#6b7280" />
                      <Text style={styles.transferredText}>Déjà viré : {transferred.toFixed(2)}€</Text>
                    </View>
                  )}

                  <View style={styles.divider} />

                  {/* Transfer form */}
                  <Text style={styles.sectionTitle}>Initier un virement</Text>

                  {payoutsEnabled ? (
                    <View style={[styles.bankPreviewRow, { backgroundColor: "#f0fdf4", borderColor: "#22C55E44" }]}>
                      <MaterialCommunityIcons name="check-decagram" size={18} color="#22C55E" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankPreviewName}>Compte Stripe connecté</Text>
                        <Text style={styles.bankPreviewIban}>Virements activés</Text>
                      </View>
                      <TouchableOpacity onPress={() => setTab("bank")}>
                        <Feather name="settings" size={14} color="#22C55E" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setTab("bank")} style={[styles.noBankBtn, { borderColor: "#F59E0B" }]}>
                      <Feather name="alert-circle" size={16} color="#F59E0B" />
                      <Text style={[styles.noBankText, { color: "#F59E0B" }]}>Configurer les paiements Stripe</Text>
                      <Feather name="chevron-right" size={16} color="#F59E0B" />
                    </TouchableOpacity>
                  )}

                  <View style={styles.transferRow}>
                    <View style={styles.transferInputWrap}>
                      <Text style={styles.transferInputLabel}>Montant (€)</Text>
                      <TextInput
                        value={transferAmount}
                        onChangeText={setTransferAmount}
                        keyboardType="numeric"
                        placeholder={`Max ${available.toFixed(2)}`}
                        placeholderTextColor="#9ca3af"
                        style={styles.transferInput}
                      />
                    </View>
                    <TouchableOpacity onPress={handleTransfer} disabled={busy} style={[styles.transferBtn, { opacity: available > 0 && !busy ? 1 : 0.45 }]}>
                      <LinearGradient colors={transferSuccess ? ["#22C55E", "#16a34a"] : ["#7C3AED", "#5B11CC"]} style={styles.transferBtnGrad}>
                        {busy
                          ? <ActivityIndicator color="#fff" />
                          : transferSuccess
                            ? <Feather name="check-circle" size={18} color="#fff" />
                            : <MaterialCommunityIcons name="bank-transfer-out" size={20} color="#fff" />
                        }
                        <Text style={styles.transferBtnText}>{transferSuccess ? "Envoyé !" : "Virer"}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {transferSuccess && (
                    <View style={[styles.successBanner, { backgroundColor: "#f0fdf4", borderColor: "#22C55E" }]}>
                      <Feather name="check-circle" size={16} color="#22C55E" />
                      <Text style={[styles.successText, { color: "#22C55E" }]}>Virement Stripe initié — versement sous 2–3 jours ouvrés</Text>
                    </View>
                  )}
                </Animated.View>
              )}

              {/* PAYMENTS (STRIPE CONNECT) TAB */}
              {tab === "bank" && (
                <Animated.View entering={FadeIn.duration(200)} style={{ gap: 14 }}>
                  <Text style={styles.sectionTitle}>Paiements Stripe</Text>
                  <Text style={styles.sectionSub}>Connectez un compte Stripe pour recevoir vos tips directement sur votre banque.</Text>

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
                  ) : accountId ? (
                    <View style={[styles.connectedCard, { backgroundColor: "#fffbeb", borderColor: "#F59E0B44" }]}>
                      <MaterialCommunityIcons name="progress-clock" size={28} color="#F59E0B" />
                      <Text style={styles.connectedTitle}>Configuration incomplète</Text>
                      <Text style={styles.connectedSub}>Terminez la vérification pour activer les virements.</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity onPress={handleConnect} disabled={busy} style={styles.saveBankBtn}>
                    <LinearGradient colors={["#635BFF", "#4B45D6"]} style={styles.saveBankGrad}>
                      {busy
                        ? <ActivityIndicator color="#fff" />
                        : <MaterialCommunityIcons name="bank-outline" size={18} color="#fff" />
                      }
                      <Text style={styles.saveBankText}>{connectLabel}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={[styles.securityNote, { backgroundColor: "#eef2ff", borderColor: "#c7d2fe" }]}>
                    <Feather name="shield" size={14} color="#4338ca" />
                    <Text style={[styles.securityText, { color: "#3730a3" }]}>
                      Vos informations bancaires sont collectées et sécurisées directement par Stripe. L'application n'y a jamais accès.
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* HISTORY TAB */}
              {tab === "history" && (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Text style={styles.sectionTitle}>Historique des virements</Text>
                  {transfers.length === 0 ? (
                    <View style={styles.emptyHistory}>
                      <MaterialCommunityIcons name="bank-transfer" size={40} color="#d1d5db" />
                      <Text style={styles.emptyHistoryText}>Aucun virement effectué</Text>
                    </View>
                  ) : (
                    <View style={{ gap: 10 }}>
                      {transfers.map((t) => (
                        <TransferRow key={t.id} transfer={t} />
                      ))}
                    </View>
                  )}
                </Animated.View>
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

function TransferRow({ transfer }: { transfer: DJTransfer }) {
  const statusColor: Record<string, string> = {
    processing: "#F59E0B",
    completed: "#22C55E",
    failed: "#EF4444",
  };
  const statusLabel: Record<string, string> = {
    processing: "En cours",
    completed: "Effectué",
    failed: "Échoué",
  };

  const destination =
    transfer.destinationLabel ?? (transfer.iban ? maskIban(transfer.iban) : "Compte Stripe");

  return (
    <View style={trStyles.row}>
      <View style={[trStyles.statusDot, { backgroundColor: statusColor[transfer.status] }]} />
      <View style={{ flex: 1 }}>
        <Text style={trStyles.amount}>+{transfer.amount.toFixed(2)}€</Text>
        <Text style={trStyles.iban}>{destination}</Text>
        <Text style={trStyles.date}>{formatDate(transfer.date)}</Text>
      </View>
      <View style={[trStyles.badge, { backgroundColor: statusColor[transfer.status] + "22", borderColor: statusColor[transfer.status] + "55" }]}>
        <Text style={[trStyles.badgeText, { color: statusColor[transfer.status] }]}>{statusLabel[transfer.status]}</Text>
      </View>
    </View>
  );
}

const trStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#f9fafb", borderRadius: 12, padding: 14 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  amount: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827" },
  iban: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6b7280", marginTop: 1 },
  date: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#9ca3af", marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheetWrapper: { justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: "hidden", maxHeight: "88%",
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  sheetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },

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

  transferredRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, marginBottom: 4 },
  transferredText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6b7280" },

  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 16 },

  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6b7280", marginBottom: 4 },

  bankPreviewRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14 },
  bankPreviewName: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#111827" },
  bankPreviewIban: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6b7280", marginTop: 2 },

  noBankBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 14, padding: 14, marginBottom: 14 },
  noBankText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },

  transferRow: { flexDirection: "row", gap: 10, marginTop: 14, alignItems: "flex-end" },
  transferInputWrap: { flex: 1 },
  transferInputLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#6b7280", marginBottom: 6 },
  transferInput: { backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, fontFamily: "Inter_700Bold", color: "#111827", borderWidth: 1, borderColor: "#e5e7eb" },
  transferBtn: { borderRadius: 12, overflow: "hidden" },
  transferBtnGrad: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 14 },
  transferBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

  successBanner: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  successText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },

  statusLoading: { alignItems: "center", paddingVertical: 24 },
  connectedCard: { alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 16, paddingVertical: 22, paddingHorizontal: 16 },
  connectedTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#111827", marginTop: 4 },
  connectedSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6b7280", textAlign: "center" },

  saveBankBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  saveBankGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  saveBankText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  securityNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
  securityText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  emptyHistory: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyHistoryText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#9ca3af" },
});
