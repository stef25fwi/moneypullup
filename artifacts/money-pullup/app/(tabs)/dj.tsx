import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlowBackground } from "@/components/GlowBackground";
import { GlassCard } from "@/components/GlassCard";
import { TipNotification } from "@/components/TipNotification";
import { useTips } from "@/contexts/TipsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";

export default function DJScreen() {
  const colors = useColors();
  const { toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { djs, currentDJName, setCurrentDJName, getTipsForDJ, getDJBalance } = useTips();

  const [activeDJId, setActiveDJId] = useState("dj1");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentDJName);

  const myTips = getTipsForDJ(activeDJId);
  const myBalance = getDJBalance(activeDJId);
  const myDj = djs.find((d) => d.id === activeDJId);

  const totalTips = myTips.length;
  const avgTip = totalTips > 0 ? myBalance / totalTips : 0;
  const biggestTip = totalTips > 0 ? Math.max(...myTips.map((t) => t.amount)) : 0;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleSaveName = useCallback(() => {
    if (nameInput.trim()) setCurrentDJName(nameInput.trim().toUpperCase());
    setEditingName(false);
  }, [nameInput, setCurrentDJName]);

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
          <View>
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
            <View style={[styles.liveChip, { backgroundColor: myDj?.isLive ? colors.neonPink : colors.muted }]}>
              {myDj?.isLive && <View style={styles.livePulse} />}
              <Text style={styles.liveChipText}>{myDj?.isLive ? "EN DIRECT" : "HORS LIGNE"}</Text>
            </View>
          </View>
        </View>

        {/* DJ Switcher */}
        <View style={styles.djSwitcher}>
          {djs.map((dj) => (
            <TouchableOpacity key={dj.id} onPress={() => setActiveDJId(dj.id)}>
              <GlassCard
                style={[
                  styles.djTab,
                  { borderColor: activeDJId === dj.id ? colors.violet : colors.glassBorder },
                ]}
                borderColor={activeDJId === dj.id ? colors.violet : colors.glassBorder}
                intensity={activeDJId === dj.id ? 60 : 30}
              >
                <Text style={styles.djTabAvatar}>{dj.avatar}</Text>
                <Text style={[styles.djTabName, { color: activeDJId === dj.id ? colors.violet : colors.mutedForeground }]} numberOfLines={1}>
                  {dj.name.split(" ").slice(-1)[0]}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Balance card */}
        <GlassCard style={[styles.balanceCard, { borderColor: colors.gold }]} borderColor={colors.gold} intensity={50}>
          <View style={styles.balanceTop}>
            <View>
              <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Total reçu ce soir</Text>
              <Text style={[styles.balanceAmount, { color: colors.gold }]}>{myBalance.toFixed(2)}€</Text>
            </View>
            <MaterialCommunityIcons name="cash-multiple" size={40} color={colors.gold} style={{ opacity: 0.6 }} />
          </View>

          <View style={[styles.statsRow, { borderTopColor: colors.glassBorder, borderTopWidth: 1 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{totalTips}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Tips</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{avgTip.toFixed(0)}€</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Moyenne</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.neonPink }]}>{biggestTip > 0 ? `${biggestTip}€` : "—"}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Max</Text>
            </View>
          </View>
        </GlassCard>

        {/* Tips feed */}
        <View style={styles.feedHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TIPS REÇUS</Text>
          {myTips.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.neonPink }]}>
              <Text style={styles.countBadgeText}>{myTips.length}</Text>
            </View>
          )}
        </View>

        {myTips.length === 0 ? (
          <GlassCard style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-remove" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Pas encore de tips</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Les fans peuvent vous envoyer des tips depuis l'onglet Fan
            </Text>
          </GlassCard>
        ) : (
          <View style={styles.tipsList}>
            {myTips.map((tip, index) => (
              <TipNotification key={tip.id} tip={tip} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
  djTab: { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 8, gap: 4, minWidth: 80 },
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
  feedHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2 },
  countBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  countBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  tipsList: { gap: 4 },
});
