import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import QRCode from "react-native-qrcode-svg";

interface Props {
  visible: boolean;
  onClose: () => void;
  djId: string;
  djName: string;
}

function getDjShareUrl(djId: string): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/dj/${djId}`;
  }
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
  if (webUrl) return `${webUrl.replace(/\/$/, "")}/dj/${djId}`;
  return Linking.createURL(`/dj/${djId}`);
}

export function DjShareModal({ visible, onClose, djId, djName }: Props) {
  const [copied, setCopied] = useState(false);
  const url = getDjShareUrl(djId);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { url, message: `Envoie un tip à ${djName} 🎧` }
          : { message: `Envoie un tip à ${djName} 🎧\n${url}` },
      );
    } catch {
      // User cancelled
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

        <Animated.View entering={SlideInDown.springify().damping(18)} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
          {/* Header */}
          <LinearGradient
            colors={["#2A0060", "#4A12A0", "#2A0060"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="qrcode" size={22} color="#FFD700" />
              <Text style={styles.headerTitle}>Partager ma page</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.body}>
            <Text style={styles.sub}>
              Les fans scannent ce QR code pour vous envoyer un tip directement.
            </Text>

            {/* QR Code */}
            <View style={styles.qrWrap}>
              <QRCode
                value={url}
                size={200}
                color="#130028"
                backgroundColor="#fff"
              />
            </View>

            {/* URL display */}
            <View style={styles.urlRow}>
              <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">
                {url}
              </Text>
              <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
                <Feather name={copied ? "check" : "copy"} size={16} color={copied ? "#22C55E" : "#7C3AED"} />
              </TouchableOpacity>
            </View>
            {copied && <Text style={styles.copiedLabel}>Lien copié !</Text>}

            {/* Share button */}
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <LinearGradient colors={["#7C3AED", "#5B11CC"]} style={styles.shareBtnGrad}>
                <Feather name="share-2" size={18} color="#fff" />
                <Text style={styles.shareBtnText}>Partager le lien</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.hint}>
              🎧 Fonctionne aussi en QR code imprimé sur votre scène
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  body: { padding: 24, alignItems: "center", gap: 16, paddingBottom: 40 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#6b7280", textAlign: "center" },

  qrWrap: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "100%",
  },
  urlText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "#374151" },
  copyBtn: { padding: 4 },
  copiedLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#22C55E", marginTop: -8 },

  shareBtn: { width: "100%", borderRadius: 14, overflow: "hidden" },
  shareBtnGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16,
  },
  shareBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },

  hint: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9ca3af", textAlign: "center" },
});
