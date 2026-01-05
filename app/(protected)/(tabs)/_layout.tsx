import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs, useRouter } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = 60;

// Custom Tab Bar Component matching the design
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Tab configuration with icons
  const tabs = [
    {
      name: "home",
      label: "Home",
      icon: "home",
      iconOutline: "home-outline",
    },
    {
      name: "journal",
      label: "Journal",
      icon: "document-text",
      iconOutline: "document-text-outline",
    },
    {
      name: "add",
      label: "",
      icon: "add",
      isCenter: true,
    },
    {
      name: "insights",
      label: "Insights",
      icon: "trending-up",
      iconOutline: "trending-up-outline",
    },
    {
      name: "profile",
      label: "Profile",
      icon: "person",
      iconOutline: "person-outline",
    },
  ];

  const handleTabPress = (tabName: string, isFocused: boolean) => {
    if (tabName === "add") {
      // Navigate to create journal entry
      router.push("/(protected)/new-entry");
      return;
    }

    if (!isFocused) {
      navigation.navigate(tabName);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 12,
          height: TAB_BAR_HEIGHT + (Platform.OS === "ios" ? insets.bottom : 12),
        },
      ]}
    >
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.backgroundOverlay} />
      </View>

      {/* Top border line */}
      <View style={styles.topBorder} />

      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          // Find if this tab is focused
          const routeIndex = state.routes.findIndex(
            (r: any) => r.name === tab.name
          );
          const isFocused = routeIndex !== -1 && state.index === routeIndex;

          // Center Add Button
          if (tab.isCenter) {
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => handleTabPress(tab.name, false)}
                style={styles.addButtonWrapper}
                activeOpacity={0.9}
              >
                <View style={styles.addButton}>
                  <Ionicons name="add" size={28} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => handleTabPress(tab.name, isFocused)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? (tab.icon as any) : (tab.iconOutline as any)}
                size={22}
                color={isFocused ? "#F97316" : "#6B7280"}
              />
              <Text
                style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.95)",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  tabsContainer: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#F97316",
    fontWeight: "600",
  },
  addButtonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
