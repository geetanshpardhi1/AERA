import { useUser } from "@clerk/clerk-expo";
import { Pacifico_400Regular, useFonts } from "@expo-google-fonts/pacifico";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { aiService } from "../../../lib/ai-service";
import { JournalEntry, journalService } from "../../../lib/journal-service";

const { width } = Dimensions.get("window");

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // AI Prompt State
  const [dailyPrompt, setDailyPrompt] = useState<{
    question: string;
    description: string;
  } | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(true);

  // Load Pacifico font
  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  const fetchRecent = useCallback(async () => {
    if (!user) return;
    try {
      const data = await journalService.getRecent(user.id, 3);
      setRecentEntries(data);
    } catch (error) {
      console.error("Error fetching recent entries:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchDailyPrompt = useCallback(async (force = false) => {
    try {
      const today = new Date().toDateString();

      if (!force) {
        const stored = await AsyncStorage.getItem("aera_daily_prompt");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.date === today && parsed.data) {
            setDailyPrompt(parsed.data);
            setLoadingPrompt(false);
            return;
          }
        }
      }

      // Generate New
      setLoadingPrompt(true);
      const newPrompt = await aiService.generateDailyQuestion();
      await AsyncStorage.setItem(
        "aera_daily_prompt",
        JSON.stringify({ date: today, data: newPrompt })
      );
      setDailyPrompt(newPrompt);
    } catch (e) {
      console.error("Daily Prompt Error", e);
      setDailyPrompt({
        question: "What made you smile today?",
        description: "Happiness is found in the little things.",
      });
    } finally {
      setLoadingPrompt(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecent();
    }, [fetchRecent])
  );

  useEffect(() => {
    fetchDailyPrompt(false);
  }, [fetchDailyPrompt]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchRecent(),
      fetchDailyPrompt(false), // Do not force regen
    ]);
    setRefreshing(false);
  }, [fetchRecent, fetchDailyPrompt]);

  // Get current date info
  const dateInfo = useMemo(() => {
    const now = new Date();
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
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
      dayName: days[now.getDay()],
      monthName: months[now.getMonth()],
      date: now.getDate(),
      year: now.getFullYear(),
    };
  }, []);

  // Get week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);

    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const week = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      week.push({
        day: days[i],
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
      });
    }

    return week;
  }, []);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const firstName = user?.firstName || "there";

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        {/* Header Section */}
        <View style={styles.header}>
          {/* Date */}
          <Text style={styles.dateText}>
            {dateInfo.dayName}, {dateInfo.monthName} {dateInfo.date}
          </Text>

          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text
              style={[
                styles.greetingText,
                fontsLoaded && { fontFamily: "Pacifico_400Regular" },
              ]}
            >
              {greeting},
            </Text>
            <Text
              style={[
                styles.nameText,
                fontsLoaded && { fontFamily: "Pacifico_400Regular" },
              ]}
            >
              {" "}
              {firstName}!
            </Text>
          </View>
        </View>

        {/* Week Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {weekDates.map((item, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text
                  style={[
                    styles.dayLabel,
                    item.isToday && styles.dayLabelActive,
                  ]}
                >
                  {item.day}
                </Text>
                <View
                  style={[
                    styles.dateCircle,
                    item.isToday && styles.dateCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateNumber,
                      item.isToday && styles.dateNumberActive,
                    ]}
                  >
                    {item.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Question of the Day Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionLabel}>QUESTION OF THE DAY</Text>
            <Ionicons name="sparkles" size={16} color="#F97316" />
          </View>

          {loadingPrompt ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator color="#F97316" />
            </View>
          ) : (
            <>
              <Text style={styles.questionText}>
                {dailyPrompt?.question || "Reflect on your day..."}
              </Text>

              <Text style={styles.questionDescription}>
                {dailyPrompt?.description ||
                  "Take a moment to appreciate the journey."}
              </Text>

              <TouchableOpacity
                style={styles.writeButton}
                activeOpacity={0.9}
                onPress={() => {
                  router.push({
                    pathname: "/(protected)/new-entry",
                    params: {
                      title: dailyPrompt?.question,
                      type: "prompt",
                    },
                  });
                }}
              >
                <Text style={styles.writeButtonText}>Write Entry</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Recent Journals Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Journals</Text>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/journal")}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {recentEntries.length === 0 && !loading ? (
            <View style={styles.emptyRecent}>
              <Text style={styles.emptyText}>
                No journals yet. Start writing!
              </Text>
            </View>
          ) : (
            recentEntries.map((journal) => (
              <TouchableOpacity
                key={journal.id}
                style={styles.journalCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/(protected)/entry-detail?id=${journal.id}`)
                }
              >
                <View style={styles.emojiBox}>
                  <Text style={{ fontSize: 24 }}>{journal.mood_emoji}</Text>
                </View>

                <View style={styles.journalContent}>
                  <View style={styles.journalTitleRow}>
                    <Text style={styles.journalTitle}>{journal.title}</Text>
                    <Text style={styles.journalTime}>
                      {formatTime(journal.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.journalPreview} numberOfLines={1}>
                    {journal.content}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 74,
    height: 74,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appIcon: {
    width: "100%",
    height: "100%",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F97316",
    letterSpacing: 2,
    marginBottom: 8,
  },
  greetingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "baseline",
  },
  greetingText: {
    fontSize: 32,
    color: "#FFFFFF",
  },
  nameText: {
    fontSize: 32,
    color: "#F97316",
  },
  calendarCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  dayLabelActive: {
    color: "#F97316",
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCircleActive: {
    backgroundColor: "#F97316",
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  dateNumberActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  questionCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1.5,
    marginRight: 8,
  },
  questionText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 34,
    marginBottom: 16,
  },
  questionDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 22,
    marginBottom: 24,
  },
  writeButton: {
    backgroundColor: "#F97316",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  writeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F97316",
  },
  journalCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  journalImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
  },
  journalContent: {
    flex: 1,
  },
  journalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
  journalTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  journalPreview: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyRecent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
  },
  emojiBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
});
