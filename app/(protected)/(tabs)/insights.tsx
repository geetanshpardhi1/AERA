import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { aiService } from "../../../lib/ai-service";
import {
  JournalEntry,
  journalService,
  MOODS,
} from "../../../lib/journal-service";

const { width, height } = Dimensions.get("window");
const CHART_WIDTH = width - 120;
const CHART_HEIGHT = 100;

export default function Insights() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    averageMood: number;
    totalEntries: number;
    moodDistribution: Record<number, number>;
  } | null>(null);
  const [weeklyChartData, setWeeklyChartData] = useState<
    { day: string; value: number }[]
  >([]);

  const [frequencyData, setFrequencyData] = useState<number[][]>(
    Array(5).fill(Array(7).fill(0))
  );
  const [streak, setStreak] = useState(0);

  const [insight, setInsight] = useState("");
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [filterRange, setFilterRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Edit State
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");
  const [tempStart, setTempStart] = useState(new Date());
  const [tempEnd, setTempEnd] = useState(new Date());

  // Android specific
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const isFiltering = filterRange.start !== null && filterRange.end !== null;
  const dateLabel =
    isFiltering && filterRange.start && filterRange.end
      ? `${filterRange.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${filterRange.end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : "Last 7 Days";

  // Fetch Logic
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      let sDate = new Date();
      let eDate = new Date();

      if (isFiltering && filterRange.start && filterRange.end) {
        sDate = new Date(filterRange.start);
        eDate = new Date(filterRange.end);
        eDate.setHours(23, 59, 59, 999);
      } else {
        sDate.setDate(sDate.getDate() - 6); // 7 days inclusive
        eDate.setHours(23, 59, 59, 999);
      }

      const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const statsData = await journalService.getMoodStats(
        user.id,
        days || 1,
        eDate
      );
      setStats(statsData);

      const rangeEntries = await journalService.getEntriesInRange(
        user.id,
        sDate,
        eDate
      );
      processChartData(rangeEntries, sDate, days || 1);

      const entryDates = await journalService.getEntryDates(user.id, 60, eDate);
      processFrequencyData(entryDates, eDate);
    } catch (error) {
      console.error("Error fetching insight data:", error);
    } finally {
      setLoading(false);
    }
  }, [user, filterRange, isFiltering]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const processChartData = (
    entries: JournalEntry[],
    startDate: Date,
    totalDays: number
  ) => {
    const result = [];
    const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayLabel = daysArr[d.getDay()];
      const dateStr = d.toDateString();

      const dayEntries = entries.filter(
        (e) => new Date(e.created_at).toDateString() === dateStr
      );

      let normalizedValue = -1;
      if (dayEntries.length > 0) {
        const sum = dayEntries.reduce((acc, e) => acc + e.mood, 0);
        const avg = sum / dayEntries.length;
        normalizedValue = (avg - 1) / 4;
      }

      // Show labels sparsely if many days
      const label = totalDays > 10 ? d.getDate().toString() : dayLabel;
      result.push({ day: label, value: normalizedValue });
    }
    setWeeklyChartData(result);
  };

  const processFrequencyData = (dates: string[], referenceDate: Date) => {
    // Streak calc...
    const dateSet = new Set(dates.map((d) => new Date(d).toDateString()));
    let streakCount = 0;
    let dStr = new Date(referenceDate);

    if (!dateSet.has(dStr.toDateString())) {
      dStr.setDate(dStr.getDate() - 1);
    }

    while (true) {
      if (dateSet.has(dStr.toDateString())) {
        streakCount++;
        dStr.setDate(dStr.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(streakCount);

    // Grid calc...
    const endOfGrid = new Date(referenceDate);
    const currentDay = endOfGrid.getDay();
    const diff = currentDay === 0 ? 0 : 7 - currentDay;
    endOfGrid.setDate(endOfGrid.getDate() + diff);

    const startDate = new Date(endOfGrid);
    startDate.setDate(startDate.getDate() - 34);

    const grid: number[][] = [];
    let iterDate = new Date(startDate);

    for (let w = 0; w < 5; w++) {
      const weekRow = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = iterDate.toDateString();
        const count = dates.filter(
          (val) => new Date(val).toDateString() === dateStr
        ).length;
        weekRow.push(count);
        iterDate.setDate(iterDate.getDate() + 1);
      }
      grid.push(weekRow);
    }
    setFrequencyData(grid);
  };

  const handleGenerateInsight = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      let sDate = new Date();
      let eDate = new Date();
      if (isFiltering && filterRange.start && filterRange.end) {
        sDate = new Date(filterRange.start);
        eDate = new Date(filterRange.end);
        eDate.setHours(23, 59, 59, 999);
      } else {
        sDate.setDate(sDate.getDate() - 6);
      }

      const entries = await journalService.getEntriesInRange(
        user.id,
        sDate,
        eDate
      );

      if (entries.length === 0) {
        setInsight(
          "No entries found for this period. Start journaling to get AI insights!"
        );
      } else {
        const text = await aiService.generateWeeklyInsight(entries);
        setInsight(text);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setGenerating(false);
    }
  };

  const openFilterModal = () => {
    setTempStart(filterRange.start || new Date());
    setTempEnd(filterRange.end || new Date());
    setActiveTab("start");
    setShowFilterModal(true);
  };

  const applyFilter = () => {
    if (tempStart > tempEnd) {
      Alert.alert("Invalid Range", "Start date cannot be after end date.");
      return;
    }
    setFilterRange({ start: tempStart, end: tempEnd });
    setShowFilterModal(false);
  };

  const clearFilter = () => {
    setFilterRange({ start: null, end: null });
    setShowFilterModal(false);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (!selectedDate) {
      if (Platform.OS === "android") setShowAndroidPicker(false);
      return;
    }

    if (activeTab === "start") {
      setTempStart(selectedDate);
      // Auto switch to end tab? No, let user decide.
    } else {
      setTempEnd(selectedDate);
    }

    if (Platform.OS === "android") setShowAndroidPicker(false);
  };

  const getFrequencyColor = (value: number) => {
    if (value === 0) return "#2A2A2A";
    if (value === 1) return "#7C533C";
    if (value === 2) return "#C66D32";
    return "#F97316";
  };

  // Memos
  const distributionData = useMemo(() => {
    if (!stats) return [];
    const total = stats.totalEntries || 1;
    return MOODS.map((m) => ({
      mood: m.label,
      percentage: Math.round(
        ((stats.moodDistribution[m.value] || 0) / total) * 100
      ),
      color: m.color,
      count: stats.moodDistribution[m.value] || 0,
    }))
      .filter((d) => d.count > 0 || d.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);
  }, [stats]);

  const avgMoodLabel = useMemo(() => {
    if (!stats || stats.averageMood === 0) return "N/A";
    const rounded = Math.round(stats.averageMood);
    return MOODS.find((m) => m.value === rounded)?.label || "Neutral";
  }, [stats]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: 120 },
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
          <Text style={styles.title}>Insights</Text>
          <TouchableOpacity
            style={[
              styles.calendarButton,
              isFiltering && {
                borderColor: "#F97316",
                backgroundColor: "rgba(249, 115, 22, 0.1)",
              },
            ]}
            onPress={openFilterModal}
          >
            <Ionicons
              name="calendar-outline"
              size={22}
              color={isFiltering ? "#F97316" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Weekly Overview Card */}
        <View style={styles.card}>
          <View style={styles.weeklyHeader}>
            <View>
              <Text style={styles.cardTitle}>Overview</Text>
              <Text style={styles.cardSubtitle}>{dateLabel}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Mood</Text>
              <Text style={styles.statValue}>{avgMoodLabel}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Entries</Text>
              <Text style={styles.statValue}>{stats?.totalEntries || 0}</Text>
            </View>
          </View>

          {/* Line Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              {weeklyChartData.length > 0 &&
                weeklyChartData.map((point, index) => {
                  if (point.value === -1) return null;
                  const count = weeklyChartData.length;
                  const isLast = index === count - 1;
                  const x =
                    count > 1
                      ? (index / (count - 1)) * CHART_WIDTH
                      : CHART_WIDTH / 2;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.chartDot,
                        {
                          left: x - (isLast ? 6 : 4),
                          bottom: point.value * CHART_HEIGHT - (isLast ? 6 : 4),
                          backgroundColor: isLast ? "#22C55E" : "#F97316",
                          width: isLast ? 12 : 8,
                          height: isLast ? 12 : 8,
                        },
                      ]}
                    />
                  );
                })}

              {/* Connecting lines */}
              {weeklyChartData.slice(0, -1).map((point, index) => {
                const nextPoint = weeklyChartData[index + 1];
                if (point.value === -1 || nextPoint.value === -1) return null;

                const count = weeklyChartData.length;
                const x1 = (index / (count - 1)) * CHART_WIDTH;
                const x2 = ((index + 1) / (count - 1)) * CHART_WIDTH;
                const y1 = point.value * CHART_HEIGHT;
                const y2 = nextPoint.value * CHART_HEIGHT;

                const length = Math.sqrt(
                  Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
                );
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                const cx = (x1 + x2) / 2;
                const cy = (y1 + y2) / 2;

                return (
                  <View
                    key={`line-${index}`}
                    style={[
                      styles.chartLine,
                      {
                        width: length,
                        left: cx - length / 2,
                        bottom: cy - 1,
                        transform: [{ rotate: `${-angle}deg` }],
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.xAxisLabels}>
              {weeklyChartData.map((point, index) => {
                const count = weeklyChartData.length;
                if (count > 10 && index % 2 !== 0 && index !== count - 1)
                  return null;
                return (
                  <Text
                    key={index}
                    style={[
                      styles.xAxisLabel,
                      { width: CHART_WIDTH / count, textAlign: "center" },
                    ]}
                  >
                    {point.day}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>

        {/* 7-Day AI Reflection & Other Cards... same structure */}
        <View style={styles.card}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={18} color="#F97316" />
            </View>
            <Text style={styles.aiTitle}>
              {isFiltering ? "Custom AI Reflection" : "7-Day AI Reflection"}
            </Text>
          </View>
          {generating ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator color="#F97316" size="small" />
              <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 13 }}>
                Analyzing...
              </Text>
            </View>
          ) : insight ? (
            <View>
              <Text style={styles.aiText}>{insight}</Text>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={handleGenerateInsight}
              >
                <Text style={styles.aiButtonText}>Regenerate</Text>
                <Ionicons name="refresh" size={16} color="#F97316" />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.aiText}>
                Generate a personalized summary.
              </Text>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={handleGenerateInsight}
              >
                <Text style={styles.aiButtonText}>Generate Analysis</Text>
                <Ionicons name="arrow-forward" size={16} color="#F97316" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Mood & Heatmap - Same */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Distribution</Text>
          {distributionData.length > 0 ? (
            <View style={styles.moodContent}>
              <View style={styles.donutContainer}>
                <View style={styles.donutOuter}>
                  <View
                    style={[styles.donutSegment, { backgroundColor: "#333" }]}
                  />
                </View>
                <View style={styles.donutInner}>
                  <Text style={styles.donutNumber}>{stats?.totalEntries}</Text>
                </View>
              </View>
              <View style={styles.legendContainer}>
                {distributionData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendMood}>{item.mood}</Text>
                    <Text style={styles.legendPercent}>{item.percentage}%</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ color: "#666", marginTop: 10 }}>No mood data.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entry Frequency</Text>
          <View style={styles.heatmapContainer}>
            {frequencyData.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.heatmapRow}>
                {week.map((value, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.heatmapCell,
                      { backgroundColor: getFrequencyColor(value) },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          <Text style={styles.streakText}>
            <Text style={styles.streakHighlight}>{streak}-day streak!</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sheet Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheetContent}>
            {/* Handle Bar */}
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Dates</Text>
              <TouchableOpacity onPress={clearFilter}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Date Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "start" && styles.activeTab]}
                onPress={() => {
                  setActiveTab("start");
                  if (Platform.OS === "android") setShowAndroidPicker(true);
                }}
              >
                <Text style={styles.tabLabel}>Start Date</Text>
                <Text
                  style={[
                    styles.tabDate,
                    activeTab === "start" && styles.activeTabDate,
                  ]}
                >
                  {tempStart.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <View style={styles.arrowBox}>
                <Ionicons name="arrow-forward" size={16} color="#4B5563" />
              </View>

              <TouchableOpacity
                style={[styles.tab, activeTab === "end" && styles.activeTab]}
                onPress={() => {
                  setActiveTab("end");
                  if (Platform.OS === "android") setShowAndroidPicker(true);
                }}
              >
                <Text style={styles.tabLabel}>End Date</Text>
                <Text
                  style={[
                    styles.tabDate,
                    activeTab === "end" && styles.activeTabDate,
                  ]}
                >
                  {tempEnd.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Picker Area via Platform */}
            {Platform.OS === "ios" ? (
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={activeTab === "start" ? tempStart : tempEnd}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant="dark"
                  key={activeTab} // Force re-render
                  style={{ height: 320, width: "100%" }}
                />
              </View>
            ) : (
              <View style={{ height: 20 }} />
            )}

            <TouchableOpacity
              style={styles.sheetApplyButton}
              onPress={applyFilter}
            >
              <Text style={styles.sheetApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Android Picker Logic */}
        {Platform.OS === "android" && showAndroidPicker && (
          <DateTimePicker
            value={activeTab === "start" ? tempStart : tempEnd}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 13, color: "#6B7280" },
  weeklyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 14,
  },
  statLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  chartContainer: { marginTop: 10 },
  chartArea: { height: CHART_HEIGHT, width: CHART_WIDTH, position: "relative" },
  chartDot: { position: "absolute", borderRadius: 10, zIndex: 2 },
  chartLine: {
    position: "absolute",
    height: 2.5,
    backgroundColor: "#F97316",
    zIndex: 1,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    width: CHART_WIDTH,
  },
  xAxisLabel: { fontSize: 11, color: "#6B7280", textAlign: "center" },
  moodContent: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  donutContainer: {
    width: 100,
    height: 100,
    marginRight: 24,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  donutOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2A2A2A",
    overflow: "hidden",
  },
  donutSegment: { position: "absolute", width: "100%", height: "100%" },
  donutInner: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  donutNumber: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  legendContainer: { flex: 1, gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  legendMood: { flex: 1, fontSize: 14, color: "#FFFFFF" },
  legendPercent: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  aiTitle: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", flex: 1 },
  aiText: { fontSize: 14, color: "#9CA3AF", lineHeight: 22, marginBottom: 16 },
  aiButton: { flexDirection: "row", alignItems: "center" },
  aiButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F97316",
    marginRight: 6,
  },
  heatmapContainer: { gap: 6, marginBottom: 16, marginTop: 10 },
  heatmapRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  heatmapCell: { flex: 1, aspectRatio: 1, borderRadius: 6, maxWidth: 42 },
  streakText: { fontSize: 14, color: "#9CA3AF", textAlign: "center" },
  streakHighlight: { color: "#F97316", fontWeight: "700" },

  // Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#151515",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    width: "100%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resetText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "flex-start",
  },
  activeTab: {
    borderColor: "#F97316",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
  },
  tabLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  tabDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  activeTabDate: {
    color: "#F97316",
  },
  arrowBox: {
    paddingHorizontal: 12,
  },
  pickerWrapper: {
    marginBottom: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
  },
  sheetApplyButton: {
    backgroundColor: "#F97316",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  sheetApplyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
