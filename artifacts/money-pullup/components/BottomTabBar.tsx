import { BlurView } from "expo-blur";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type TabKey = "fan" | "dj" | "history" | "profile";

const TABS: {
  key: TabKey;
  label: string;
  route: string;
  sfIcon: string;
  sfIconSelected: string;
  androidIcon: React.ComponentProps<typeof Feather>["name"] | null;
  androidIconMCI?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}[] = [
  {
    key: "fan",
    label: "Fan",
    route: "/(tabs)/",
    sfIcon: "bolt",
    sfIconSelected: "bolt.fill",
    androidIcon: "zap",
  },
  {
    key: "dj",
    label: "DJ",
    route: "/(tabs)/dj",
    sfIcon: "music.note",
    sfIconSelected: "music.note",
    androidIcon: null,
    androidIconMCI: "music-circle",
  },
  {
    key: "history",
    label: "Historique",
    route: "/(tabs)/history",
    sfIcon: "clock",
    sfIconSelected: "clock.fill",
    androidIcon: "clock",
  },
  {
    key: "profile",
    label: "Profil",
    route: "/(tabs)/profile",
    sfIcon: "person.circle",
    sfIconSelected: "person.circle.fill",
    androidIcon: "user",
  },
];

function resolveActiveTab(pathname: string): TabKey | null {
  if (pathname.startsWith("/dj/profile") || pathname.startsWith("/dj/bookings") || pathname.startsWith("/dj/connect")) {
    return "dj";
  }
  if (pathname.startsWith("/fan/profile")) {
    return "profile";
  }
  if (pathname.startsWith("/dj/")) {
    return "fan";
  }
  return null;
}

export const BOTTOM_TAB_BAR_HEIGHT = 56;

export function BottomTabBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isIOS = Platform.OS === "ios";
  const active = resolveActiveTab(pathname);
  const totalHeight = BOTTOM_TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View
      style={[
        styles.bar,
        {
          height: totalHeight,
          borderTopColor: colors.border,
          backgroundColor: isIOS ? "transparent" : colors.background,
        },
      ]}
    >
      {isIOS && (
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View style={[styles.inner, { paddingBottom: insets.bottom }]}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const color = isActive ? colors.primary : colors.mutedForeground;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => router.navigate(tab.route as never)}
              activeOpacity={0.7}
            >
              {isIOS ? (
                <SymbolView
                  name={isActive ? tab.sfIconSelected : tab.sfIcon}
                  tintColor={color}
                  size={24}
                />
              ) : tab.androidIconMCI ? (
                <MaterialCommunityIcons name={tab.androidIconMCI} size={24} color={color} />
              ) : (
                <Feather name={tab.androidIcon!} size={22} color={color} />
              )}
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    elevation: 0,
    zIndex: 100,
  },
  inner: {
    flex: 1,
    flexDirection: "row",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 8,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
});
