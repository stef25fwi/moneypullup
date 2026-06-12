import { Feather, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlowBackground } from "@/components/GlowBackground";
import { GlassCard } from "@/components/GlassCard";
import { useTips, DJ } from "@/contexts/TipsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  accepted: "#22C55E",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "Accepté",
};

const AVATARS = ["🎤", "🎸", "🎹", "🎺", "🎻", "🥁", "🎼", "🎵", "🎶", "🤩", "🔥", "⚡"];

export default function ProfileScreen() {
  const colors = useColors();
  const { toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { tips, fanProfile, updateFanProfile, getFavoriteDJs, searchDJs, setSelectedDj, djs } = useTips();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DJ[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(fanProfile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const searchRef = useRef<TextInput>(null);
  const suggestionOpacity = useSharedValue(0);

  const favoriteDJs = getFavoriteDJs();

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const results = searchDJs(text);
      setSearchResults(results);
      setShowSuggestions(true);
      suggestionOpacity.value = withTiming(1, { duration: 200 });
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
      suggestionOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [searchDJs, suggestionOpacity]);

  const handleSelectDJ = useCallback((dj: DJ) => {
    setSelectedDj(dj);
    setSearchQuery("");
    setSearchResults([]);
    setShowSuggestions(false);
    suggestionOpacity.value = withTiming(0, { duration: 150 });
    if (Platform.OS !== "web") Haptics.selectionAsync();
    Alert.alert(
      `${dj.avatar} ${dj.name}`,
      `Sélectionné comme DJ actif. Allez dans l'onglet Fan pour envoyer un tip !`,
      [{ text: "Super !" }]
    );
  }, [setSelectedDj, suggestionOpacity]);

  const handleSaveName = useCallback(() => {
    if (nameInput.trim()) updateFanProfile({ name: nameInput.trim() });
    setEditingName(false);
  }, [nameInput, updateFanProfile]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const suggestionsStyle = useAnimatedStyle(() => ({
    opacity: suggestionOpacity.value,
  }));

  const totalSent = tips.reduce((s, t) => s + t.amount, 0);
  const acceptedTips = tips.filter((t) => t.status === "accepted");
  const pendingTips = tips.filter((t) => t.status === "pending");

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
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Mon Profil</Text>
          <TouchableOpacity
            onPress={() => { toggleTheme(); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
            style={[styles.themeToggle, { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder }]}
          >
            <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? colors.gold : colors.violet} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <GlassCard style={styles.profileCard}>
          <TouchableOpacity onPress={() => setShowAvatarPicker((v) => !v)} style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{fanProfile.avatar}</Text>
            <View style={[styles.editAvatarBadge, { backgroundColor: colors.violet }]}>
              <Feather name="edit-2" size={10} color="#fff" />
            </View>
          </TouchableOpacity>

          {showAvatarPicker && (
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => {
                    updateFanProfile({ avatar: a });
                    setShowAvatarPicker(false);
                    if (Platform.OS !== "web") Haptics.selectionAsync();
                  }}
                  style={[
                    styles.avatarOption,
                    {
                      backgroundColor: fanProfile.avatar === a ? colors.violet + "33" : "transparent",
                      borderColor: fanProfile.avatar === a ? colors.violet : "transparent",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                style={[styles.nameInput, { color: colors.foreground, borderColor: colors.primary, backgroundColor: colors.glassBackground }]}
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
                maxLength={24}
              />
              <TouchableOpacity onPress={handleSaveName}>
                <Feather name="check" size={20} color={colors.neonGreen} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { setNameInput(fanProfile.name); setEditingName(true); }} style={styles.nameRow}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>{fanProfile.name}</Text>
              <Feather name="edit-2" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}

          {/* Stats row */}
          <View style={[styles.statsRow, { borderTopColor: colors.glassBorder }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.gold }]}>{totalSent.toFixed(0)}€</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total envoyé</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.neonGreen }]}>{acceptedTips.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Acceptés</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.neonPink }]}>{pendingTips.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>En attente</Text>
            </View>
          </View>
        </GlassCard>

        {/* DJ Search */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RECHERCHER UN DJ</Text>
        <View style={styles.searchWrapper}>
          <GlassCard style={styles.searchCard}>
            <Feather name="search" size={16} color={colors.mutedForeground} style={styles.searchIcon} />
            <TextInput
              ref={searchRef}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Nom du DJ, genre..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
              onFocus={() => {
                if (searchQuery.trim()) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </GlassCard>

          {/* Suggestions dropdown */}
          {showSuggestions && searchResults.length > 0 && (
            <Animated.View style={[suggestionsStyle, styles.suggestionsContainer]}>
              <GlassCard style={styles.suggestionsCard} intensity={70}>
                {searchResults.map((dj, index) => (
                  <TouchableOpacity
                    key={dj.id}
                    onPress={() => handleSelectDJ(dj)}
                    style={[
                      styles.suggestionItem,
                      index < searchResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
                    ]}
                  >
                    <Text style={styles.suggestionAvatar}>{dj.avatar}</Text>
                    <View style={styles.suggestionInfo}>
                      <Text style={[styles.suggestionName, { color: colors.foreground }]}>
                        {highlightMatch(dj.name, searchQuery, colors.primary)}
                      </Text>
                      <Text style={[styles.suggestionGenre, { color: colors.mutedForeground }]}>{dj.genre}</Text>
                    </View>
                    {dj.isLive && (
                      <View style={[styles.liveBadge, { backgroundColor: colors.neonPink }]}>
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </GlassCard>
            </Animated.View>
          )}

          {showSuggestions && searchQuery.trim().length > 0 && searchResults.length === 0 && (
            <GlassCard style={[styles.suggestionsCard, { marginTop: 6 }]}>
              <Text style={[styles.noResults, { color: colors.mutedForeground }]}>Aucun DJ trouvé pour "{searchQuery}"</Text>
            </GlassCard>
          )}
        </View>

        {/* Favorite DJs */}
        {favoriteDJs.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MES DJS FAVORIS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.djFavScroll}>
              {favoriteDJs.map((dj) => {
                const djTotal = tips.filter((t) => t.djId === dj.id).reduce((s, t) => s + t.amount, 0);
                return (
                  <TouchableOpacity key={dj.id} onPress={() => handleSelectDJ(dj)}>
                    <GlassCard style={styles.favDjCard}>
                      <Text style={{ fontSize: 28 }}>{dj.avatar}</Text>
                      <Text style={[styles.favDjName, { color: colors.foreground }]} numberOfLines={1}>{dj.name}</Text>
                      <Text style={[styles.favDjAmount, { color: colors.gold }]}>{djTotal}€</Text>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Tips history */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>HISTORIQUE DES TIPS</Text>

        {tips.length === 0 ? (
          <GlassCard style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-remove" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Aucun tip envoyé</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Envoyez votre premier tip depuis l'onglet Fan
            </Text>
          </GlassCard>
        ) : (
          <View style={styles.historyList}>
            {tips.map((tip) => (
              <GlassCard key={tip.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text style={[styles.historyDjName, { color: colors.foreground }]}>{tip.djName}</Text>
                  {tip.message ? (
                    <Text style={[styles.historyMessage, { color: colors.mutedForeground }]} numberOfLines={1}>
                      "{tip.message}"
                    </Text>
                  ) : null}
                  <Text style={[styles.historyTime, { color: colors.mutedForeground }]}>
                    {tip.timestamp.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={[styles.historyAmount, { color: colors.primary }]}>-{tip.amount}€</Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[tip.status] + "22", borderColor: STATUS_COLORS[tip.status] }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[tip.status] }]} />
                    <Text style={[styles.statusText, { color: STATUS_COLORS[tip.status] }]}>{STATUS_LABELS[tip.status]}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function highlightMatch(text: string, query: string, highlightColor: string) {
  if (!query.trim()) return <Text>{text}</Text>;
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return <Text>{text}</Text>;
  return (
    <Text>
      {text.slice(0, idx)}
      <Text style={{ color: highlightColor, fontFamily: "Inter_700Bold" }}>{text.slice(idx, idx + query.length)}</Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  themeToggle: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  profileCard: { alignItems: "center", padding: 20, marginBottom: 24, gap: 12 },
  avatarContainer: { position: "relative" },
  avatarEmoji: { fontSize: 56 },
  editAvatarBadge: { position: "absolute", bottom: 0, right: -4, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", paddingTop: 8 },
  avatarOption: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  nameEditRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nameInput: { fontSize: 18, fontFamily: "Inter_700Bold", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, minWidth: 160 },
  statsRow: { flexDirection: "row", borderTopWidth: 1, paddingTop: 16, width: "100%" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  statDivider: { width: 1 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginBottom: 12 },
  searchWrapper: { marginBottom: 24, position: "relative", zIndex: 10 },
  searchCard: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  searchIcon: { flexShrink: 0 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  suggestionsContainer: { position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 6 },
  suggestionsCard: { overflow: "hidden" },
  suggestionItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  suggestionAvatar: { fontSize: 24 },
  suggestionInfo: { flex: 1 },
  suggestionName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  suggestionGenre: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  liveBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 1 },
  noResults: { padding: 16, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  djFavScroll: { gap: 12, paddingRight: 20, marginBottom: 24 },
  favDjCard: { width: 100, padding: 14, alignItems: "center", gap: 6 },
  favDjName: { fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  favDjAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 40, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  historyList: { gap: 8, paddingBottom: 8 },
  historyItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 14, gap: 12 },
  historyLeft: { flex: 1, gap: 3 },
  historyDjName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  historyMessage: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  historyTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  historyRight: { alignItems: "flex-end", gap: 6 },
  historyAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
