import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { CATEGORIES, journalService, MOODS } from "../../lib/journal-service";

export default function NewEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [selectedMood, setSelectedMood] = useState(3); // Default to neutral
  const [selectedCategory, setSelectedCategory] = useState("personal");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Fetch entry data if editing
  useEffect(() => {
    if (!isEditing || !user) return;

    const fetchEntry = async () => {
      setInitialLoading(true);
      try {
        const entry = await journalService.getById(user.id, id as string);
        if (entry) {
          setTitle(entry.title);
          setContent(entry.content || "");
          setSelectedMood(entry.mood);
          setSelectedCategory(entry.category);
        } else {
          Alert.alert("Error", "Entry not found");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching entry for edit:", error);
        Alert.alert("Error", "Failed to load entry");
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEntry();
  }, [id, user]);

  // Get current date info
  const dateInfo = useMemo(() => {
    const now = new Date();
    // ... (existing date logic remains same)
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

  const handleSave = async () => {
    if (!user) return;

    if (!title.trim() && !content.trim()) {
      Alert.alert(
        "Empty Entry",
        "Please add a title or some content to your entry."
      );
      return;
    }

    setLoading(true);
    try {
      const moodData = MOODS.find((m) => m.value === selectedMood) || MOODS[2];

      if (isEditing) {
        await journalService.update(user.id, id as string, {
          title: title.trim() || "Untitled Entry",
          content: content.trim(),
          mood: selectedMood,
          mood_emoji: moodData.emoji,
          mood_label: moodData.label,
          category: selectedCategory,
        });
      } else {
        await journalService.create(user.id, {
          title: title.trim() || "Untitled Entry",
          content: content.trim(),
          mood: selectedMood,
          mood_emoji: moodData.emoji,
          mood_label: moodData.label,
          category: selectedCategory,
        });
      }

      // Navigate back
      router.back();
    } catch (error: any) {
      console.error("Error saving entry:", error);
      Alert.alert("Error", "Failed to save journal entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

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
              <Text style={styles.todayText}>
                {isEditing ? "EDIT ENTRY" : "TODAY"}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {dateInfo.dayName}, {dateInfo.monthName} {dateInfo.date}
            </Text>
          </View>

          {/* Mood Selection */}
          <View style={styles.moodSection}>
            <Text style={styles.label}>How are you feeling?</Text>
            <View style={styles.moodContainer}>
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  onPress={() => setSelectedMood(mood.value)}
                  style={[
                    styles.moodButton,
                    selectedMood === mood.value && styles.moodButtonSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.categorySection}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat.id &&
                      styles.categoryButtonSelected,
                    selectedCategory === cat.id && {
                      backgroundColor: cat.color + "20",
                      borderColor: cat.color,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.id && {
                        color: cat.color,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
              editable={!loading}
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
              editable={!loading}
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
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Update Entry" : "Save Entry"}
                </Text>
                <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
              </>
            )}
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
  label: {
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
  categorySection: {
    marginBottom: 32,
  },
  categoryContainer: {
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  categoryButtonSelected: {
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
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
