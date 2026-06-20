import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

/**
 * Stripe Connect onboarding return screen.
 *
 * On native, `WebBrowser.openAuthSessionAsync` intercepts the redirect, so this
 * is mainly the web landing page after a DJ finishes (or exits) Stripe's hosted
 * onboarding. Payout readiness is re-checked when the DJ reopens their wallet.
 */
export default function ConnectReturn() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: "Configuration Stripe" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.iconCircle, { backgroundColor: "#635BFF22", borderColor: "#635BFF" }]}>
          <MaterialCommunityIcons name="bank-check" size={36} color="#635BFF" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Configuration enregistrée</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Stripe vérifie vos informations. Rouvrez votre wallet DJ pour voir l'état
          de vos virements une fois la vérification terminée.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/dj")}
          style={[styles.btn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Feather name="arrow-left" size={18} color={colors.primaryForeground} />
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Retour au wallet DJ</Text>
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
  btn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 16 },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
