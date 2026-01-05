import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CATEGORIES,
  JournalEntry,
  journalService,
} from "../../../lib/journal-service";

// Category badge colors (reused from before, updated to match standard ones if needed)
const categoryBadgeColors: Record<string, { bg: string; text: string }> = {
  morning: { bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  work: { bg: "rgba(59, 130, 246, 0.15)", text: "#3B82F6" },
  wellness: { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" },
  personal: { bg: "rgba(168, 85, 247, 0.15)", text: "#A855F7" },
  evening: { bg: "rgba(99, 102, 241, 0.15)", text: "#6366F1" },
};

export default function Journal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();

  const [activeCategory, setActiveCategory] = useState("all");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!user) return;
    try {
      let data: JournalEntry[] = [];

      if (selectedDate) {
        data = await journalService.getByDate(user.id, selectedDate);
        // Filter by category in memory if needed
        if (activeCategory !== "all") {
          data = data.filter((e) => e.category === activeCategory);
        }
      } else {
        data =
          activeCategory === "all"
            ? await journalService.getAll(user.id)
            : await journalService.getByCategory(user.id, activeCategory);
      }
      setEntries(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeCategory, selectedDate]);

  // Refetch when screen comes into focus, category changes, or date changes
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEntries();
    }, [fetchEntries])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEntries();
  }, [fetchEntries]);

  // Get current date or selected date string
  const dateInfo = useMemo(() => {
    const targetDate = selectedDate || new Date();
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
      month: months[targetDate.getMonth()],
      date: targetDate.getDate(),
      fullYear: targetDate.getFullYear(),
      isToday: new Date().toDateString() === targetDate.toDateString(),
    };
  }, [selectedDate]);

  // Filter categories to display
  const displayCategories = useMemo(
    () => [{ id: "all", label: "All", color: "#F97316" }, ...CATEGORIES],
    []
  );

  // Format time helper
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const day = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${day} • ${time}`;
  };

  const openDatePicker = () => {
    setTempSelectedDate(selectedDate || new Date());
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && date) {
        setSelectedDate(date);
      }
    } else {
      if (date) setTempSelectedDate(date);
    }
  };

  const handleDone = () => {
    setSelectedDate(tempSelectedDate);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F97316"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Journals</Text>
          <TouchableOpacity
            style={[
              styles.dateBadge,
              selectedDate && {
                borderColor: "#F97316",
                backgroundColor: "#F97316" + "20",
              },
              !selectedDate && {
                paddingHorizontal: 10,
                paddingVertical: 10,
                borderRadius: 20, // Make it circular/square-ish
                aspectRatio: 1,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onPress={openDatePicker}
            activeOpacity={0.7}
          >
            {selectedDate ? (
              <>
                <Ionicons name="calendar" size={14} color="#F97316" />
                <Text style={[styles.dateText, { color: "#F97316" }]}>
                  {dateInfo.month} {dateInfo.date}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedDate(null)}
                  style={{ marginLeft: 6, padding: 2 }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={16} color="#F97316" />
                </TouchableOpacity>
              </>
            ) : (
              <Ionicons name="calendar-outline" size={22} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Android Date Picker */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* iOS Date Picker Modal */}
        {Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <TouchableOpacity onPress={handleDone} hitSlop={10}>
                    <Text style={styles.modalDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempSelectedDate}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant="dark"
                  style={{ height: 320, width: "100%" }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        )}

        {/* iOS Date Picker Modal Wrapper could go here if using inline/spinner style in a modal, but standard is fine mostly */}

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {displayCategories.map((category) => {
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
          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color="#F97316"
              style={{ marginTop: 40 }}
            />
          ) : entries.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="journal-outline" size={48} color="#2A2A2A" />
              <Text style={{ color: "#6B7280", marginTop: 16 }}>
                No entries found {selectedDate ? "for this date" : ""}
              </Text>
            </View>
          ) : (
            entries.map((entry) => {
              const badgeColors =
                categoryBadgeColors[entry.category] ||
                categoryBadgeColors.personal;
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
                    <Text style={styles.entryTime}>
                      {formatTime(entry.created_at)}
                    </Text>
                  </View>

                  <View style={styles.entryContent}>
                    <View style={styles.entryTextContent}>
                      <Text style={styles.entryTitle}>{entry.title}</Text>
                      <Text style={styles.entryPreview} numberOfLines={2}>
                        {entry.content}
                      </Text>
                    </View>
                    <View style={styles.emojiContainer}>
                      <Text style={styles.emoji}>{entry.mood_emoji}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalDoneText: {
    color: "#F97316",
    fontWeight: "700",
    fontSize: 16,
  },
});
