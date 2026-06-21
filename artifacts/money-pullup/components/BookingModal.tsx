import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

import { createBooking } from "@/lib/bookings";

interface Props {
  visible: boolean;
  onClose: () => void;
  djId: string;
  djName: string;
}

export function BookingModal({ visible, onClose, djId, djName }: Props) {
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEventDate(""); setEventType(""); setLocation("");
    setClientName(""); setClientEmail(""); setClientPhone("");
    setMessage(""); setDone(false); setError(null);
  };

  const close = () => { reset(); onClose(); };

  const dateValid = /^\d{4}-\d{2}-\d{2}$/.test(eventDate.trim());
  const canSubmit = dateValid && clientName.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Renseignez au minimum votre nom et une date au format AAAA-MM-JJ.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        djId,
        eventDate: eventDate.trim(),
        eventType: eventType.trim(),
        location: location.trim(),
        message: message.trim(),
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={close} activeOpacity={1} />

        <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
          <LinearGradient colors={["#2A0060", "#4A12A0", "#2A0060"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="calendar-check" size={20} color="#FFD700" />
              <Text style={styles.headerTitle}>Réserver {djName}</Text>
            </View>
            <TouchableOpacity onPress={close} style={styles.closeBtn}>
              <Feather name="x" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </LinearGradient>

          {done ? (
            <View style={styles.doneBox}>
              <View style={styles.doneIcon}>
                <Feather name="check" size={32} color="#22C55E" />
              </View>
              <Text style={styles.doneTitle}>Demande envoyée !</Text>
              <Text style={styles.doneSub}>
                {djName} a reçu votre demande pour le {eventDate}. Vous serez notifié dès sa réponse.
              </Text>
              <TouchableOpacity onPress={close} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Input label="Date de l'événement *" value={eventDate} onChange={setEventDate} placeholder="AAAA-MM-JJ" />
                <Input label="Type d'événement" value={eventType} onChange={setEventType} placeholder="Mariage, club, anniversaire…" />
                <Input label="Lieu" value={location} onChange={setLocation} placeholder="Ville / salle" />
                <Input label="Votre nom *" value={clientName} onChange={setClientName} placeholder="Nom complet" />
                <Input label="Email" value={clientEmail} onChange={setClientEmail} placeholder="vous@email.com" keyboardType="email-address" />
                <Input label="Téléphone" value={clientPhone} onChange={setClientPhone} placeholder="+33 6 12 34 56 78" keyboardType="phone-pad" />
                <Input label="Message" value={message} onChange={setMessage} placeholder="Détails de votre demande…" multiline />

                {error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit} style={[styles.submitBtn, { opacity: canSubmit ? 1 : 0.5 }]}>
                  <LinearGradient colors={["#7C3AED", "#5B11CC"]} style={styles.submitGrad}>
                    {submitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Feather name="send" size={17} color="#fff" />
                    )}
                    <Text style={styles.submitText}>{submitting ? "Envoi…" : "Envoyer la demande"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 24 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        multiline={multiline}
        style={[styles.input, multiline && { height: 84, textAlignVertical: "top" }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", maxHeight: "92%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", flex: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },

  body: { paddingHorizontal: 20, paddingTop: 18 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#6b7280", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: "#111827", backgroundColor: "#f9fafb" },

  error: { color: "#EF4444", fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },

  submitBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  submitGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },

  doneBox: { alignItems: "center", padding: 32, gap: 12 },
  doneIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(34,197,94,0.12)", alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#111827" },
  doneSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#6b7280", textAlign: "center", lineHeight: 20 },
  doneBtn: { marginTop: 8, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, backgroundColor: "#7C3AED" },
  doneBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
