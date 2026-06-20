import { Feather } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTips } from "@/contexts/TipsContext";
import { useColors } from "@/hooks/useColors";

/**
 * Stripe Checkout return screen.
 *
 * On native, `WebBrowser.openAuthSessionAsync` intercepts the redirect before
 * this route is reached, so this is primarily the web landing page after a
 * top-up. On web the in-app modal is left behind by the redirect, so the
 * wallet is credited optimistically here using the amount carried in the URL.
 */
export default function WalletTopUpReturn() {
  const colors = useColors();
  const { addFunds } = useTips();
  const params = useLocalSearchParams<{ status?: string; amount?: string }>();
  const status = params.status === "cancel" ? "cancel" : "success";
  const amount = Number(params.amount ?? 0);
  const credited = useRef(false);

  useEffect(() => {
    if (status === "success" && !credited.current) {
      credited.current = true;
      // Native already credited inside the modal; only web reaches this screen.
      if (Platform.OS === "web" && amount > 0) addFunds(amount);
    }
  }, [status, amount, addFunds]);

  const success = status === "success";

  return (
    <>
      <Stack.Screen options={{ title: success ? "Paiement réussi" : "Paiement annulé" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: success ? "#22C55E22" : "#F59E0B22", borderColor: success ? "#22C55E" : "#F59E0B" },
          ]}
        >
          <Feather name={success ? "check" : "x"} size={36} color={success ? "#22C55E" : "#F59E0B"} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {success ? "Rechargement réussi" : "Paiement annulé"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {success
            ? amount > 0
              ? `${amount}€ ont été ajoutés à votre portefeuille.`
              : "Votre portefeuille a été rechargé."
            : "Aucun montant n'a été débité."}
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={[styles.btn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Retour à l'application</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 16 },
  iconCircle: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  btn: { marginTop: 12, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 16 },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
