import { Feather, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useTips } from "@/contexts/TipsContext";

const FUND_AMOUNTS = [10, 20, 50, 100];

interface StripeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StripeModal({ visible, onClose }: StripeModalProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { addFunds } = useTips();
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = useCallback(async () => {
    setIsProcessing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await new Promise((resolve) => setTimeout(resolve, 1400));
    addFunds(selectedAmount);
    setIsProcessing(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
    Alert.alert(
      "Rechargement réussi",
      `${selectedAmount}€ ajoutés à votre portefeuille !`,
      [{ text: "Super !" }]
    );
  }, [selectedAmount, addFunds, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { borderColor: colors.glassBorder }]}>
          {Platform.OS !== "web" && (
            <BlurView
              intensity={isDark ? 60 : 80}
              tint={isDark ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 28, borderTopRightRadius: 28 }]}
            />
          )}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(13,0,24,0.75)" : "rgba(243,238,255,0.85)", borderTopLeftRadius: 28, borderTopRightRadius: 28 }]} />
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.stripeRow}>
              <MaterialIcons name="credit-card" size={22} color={colors.violet} />
              <Text style={[styles.stripeLabel, { color: colors.violet }]}>
                Stripe Secure
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            Recharger le portefeuille
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Choisissez le montant à ajouter
          </Text>

          <View style={styles.amountsGrid}>
            {FUND_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => {
                  setSelectedAmount(amt);
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                }}
                style={[
                  styles.amountBtn,
                  {
                    backgroundColor:
                      selectedAmount === amt ? colors.primary : colors.secondary,
                    borderColor:
                      selectedAmount === amt ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.amountBtnText,
                    {
                      color:
                        selectedAmount === amt
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {amt}€
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={[
              styles.cardPreview,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="credit-card" size={18} color={colors.mutedForeground} />
            <Text style={[styles.cardText, { color: colors.mutedForeground }]}>
              •••• •••• •••• 4242
            </Text>
            <Text style={[styles.cardBrand, { color: colors.mutedForeground }]}>
              VISA
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePay}
            disabled={isProcessing}
            style={[
              styles.payBtn,
              {
                backgroundColor: isProcessing ? colors.muted : colors.primary,
                shadowColor: colors.primary,
              },
            ]}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <Text style={[styles.payBtnText, { color: colors.primaryForeground }]}>
                Traitement...
              </Text>
            ) : (
              <>
                <Feather name="zap" size={18} color={colors.primaryForeground} />
                <Text style={[styles.payBtnText, { color: colors.primaryForeground }]}>
                  Payer {selectedAmount}€
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.secureNote, { color: colors.mutedForeground }]}>
            Paiement sécurisé via Stripe — Vos données sont protégées
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  stripeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stripeLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },
  amountsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  amountBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
  },
  amountBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2,
  },
  cardBrand: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  payBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  secureNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
