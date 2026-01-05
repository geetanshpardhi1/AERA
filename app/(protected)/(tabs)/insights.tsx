import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 80;
const CHART_HEIGHT = 100;

// Mock data for the week
const weeklyMoodData = [
  { day: "Mon", value: 0.45 },
  { day: "Tue", value: 0.5 },
  { day: "Wed", value: 0.55 },
  { day: "Thu", value: 0.52 },
  { day: "Fri", value: 0.7 },
  { day: "Sat", value: 0.82 },
  { day: "Sun", value: 0.88 },
];

// Mood distribution data
const moodDistribution = [
  { mood: "Happy", percentage: 40, color: "#F97316" },
  { mood: "Calm", percentage: 30, color: "#22D3EE" },
  { mood: "Reflective", percentage: 20, color: "#A855F7" },
  { mood: "Anxious", percentage: 10, color: "#FBBF24" },
];

// Entry frequency data (5 weeks × 7 days)
const entryFrequency = [
  [1, 2, 0, 1, 2, 3, 2],
  [2, 1, 3, 2, 1, 0, 1],
  [0, 2, 2, 3, 2, 1, 2],
  [1, 3, 2, 2, 1, 2, 3],
  [2, 3, 3, 2, 3, 3, 0],
];

export default function Insights() {
  const insets = useSafeAreaInsets();

  // Get frequency color based on value
  const getFrequencyColor = (value: number) => {
    if (value === 0) return "#2A2A2A";
    if (value === 1) return "#7C533C";
    if (value === 2) return "#C66D32";
    return "#F97316";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Weekly Overview Card */}
        <View style={styles.card}>
          <View style={styles.weeklyHeader}>
            <View>
              <Text style={styles.cardTitle}>Weekly Overview</Text>
              <Text style={styles.cardSubtitle}>Last 7 Days</Text>
            </View>
            <View style={styles.trendContainer}>
              <View style={styles.trendRow}>
                <Ionicons name="trending-up" size={16} color="#22C55E" />
                <Text style={styles.trendText}>+12%</Text>
              </View>
              <Text style={styles.trendSubtext}>vs last week</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Mood</Text>
              <Text style={styles.statValue}>Happy</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Entries</Text>
              <Text style={styles.statValue}>14</Text>
            </View>
          </View>

          {/* Line Chart using Views */}
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              {/* Chart lines and dots */}
              {weeklyMoodData.map((point, index) => {
                const y = CHART_HEIGHT - point.value * CHART_HEIGHT;
                const isLast = index === weeklyMoodData.length - 1;

                return (
                  <View
                    key={index}
                    style={[
                      styles.chartDot,
                      {
                        left: `${(index / (weeklyMoodData.length - 1)) * 100}%`,
                        bottom: `${point.value * 100}%`,
                        backgroundColor: isLast ? "#22C55E" : "#F97316",
                        width: isLast ? 12 : 8,
                        height: isLast ? 12 : 8,
                        marginLeft: isLast ? -6 : -4,
                        marginBottom: isLast ? -6 : -4,
                      },
                    ]}
                  />
                );
              })}

              {/* Connecting lines */}
              {weeklyMoodData.slice(0, -1).map((point, index) => {
                const nextPoint = weeklyMoodData[index + 1];
                const x1 = (index / (weeklyMoodData.length - 1)) * 100;
                const x2 = ((index + 1) / (weeklyMoodData.length - 1)) * 100;
                const y1 = point.value * 100;
                const y2 = nextPoint.value * 100;

                const length = Math.sqrt(
                  Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
                );
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

                return (
                  <View
                    key={`line-${index}`}
                    style={[
                      styles.chartLine,
                      {
                        left: `${x1}%`,
                        bottom: `${y1}%`,
                        width: `${length}%`,
                        transform: [{ rotate: `${-angle}deg` }],
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
              {weeklyMoodData.map((point, index) => (
                <Text key={index} style={styles.xAxisLabel}>
                  {point.day}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Mood Distribution Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Distribution</Text>

          <View style={styles.moodContent}>
            {/* Donut Chart */}
            <View style={styles.donutContainer}>
              <View style={styles.donutOuter}>
                {/* Segments represented as colored arcs */}
                <View
                  style={[
                    styles.donutSegment,
                    {
                      backgroundColor: "#F97316",
                      transform: [{ rotate: "0deg" }],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.donutSegment,
                    {
                      backgroundColor: "#22D3EE",
                      transform: [{ rotate: "144deg" }],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.donutSegment,
                    {
                      backgroundColor: "#A855F7",
                      transform: [{ rotate: "252deg" }],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.donutSegment,
                    {
                      backgroundColor: "#FBBF24",
                      transform: [{ rotate: "324deg" }],
                    },
                  ]}
                />
              </View>
              <View style={styles.donutInner}>
                <Text style={styles.donutNumber}>14</Text>
                <Text style={styles.donutLabel}>Entries</Text>
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
              {moodDistribution.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendMood}>{item.mood}</Text>
                  <Text style={styles.legendPercent}>{item.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* AI Weekly Reflection Card */}
        <View style={styles.card}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={18} color="#F97316" />
            </View>
            <Text style={styles.aiTitle}>AI Weekly Reflection</Text>
            <View style={styles.aiSparkles}>
              <Text style={styles.sparkleText}>✦</Text>
              <Text style={[styles.sparkleText, styles.sparkleSmall]}>✦</Text>
            </View>
          </View>

          <Text style={styles.aiText}>
            This week, your entries suggest a positive trend in productivity.
            You often mentioned "morning routine" and "exercise" alongside
            feeling Happy. However, Tuesday seemed slightly stressful due to
            work deadlines.
          </Text>

          <TouchableOpacity style={styles.aiButton}>
            <Text style={styles.aiButtonText}>View Full Analysis</Text>
            <Ionicons name="arrow-forward" size={16} color="#F97316" />
          </TouchableOpacity>
        </View>

        {/* Entry Frequency Card */}
        <View style={styles.card}>
          <View style={styles.frequencyHeader}>
            <Text style={styles.cardTitle}>Entry Frequency</Text>
            <View style={styles.frequencyLegend}>
              <Text style={styles.legendText}>Less</Text>
              {[0, 1, 2, 3].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.legendBox,
                    { backgroundColor: getFrequencyColor(level) },
                  ]}
                />
              ))}
              <Text style={styles.legendText}>More</Text>
            </View>
          </View>

          {/* Heatmap Grid */}
          <View style={styles.heatmapContainer}>
            {entryFrequency.map((week, weekIndex) => (
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
            You're on a{" "}
            <Text style={styles.streakHighlight}>5-day streak!</Text> Keep it
            up.
          </Text>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
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
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  weeklyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  trendContainer: {
    alignItems: "flex-end",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#22C55E",
  },
  trendSubtext: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chartContainer: {
    marginTop: 10,
  },
  chartArea: {
    height: CHART_HEIGHT,
    position: "relative",
    marginHorizontal: 10,
  },
  chartDot: {
    position: "absolute",
    borderRadius: 10,
    zIndex: 2,
  },
  chartLine: {
    position: "absolute",
    height: 2.5,
    backgroundColor: "#F97316",
    transformOrigin: "left center",
    zIndex: 1,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 0,
  },
  xAxisLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    flex: 1,
  },
  moodContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
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
    backgroundColor: "#F97316",
    overflow: "hidden",
    position: "relative",
  },
  donutSegment: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  donutInner: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  donutNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  donutLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  legendContainer: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendMood: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  aiIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  aiSparkles: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 2,
  },
  sparkleText: {
    fontSize: 12,
    color: "#3A3A3A",
  },
  sparkleSmall: {
    fontSize: 8,
    marginTop: 4,
  },
  aiText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 22,
    marginBottom: 16,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F97316",
    marginRight: 6,
  },
  frequencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  frequencyLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendText: {
    fontSize: 10,
    color: "#6B7280",
    marginHorizontal: 4,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  heatmapContainer: {
    gap: 6,
    marginBottom: 16,
  },
  heatmapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  heatmapCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    maxWidth: 42,
  },
  streakText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  streakHighlight: {
    color: "#F97316",
    fontWeight: "700",
  },
});
