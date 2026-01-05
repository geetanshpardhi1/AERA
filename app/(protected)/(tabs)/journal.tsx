import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Category configuration with colors
const categories = [
  { id: "all", label: "All", color: "#F97316" },
  { id: "favorites", label: "Favorites", color: "#6B7280" },
  { id: "wellness", label: "Wellness", color: "#6B7280" },
  { id: "work", label: "Work", color: "#6B7280" },
];

// Category badge colors
const categoryBadgeColors: Record<string, { bg: string; text: string }> = {
  morning: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  work: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
  wellness: { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" },
  personal: { bg: "rgba(168, 85, 247, 0.15)", text: "#A855F7" },
};

// Sample journal entries
const journalEntries = [
  {
    id: 1,
    category: "morning",
    title: "Morning Reflection",
    time: "9:30 AM",
    preview:
      "Woke up feeling energized today. The sun was shining right through th...",
    emoji: "☀️",
    emojiColor: "#FBBF24",
  },
  {
    id: 2,
    category: "work",
    title: "Project Breakthrough",
    time: "2:15 PM",
    preview:
      "Finally solved that bug that was bothering me all week. It turns out it...",
    emoji: "🚀",
    emojiColor: "#3B82F6",
  },
  {
    id: 3,
    category: "wellness",
    title: "Evening Walk",
    time: "6:00 PM",
    preview:
      "Took a walk by the river. It was very peaceful and quiet. Saw a family of...",
    emoji: "🌿",
    emojiColor: "#22C55E",
  },
  {
    id: 4,
    category: "personal",
    title: "Late Night Thoughts",
    time: "11:45 PM",
    preview:
      "Thinking about the future and where I want to be in 5 years. It's a bit scary...",
    emoji: "🌙",
    emojiColor: "#A855F7",
  },
];

export default function Journal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  // Get current date
  const dateInfo = useMemo(() => {
    const now = new Date();
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return {
      month: months[now.getMonth()],
      date: now.getDate(),
    };
  }, []);

  // Filter entries based on active category
  const filteredEntries = useMemo(() => {
    if (activeCategory === "all") return journalEntries;
    if (activeCategory === "favorites") return journalEntries.slice(0, 2); // Mock favorites
    return journalEntries.filter(
      (entry) =>
        entry.category === activeCategory ||
        (activeCategory === "wellness" && entry.category === "wellness")
    );
  }, [activeCategory]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Journals</Text>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text style={styles.dateText}>
              {dateInfo.month} {dateInfo.date}
            </Text>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => setActiveCategory(category.id)}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Journal Entries */}
        <View style={styles.entriesContainer}>
          {filteredEntries.map((entry) => {
            const badgeColors = categoryBadgeColors[entry.category];
            return (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/(protected)/entry-detail?id=${entry.id}`)
                }
              >
                <View style={styles.entryHeader}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: badgeColors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        { color: badgeColors.text },
                      ]}
                    >
                      {entry.category.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                </View>

                <View style={styles.entryContent}>
                  <View style={styles.entryTextContent}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <Text style={styles.entryPreview} numberOfLines={2}>
                      {entry.preview}
                    </Text>
                  </View>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{entry.emoji}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* End of List */}
        <Text style={styles.endOfList}>End of list</Text>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        activeOpacity={0.9}
        onPress={() => router.push("/(protected)/new-entry")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginLeft: 6,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  entriesContainer: {
    gap: 16,
  },
  entryCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  entryTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  entryTextContent: {
    flex: 1,
    marginRight: 16,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 24,
  },
  endOfList: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});
