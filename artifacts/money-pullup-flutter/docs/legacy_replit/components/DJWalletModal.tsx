import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
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

import { BankAccount, DJTransfer, useTips } from "@/contexts/TipsContext";
import { useColors } from "@/hooks/useColors";

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
  const colors = useColors();
  const {
    getDJBalance,
    getDJAvailableBalance,
    djBankAccounts,
    djTransfers,
    updateDJBankAccount,
    requestTransfer,
  } = useTips();

  const [tab, setTab] = useState<Tab>("balance");
  const [bankDraft, setBankDraft] = useState<BankAccount>({ holderName: "", iban: "", bic: "" });
  const [bankSaved, setBankSaved] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  const balance = getDJBalance(djId);
  const available = getDJAvailableBalance(djId);
  const transferred = balance - available;
  const bank = djBankAccounts[djId];
  const transfers = djTransfers.filter((t) => t.djId === djId);

  useEffect(() => {
    if (bank) setBankDraft(bank);
  }, [bank]);

  useEffect(() => {
    if (visible) {
      setTab("balance");
      setTransferSuccess(false);
      setTransferAmount(available > 0 ? available.toFixed(2) : "");
    }
  }, [visible]);

  useEffect(() => {
    setTransferAmount(available > 0 ? available.toFixed(2) : "");
  }, [available]);

  const handleSaveBank = useCallback(() => {
    if (!bankDraft.holderName.trim() || !bankDraft.iban.trim()) {
      Alert.alert("Champs requis", "Veuillez renseigner le titulaire et l'IBAN.");
      return;
    }
    const cleanIban = bankDraft.iban.replace(/\s/g, "").toUpperCase();
    updateDJBankAccount(djId, { ...bankDraft, iban: cleanIban });
    setBankSaved(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setBankSaved(false), 2500);
  }, [bankDraft, djId, updateDJBankAccount]);

  const handleTransfer = useCallback(() => {
    const amt = parseFloat(transferAmount);
    if (!bank?.iban || !bank?.holderName) {
      Alert.alert("Compte manquant", "Veuillez d'abord renseigner vos coordonnées bancaires.", [
        { text: "Configurer", onPress: () => setTab("bank") },
      ]);
      return;
    }
    if (!amt || amt <= 0 || amt > available) {
      Alert.alert("Montant invalide", `Montant disponible : ${available.toFixed(2)}€`);
      return;
    }
    const ok = requestTransfer(djId, amt);
    if (ok) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTransferSuccess(true);
      setTimeout(() => setTransferSuccess(false), 3000);
    }
  }, [transferAmount, bank, available, djId, requestTransfer]);

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "balance", label: "Solde", icon: "wallet" },
    { key: "bank", label: "Compte", icon: "bank" },
    { key: "history", label: "Historique", icon: "history" },
  ];

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

                  {bank?.iban ? (
                    <View style={[styles.bankPreviewRow, { backgroundColor: "#f0fdf4", borderColor: "#22C55E44" }]}>
                      <MaterialCommunityIcons name="bank-check" size={18} color="#22C55E" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankPreviewName}>{bank.holderName}</Text>
                        <Text style={styles.bankPreviewIban}>{maskIban(bank.iban)}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setTab("bank")}>
                        <Feather name="edit-2" size={14} color="#22C55E" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setTab("bank")} style={[styles.noBankBtn, { borderColor: "#F59E0B" }]}>
                      <Feather name="alert-circle" size={16} color="#F59E0B" />
                      <Text style={[styles.noBankText, { color: "#F59E0B" }]}>Configurer un compte bancaire</Text>
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
                    <TouchableOpacity onPress={handleTransfer} style={[styles.transferBtn, { opacity: available > 0 ? 1 : 0.45 }]}>
                      <LinearGradient colors={transferSuccess ? ["#22C55E", "#16a34a"] : ["#7C3AED", "#5B11CC"]} style={styles.transferBtnGrad}>
                        {transferSuccess
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
                      <Text style={[styles.successText, { color: "#22C55E" }]}>Virement en cours de traitement (2–3 jours ouvrés)</Text>
                    </View>
                  )}
                </Animated.View>
              )}

              {/* BANK TAB */}
              {tab === "bank" && (
                <Animated.View entering={FadeIn.duration(200)} style={{ gap: 14 }}>
                  <Text style={styles.sectionTitle}>Coordonnées bancaires</Text>
                  <Text style={styles.sectionSub}>Ces informations sont utilisées pour virer vos tips vers votre compte.</Text>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>Titulaire du compte</Text>
                    <TextInput
                      value={bankDraft.holderName}
                      onChangeText={(v) => setBankDraft((p) => ({ ...p, holderName: v }))}
                      placeholder="Prénom NOM"
                      placeholderTextColor="#9ca3af"
                      style={styles.field}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>IBAN</Text>
                    <TextInput
                      value={bankDraft.iban}
                      onChangeText={(v) => setBankDraft((p) => ({ ...p, iban: v.toUpperCase() }))}
                      placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                      placeholderTextColor="#9ca3af"
                      style={[styles.field, styles.fieldMono]}
                      autoCapitalize="characters"
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>BIC / SWIFT</Text>
                    <TextInput
                      value={bankDraft.bic}
                      onChangeText={(v) => setBankDraft((p) => ({ ...p, bic: v.toUpperCase() }))}
                      placeholder="BNPAFRPPXXX"
                      placeholderTextColor="#9ca3af"
                      style={[styles.field, styles.fieldMono]}
                      autoCapitalize="characters"
                    />
                  </View>

                  <TouchableOpacity onPress={handleSaveBank} style={styles.saveBankBtn}>
                    <LinearGradient colors={bankSaved ? ["#22C55E", "#16a34a"] : ["#7C3AED", "#5B11CC"]} style={styles.saveBankGrad}>
                      {bankSaved
                        ? <Feather name="check-circle" size={18} color="#fff" />
                        : <Feather name="save" size={18} color="#fff" />
                      }
                      <Text style={styles.saveBankText}>{bankSaved ? "Enregistré !" : "Enregistrer"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={[styles.securityNote, { backgroundColor: "#fefce8", borderColor: "#fcd34d" }]}>
                    <Feather name="shield" size={14} color="#d97706" />
                    <Text style={[styles.securityText, { color: "#92400e" }]}>
                      Ces données sont stockées localement et ne sont jamais transmises sans votre accord.
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

  return (
    <View style={trStyles.row}>
      <View style={[trStyles.statusDot, { backgroundColor: statusColor[transfer.status] }]} />
      <View style={{ flex: 1 }}>
        <Text style={trStyles.amount}>+{transfer.amount.toFixed(2)}€</Text>
        <Text style={trStyles.iban}>{maskIban(transfer.iban)}</Text>
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

  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#374151" },
  field: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: "#111827" },
  fieldMono: { fontFamily: "Inter_500Medium", letterSpacing: 0.5 },

  saveBankBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  saveBankGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  saveBankText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  securityNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
  securityText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  emptyHistory: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyHistoryText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#9ca3af" },
});
