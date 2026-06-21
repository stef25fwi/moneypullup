import { Feather, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlowBackground } from "@/components/GlowBackground";
import { GlassCard } from "@/components/GlassCard";
import { TipNotification } from "@/components/TipNotification";
import { DJWalletModal } from "@/components/DJWalletModal";
import { useTips, SocialLinks, Tip } from "@/contexts/TipsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { useDjInbox } from "@/hooks/useDjInbox";
import { useDjWallet } from "@/hooks/useDjWallet";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { updateDjProfile } from "@/lib/djFirestore";

const SWIPE_THRESHOLD = 80;

function AcceptTipCard({
  tip,
  onAccept,
  onRefuse,
}: {
  tip: Tip;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
}) {
  const colors = useColors();
  const translateX = useSharedValue(0);
  const btnScale = useSharedValue(1);

  const triggerAccept = useCallback(() => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAccept(tip.id);
  }, [tip.id, onAccept]);

  const triggerRefuse = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRefuse(tip.id);
  }, [tip.id, onRefuse]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(400, { damping: 20 });
        runOnJS(triggerAccept)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-400, { damping: 20 });
        runOnJS(triggerRefuse)();
      } else {
        translateX.value = withSpring(0, { damping: 18 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const refuseHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -20, 0], [1, 0.4, 0], "clamp"),
  }));

  const acceptHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 20, SWIPE_THRESHOLD], [0, 0.4, 1], "clamp"),
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      ["#EF444433", "transparent", "#22C55E33"],
    ),
    borderRadius: 16,
    ...StyleSheet.absoluteFillObject,
  }));

  const handleAcceptBtn = () => {
    btnScale.value = withSequence(withSpring(0.92, { damping: 8 }), withSpring(1.06, { damping: 8 }), withSpring(1, { damping: 10 }));
    setTimeout(() => triggerAccept(), 220);
  };

  const btnAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const isLarge = tip.amount >= 30;
  const isHuge = tip.amount >= 50;
  const glowColor = isHuge ? colors.gold : isLarge ? colors.accent : colors.violet;

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} layout={Layout.springify()} style={{ marginBottom: 8 }}>
      {/* Swipe hints behind the card */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[{ ...StyleSheet.absoluteFillObject, borderRadius: 16, backgroundColor: "#EF4444", alignItems: "flex-end", justifyContent: "center", paddingRight: 20 }, refuseHintStyle]}>
          <MaterialCommunityIcons name="close-circle" size={28} color="#fff" />
        </Animated.View>
        <Animated.View style={[{ ...StyleSheet.absoluteFillObject, borderRadius: 16, backgroundColor: "#22C55E", alignItems: "flex-start", justifyContent: "center", paddingLeft: 20 }, acceptHintStyle]}>
          <MaterialCommunityIcons name="cash-check" size={28} color="#fff" />
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle}>
          <GlassCard style={[styles.pendingCard, { borderColor: glowColor }]} borderColor={glowColor} intensity={55}>
            <Animated.View style={overlayStyle} pointerEvents="none" />
            <View style={styles.pendingTop}>
              <View style={[styles.pendingAmountBadge, { backgroundColor: glowColor }]}>
                <Text style={[styles.pendingAmount, { color: glowColor === colors.gold ? "#000" : "#fff" }]}>
                  +{tip.amount}€
                </Text>
              </View>
              <View style={styles.pendingInfo}>
                <Text style={[styles.pendingFrom, { color: colors.foreground }]}>{tip.fromName}</Text>
                {tip.message ? (
                  <Text style={[styles.pendingMessage, { color: colors.mutedForeground }]} numberOfLines={1}>
                    "{tip.message}"
                  </Text>
                ) : null}
              </View>
              <View style={[styles.pendingChip, { backgroundColor: "#F59E0B22", borderColor: "#F59E0B" }]}>
                <Text style={[styles.pendingChipText, { color: "#F59E0B" }]}>EN ATTENTE</Text>
              </View>
            </View>

            <View style={styles.pendingActions}>
              <TouchableOpacity
                onPress={triggerRefuse}
                style={[styles.refuseBtn, { borderColor: "#EF4444" }]}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={[styles.refuseBtnText, { color: "#EF4444" }]}>REFUSER</Text>
              </TouchableOpacity>

              <Animated.View style={[btnAnimStyle, { flex: 1 }]}>
                <TouchableOpacity
                  onPress={handleAcceptBtn}
                  style={[styles.acceptBtn, { backgroundColor: glowColor, shadowColor: glowColor }]}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="cash-check" size={20} color={glowColor === colors.gold ? "#000" : "#fff"} />
                  <Text style={[styles.acceptBtnText, { color: glowColor === colors.gold ? "#000" : "#fff" }]}>
                    ACCEPTER
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </GlassCard>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function DJScreen() {
  const colors = useColors();
  const { toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    djs, currentDJName, setCurrentDJName,
    getTipsForDJ, getPendingTipsForDJ, getDJBalance, getDJAvailableBalance,
    acceptTip, updateDJSocialLinks, toggleDJLive,
  } = useTips();
  const inbox = useDjInbox();
  const djWallet = useDjWallet();

  // Use Firebase Auth UID as the DJ's canonical ID when Firebase is configured.
  const [authDjId, setAuthDjId] = useState<string | null>(null);
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return onAuthStateChanged(firebaseAuth(), (user) => setAuthDjId(user?.uid ?? null));
  }, []);
  const activeDJId = authDjId ?? "dj1";

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentDJName);
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialDraft, setSocialDraft] = useState<SocialLinks>({ instagram: "", tiktok: "", facebook: "" });
  const [autoMessage, setAutoMessage] = useState("");
  const [editingAutoMessage, setEditingAutoMessage] = useState(false);
  const [autoMessageDraft, setAutoMessageDraft] = useState("");
  const [walletOpen, setWalletOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const myDj = djs.find((d) => d.id === activeDJId);
  const myTips = getTipsForDJ(activeDJId);
  // When Firebase is configured, pending (held) tips come live from Firestore.
  const pendingTips = inbox.active ? inbox.pendingTips : getPendingTipsForDJ(activeDJId);
  const handleAcceptTip = inbox.active ? inbox.accept : acceptTip;
  const handleRefuseTip = inbox.active ? inbox.refuse : (id: string) => {};
  const acceptedTips = myTips.filter((t) => t.status === "accepted");
  // DJ wallet: real total of captured tips when the backend is configured.
  const myBalance = djWallet.active ? djWallet.totalReceived : getDJBalance(activeDJId);
  const acceptedCount = djWallet.active ? djWallet.count : acceptedTips.length;
  const biggestTip = acceptedTips.length > 0 ? Math.max(...acceptedTips.map((t) => t.amount)) : 0;
  const recordTip = djWallet.active ? djWallet.biggest : biggestTip;
  // Live status: use local state for Firebase mode (persisted to Firestore), context for mock mode.
  const djIsLive = inbox.active ? isLive : (myDj?.isLive ?? false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleSaveName = useCallback(() => {
    const name = nameInput.trim().toUpperCase();
    if (name) {
      setCurrentDJName(name);
      updateDjProfile(activeDJId, { name }).catch(() => {});
    }
    setEditingName(false);
  }, [nameInput, setCurrentDJName, activeDJId]);

  const handleToggleLive = useCallback(() => {
    if (inbox.active) {
      const next = !isLive;
      setIsLive(next);
      updateDjProfile(activeDJId, { isLive: next }).catch(() => {});
    } else {
      toggleDJLive(activeDJId);
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [inbox.active, isLive, activeDJId, toggleDJLive]);

  const handleEditSocial = useCallback(() => {
    setSocialDraft(myDj?.socialLinks ?? { instagram: "", tiktok: "", facebook: "" });
    setEditingSocial(true);
  }, [myDj]);

  const handleSaveSocial = useCallback(() => {
    updateDJSocialLinks(activeDJId, socialDraft);
    updateDjProfile(activeDJId, { socialLinks: socialDraft }).catch(() => {});
    setEditingSocial(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [activeDJId, socialDraft, updateDJSocialLinks]);

  const handleSaveAutoMessage = useCallback(() => {
    const msg = autoMessageDraft.trim().slice(0, 160);
    setAutoMessage(msg);
    updateDjProfile(activeDJId, { autoMessage: msg }).catch(() => {});
    setEditingAutoMessage(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [autoMessageDraft, activeDJId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowBackground />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: topPadding + 12,
            paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modeLabel, { color: colors.violet }]}>MODE DJ</Text>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  style={[styles.nameInput, { color: colors.foreground, borderColor: colors.primary, backgroundColor: colors.glassBackground }]}
                  onSubmitEditing={handleSaveName}
                  returnKeyType="done"
                  autoCapitalize="characters"
                />
                <TouchableOpacity onPress={handleSaveName}>
                  <Feather name="check" size={20} color={colors.neonGreen} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setNameInput(currentDJName); setEditingName(true); }} style={styles.nameRow}>
                <Text style={[styles.djTitle, { color: colors.foreground }]}>{currentDJName}</Text>
                <Feather name="edit-2" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => { toggleTheme(); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
              style={[styles.themeToggle, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}
            >
              <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? colors.gold : colors.violet} />
            </TouchableOpacity>

            {/* Wallet button */}
            <TouchableOpacity
              onPress={() => setWalletOpen(true)}
              style={[styles.walletBtn, { backgroundColor: colors.glassBackground, borderColor: colors.gold }]}
            >
              <MaterialCommunityIcons name="wallet" size={18} color={colors.gold} />
              <Text style={[styles.walletBtnText, { color: colors.gold }]}>
                {getDJAvailableBalance(activeDJId).toFixed(0)}€
              </Text>
            </TouchableOpacity>

            {/* Live toggle */}
            <TouchableOpacity
              onPress={handleToggleLive}
              activeOpacity={0.85}
              style={[
                styles.liveToggle,
                { backgroundColor: djIsLive ? "#FF2D78" : colors.glassBackground, borderColor: djIsLive ? "#FF2D78" : colors.glassBorder },
              ]}
            >
              {djIsLive && <View style={styles.livePulse} />}
              <Text style={[styles.liveChipText, { color: djIsLive ? "#fff" : colors.mutedForeground }]}>
                {djIsLive ? "EN DIRECT" : "OFFLINE"}
              </Text>
              <Feather name="radio" size={12} color={djIsLive ? "#fff" : colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance card */}
        <GlassCard style={[styles.balanceCard, { borderColor: colors.gold }]} borderColor={colors.gold} intensity={50}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Total accepté ce soir</Text>
              <Text style={[styles.balanceAmount, { color: colors.gold }]}>
                {(djWallet.active ? djWallet.tonightReceived : myBalance).toFixed(2)}€
              </Text>
            </View>
            <MaterialCommunityIcons name="cash-multiple" size={40} color={colors.gold} style={{ opacity: 0.6 }} />
          </View>
          <View style={[styles.statsRow, { borderTopColor: colors.glassBorder, borderTopWidth: 1 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{acceptedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Acceptés</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>{pendingTips.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>En attente</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.neonPink }]}>{recordTip > 0 ? `${recordTip}€` : "—"}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Record</Text>
            </View>
          </View>
        </GlassCard>

        {/* DJ Profile Mini Card */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROFIL DJ — VÉRIFICATION</Text>
        <View style={styles.profileCard}>
          {/* Card header: identity */}
          <View style={styles.profileCardHeader}>
            <View style={styles.profileAvatarCircle}>
              <Text style={styles.profileAvatarEmoji}>{myDj?.avatar ?? "🎧"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileCardName}>{myDj?.name ?? "—"}</Text>
              <Text style={styles.profileCardGenre}>{myDj?.genre ?? ""}</Text>
            </View>
            {djIsLive && (
              <View style={styles.profileLiveBadge}>
                <View style={styles.profileLiveDot} />
                <Text style={styles.profileLiveText}>LIVE</Text>
              </View>
            )}
          </View>

          <View style={styles.profileDivider} />

          {/* Social brand rows */}
          {editingSocial ? (
            <View style={{ gap: 12 }}>
              <SocialEditRow
                platform="instagram"
                placeholder="@votre_instagram"
                value={socialDraft.instagram}
                onChangeText={(t) => setSocialDraft((p) => ({ ...p, instagram: t }))}
              />
              <SocialEditRow
                platform="tiktok"
                placeholder="@votre_tiktok"
                value={socialDraft.tiktok}
                onChangeText={(t) => setSocialDraft((p) => ({ ...p, tiktok: t }))}
              />
              <SocialEditRow
                platform="facebook"
                placeholder="Votre page Facebook"
                value={socialDraft.facebook}
                onChangeText={(t) => setSocialDraft((p) => ({ ...p, facebook: t }))}
              />
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setEditingSocial(false)}
                  style={[styles.profileActionBtn, { backgroundColor: "#f3f4f6", flex: 1 }]}
                >
                  <Feather name="x" size={15} color="#666" />
                  <Text style={[styles.profileActionBtnText, { color: "#666" }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSocial}
                  style={[styles.profileActionBtn, { backgroundColor: "#7C3AED", flex: 1 }]}
                >
                  <Feather name="check" size={15} color="#fff" />
                  <Text style={[styles.profileActionBtnText, { color: "#fff" }]}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              <SocialBrandRow platform="instagram" handle={myDj?.socialLinks?.instagram} />
              <SocialBrandRow platform="tiktok" handle={myDj?.socialLinks?.tiktok} />
              <SocialBrandRow platform="facebook" handle={myDj?.socialLinks?.facebook} />

              <View style={styles.profileDivider} />

              <TouchableOpacity onPress={handleEditSocial} style={styles.editSocialBtn}>
                <Feather name="edit-2" size={14} color="#7C3AED" />
                <Text style={[styles.editSocialText, { color: "#7C3AED" }]}>Modifier les liens</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.profileDivider} />

          {/* Auto-message on accept */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <MaterialCommunityIcons name="message-text-fast-outline" size={16} color="#7C3AED" />
              <Text style={styles.autoMsgLabel}>Message auto à l'acceptation</Text>
            </View>
            {editingAutoMessage ? (
              <View style={{ gap: 8 }}>
                <TextInput
                  value={autoMessageDraft}
                  onChangeText={setAutoMessageDraft}
                  placeholder="Ex : Merci pour le pull up ! 🔥 tu restes ?"
                  placeholderTextColor="#d1d5db"
                  maxLength={160}
                  multiline
                  style={styles.autoMsgInput}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setEditingAutoMessage(false)}
                    style={[styles.profileActionBtn, { backgroundColor: "#f3f4f6", flex: 1 }]}
                  >
                    <Feather name="x" size={15} color="#666" />
                    <Text style={[styles.profileActionBtnText, { color: "#666" }]}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveAutoMessage}
                    style={[styles.profileActionBtn, { backgroundColor: "#7C3AED", flex: 1 }]}
                  >
                    <Feather name="check" size={15} color="#fff" />
                    <Text style={[styles.profileActionBtnText, { color: "#fff" }]}>Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setAutoMessageDraft(autoMessage); setEditingAutoMessage(true); }}
                style={styles.autoMsgPreview}
              >
                <Text style={[styles.autoMsgText, !autoMessage && { color: "#d1d5db", fontStyle: "italic" }]} numberOfLines={2}>
                  {autoMessage || "Aucun message — appuyez pour en définir un"}
                </Text>
                <Feather name="edit-2" size={13} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pending tips — ACCEPTER LE MONEY PULL-UP */}
        {pendingTips.length > 0 && (
          <>
            <View style={styles.feedHeader}>
              <Text style={[styles.sectionLabel, { color: "#F59E0B" }]}>TIPS EN ATTENTE</Text>
              <View style={[styles.countBadge, { backgroundColor: "#F59E0B" }]}>
                <Text style={styles.countBadgeText}>{pendingTips.length}</Text>
              </View>
            </View>
            <View style={styles.tipsList}>
              {pendingTips.map((tip) => (
                <AcceptTipCard key={tip.id} tip={tip} onAccept={handleAcceptTip} onRefuse={handleRefuseTip} />
              ))}
            </View>
          </>
        )}

        {/* Accepted tips feed */}
        <View style={styles.feedHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TIPS ACCEPTÉS</Text>
          {acceptedTips.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.neonGreen }]}>
              <Text style={styles.countBadgeText}>{acceptedTips.length}</Text>
            </View>
          )}
        </View>

        {acceptedTips.length === 0 ? (
          <GlassCard style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-remove" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Pas encore de tips acceptés</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Les fans envoient des tips depuis l'onglet Fan
            </Text>
          </GlassCard>
        ) : (
          <View style={styles.tipsList}>
            {acceptedTips.map((tip, index) => (
              <TipNotification key={tip.id} tip={tip} index={index} />
            ))}
          </View>
        )}
      </ScrollView>

      <DJWalletModal visible={walletOpen} onClose={() => setWalletOpen(false)} djId={activeDJId} />
    </View>
  );
}

const SOCIAL_CONFIG = {
  instagram: {
    label: "Instagram",
    icon: "instagram" as const,
    gradient: ["#833ab4", "#fd1d1d", "#fcb045"] as [string, string, string],
    fg: "#fff",
  },
  tiktok: {
    label: "TikTok",
    icon: "tiktok" as const,
    gradient: ["#010101", "#2d2d2d"] as unknown as [string, string, string],
    fg: "#fff",
  },
  facebook: {
    label: "Facebook",
    icon: "facebook" as const,
    gradient: ["#1877F2", "#0d5fd6", "#1877F2"] as [string, string, string],
    fg: "#fff",
  },
};

function SocialBrandRow({ platform, handle }: { platform: keyof typeof SOCIAL_CONFIG; handle?: string }) {
  const cfg = SOCIAL_CONFIG[platform];
  const hasHandle = !!handle;

  return (
    <View style={brandStyles.row}>
      <LinearGradient colors={cfg.gradient} style={brandStyles.iconBox} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
        <FontAwesome5 name={cfg.icon} size={18} color={cfg.fg} solid />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={brandStyles.platformName}>{cfg.label}</Text>
        <Text style={[brandStyles.handle, !hasHandle && brandStyles.handleEmpty]}>
          {hasHandle ? handle : "Non renseigné"}
        </Text>
      </View>
      {hasHandle ? (
        <View style={brandStyles.verifiedBadge}>
          <Feather name="check" size={11} color="#fff" />
          <Text style={brandStyles.verifiedText}>Lié</Text>
        </View>
      ) : (
        <View style={[brandStyles.verifiedBadge, { backgroundColor: "#e5e7eb" }]}>
          <Feather name="link" size={11} color="#9ca3af" />
          <Text style={[brandStyles.verifiedText, { color: "#9ca3af" }]}>Vide</Text>
        </View>
      )}
    </View>
  );
}

function SocialEditRow({
  platform, placeholder, value, onChangeText,
}: {
  platform: keyof typeof SOCIAL_CONFIG;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  const cfg = SOCIAL_CONFIG[platform];

  return (
    <View style={brandStyles.editRow}>
      <LinearGradient colors={cfg.gradient} style={brandStyles.editIconBox} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
        <FontAwesome5 name={cfg.icon} size={14} color={cfg.fg} solid />
      </LinearGradient>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        style={brandStyles.editInput}
      />
    </View>
  );
}

const brandStyles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#f9fafb", borderRadius: 14, padding: 12,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18, shadowRadius: 4, elevation: 3,
  },
  platformName: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#6b7280", marginBottom: 2 },
  handle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#111827" },
  handleEmpty: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#d1d5db" },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#22C55E", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  verifiedText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  editRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  editIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  editInput: {
    flex: 1, backgroundColor: "#f3f4f6", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#111827",
    borderWidth: 1, borderColor: "#e5e7eb",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  modeLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  djTitle: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  nameEditRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameInput: { fontSize: 16, fontFamily: "Inter_700Bold", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, minWidth: 160, letterSpacing: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  themeToggle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  livePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },
  liveChipText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1.5 },
  djSwitcher: { flexDirection: "row", gap: 10, marginBottom: 20 },
  djTab: { alignItems: "center", paddingVertical: 10, paddingHorizontal: 4, gap: 4 },
  djTabAvatar: { fontSize: 20 },
  djTabName: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textAlign: "center" },
  balanceCard: { marginBottom: 24, overflow: "hidden" },
  balanceTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  balanceLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 4, letterSpacing: 0.5 },
  balanceAmount: { fontSize: 42, fontFamily: "Inter_700Bold", letterSpacing: -1.5 },
  statsRow: { flexDirection: "row", paddingVertical: 14 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 12 },

  profileCard: {
    backgroundColor: "#ffffff", borderRadius: 20, padding: 18, marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  profileCardHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
  profileAvatarCircle: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: "#f3f4f6",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#e5e7eb",
  },
  profileAvatarEmoji: { fontSize: 28 },
  profileCardName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#111827" },
  profileCardGenre: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6b7280", marginTop: 2 },
  profileLiveBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#FF2D78", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  profileLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  profileLiveText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  profileDivider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 12 },
  profileActionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 11, borderRadius: 12 },
  profileActionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  editSocialBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  editSocialText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  autoMsgLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#6b7280" },
  autoMsgPreview: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#f9fafb", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#e5e7eb",
  },
  autoMsgText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#111827" },
  autoMsgInput: {
    backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#7C3AED",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, fontFamily: "Inter_400Regular", color: "#111827", minHeight: 72,
  },
  feedHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  countBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  countBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  pendingCard: { padding: 16, gap: 12, marginBottom: 8 },
  pendingTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  pendingAmountBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  pendingAmount: { fontSize: 18, fontFamily: "Inter_700Bold" },
  pendingInfo: { flex: 1 },
  pendingFrom: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  pendingMessage: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic", marginTop: 2 },
  pendingChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  pendingChipText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  pendingActions: { flexDirection: "row", gap: 10 },
  refuseBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 13, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5,
  },
  refuseBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  acceptBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 14, borderRadius: 14,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  acceptBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  tipsList: { gap: 8 },
  walletBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  walletBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  liveToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },

});
