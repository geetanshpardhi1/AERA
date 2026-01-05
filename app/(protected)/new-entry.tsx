import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mood options with emojis
const moodOptions = [
  { id: 1, emoji: "😣", label: "Very Bad" },
  { id: 2, emoji: "😐", label: "Bad" },
  { id: 3, emoji: "😐", label: "Neutral" },
  { id: 4, emoji: "🙂", label: "Good" },
  { id: 5, emoji: "😄", label: "Great" },
];

export default function NewEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedMood, setSelectedMood] = useState(3); // Default to neutral
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Get current date info
  const dateInfo = useMemo(() => {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return {
      dayName: days[now.getDay()],
      monthName: months[now.getMonth()],
      date: now.getDate(),
    };
  }, []);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    // TODO: Save entry to database
    console.log("Saving entry:", { mood: selectedMood, title, content });
    router.back();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Date Header */}
          <View style={styles.dateHeader}>
            <View style={styles.todayIndicator}>
              <View style={styles.todayLine} />
              <Text style={styles.todayText}>TODAY</Text>
            </View>
            <Text style={styles.dateText}>
              {dateInfo.dayName}, {dateInfo.monthName} {dateInfo.date}
            </Text>
          </View>

          {/* Mood Selection */}
          <View style={styles.moodSection}>
            <Text style={styles.moodLabel}>How are you feeling?</Text>
            <View style={styles.moodContainer}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  onPress={() => setSelectedMood(mood.id)}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.id && styles.moodButtonSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.titleContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title your entry"
              placeholderTextColor="#6B7280"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Ionicons name="pencil" size={18} color="#6B7280" />
          </View>

          {/* Content Input */}
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="What's on your mind?..."
              placeholderTextColor="#6B7280"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View
          style={[styles.bottomButtons, { paddingBottom: insets.bottom + 20 }]}
        >
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.9}
          >
            <Text style={styles.saveButtonText}>Save Entry</Text>
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 24,
  },
  dateHeader: {
    marginBottom: 32,
  },
  todayIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  todayLine: {
    width: 24,
    height: 3,
    backgroundColor: "#F97316",
    borderRadius: 2,
    marginRight: 10,
  },
  todayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
  },
  dateText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  moodSection: {
    marginBottom: 32,
  },
  moodLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 8,
    justifyContent: "space-between",
  },
  moodButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  moodButtonSelected: {
    borderWidth: 2,
    borderColor: "#F97316",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
  },
  moodEmoji: {
    fontSize: 28,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contentContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  contentInput: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 24,
    minHeight: 180,
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: "#F97316",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
