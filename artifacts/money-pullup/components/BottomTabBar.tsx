import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { SymbolView } from "expo-symbols";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const ACTIVE_COLOR = "#FF2D78";
const INACTIVE_COLOR = "rgba(255,255,255,0.45)";
const BAR_BG = "#0a0015";

function resolveActiveTab(pathname: string): TabKey | null {
  if (
    pathname.startsWith("/dj/profile") ||
    pathname.startsWith("/dj/bookings") ||
    pathname.startsWith("/dj/connect")
  ) {
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

export const BOTTOM_TAB_BAR_HEIGHT = 64;

export function BottomTabBar() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isIOS = Platform.OS === "ios";
  const active = resolveActiveTab(pathname);

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

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
                size={26}
              />
            ) : tab.androidIconMCI ? (
              <MaterialCommunityIcons name={tab.androidIconMCI} size={26} color={color} />
            ) : (
              <Feather name={tab.androidIcon!} size={24} color={color} />
            )}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {tab.label}
            </Text>
            <View style={[styles.dot, { opacity: isActive ? 1 : 0 }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: BAR_BG,
    borderTopWidth: 0,
    zIndex: 100,
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 6,
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ACTIVE_COLOR,
    marginTop: 1,
  },
});
