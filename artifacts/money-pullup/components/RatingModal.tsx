import { Feather, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { submitReview } from "@/lib/reviews";

interface Props {
  visible: boolean;
  onClose: () => void;
  djId: string;
  djName: string;
}

export function RatingModal({ visible, onClose, djId, djName }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setRating(0); setComment(""); setError(null);
    onClose();
  };

  const pick = (n: number) => {
    setRating(n);
    if (Platform.OS !== "web") Haptics.selectionAsync();
  };

  const handleSubmit = async () => {
    if (rating < 1) { setError("Sélectionnez une note."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview({ djId, rating, comment: comment.trim() });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      close();
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
              <FontAwesome name="star" size={18} color="#FFD700" />
              <Text style={styles.headerTitle}>Noter {djName}</Text>
            </View>
            <TouchableOpacity onPress={close} style={styles.closeBtn}>
              <Feather name="x" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.prompt}>Quelle note donnez-vous à ce DJ ?</Text>

            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => pick(n)} activeOpacity={0.7}>
                  <FontAwesome
                    name={n <= rating ? "star" : "star-o"}
                    size={40}
                    color={n <= rating ? "#FFD700" : "#d1d5db"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Un commentaire ? (optionnel)"
              placeholderTextColor="#9ca3af"
              maxLength={500}
              multiline
              style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.submitBtn}>
              <LinearGradient colors={["#7C3AED", "#5B11CC"]} style={styles.submitGrad}>
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Feather name="check" size={17} color="#fff" />
                )}
                <Text style={styles.submitText}>{submitting ? "Envoi…" : "Publier mon avis"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },

  body: { padding: 24, gap: 18, alignItems: "center", paddingBottom: 40 },
  prompt: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#374151" },
  stars: { flexDirection: "row", gap: 12 },
  input: { width: "100%", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: "#111827", backgroundColor: "#f9fafb", height: 80, textAlignVertical: "top" },
  error: { color: "#EF4444", fontSize: 13, fontFamily: "Inter_400Regular" },
  submitBtn: { width: "100%", borderRadius: 14, overflow: "hidden" },
  submitGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  submitText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
