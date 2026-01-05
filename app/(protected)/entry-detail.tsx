import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock data for entries - in a real app this would come from a database
const mockEntries: Record<string, any> = {
  "1": {
    id: 1,
    date: "October 24, 2023",
    mood: "Happy",
    moodEmoji: "😊",
    time: "10:42 AM",
    title: "Productive Morning at the Cafe",
    content: `Today I finally managed to finish the draft for the new project. The coffee was great and the atmosphere really helped me focus. I spent about three hours working non-stop and felt a real sense of flow.

Afterwards, I took a short walk in the park to clear my head. The autumn leaves are starting to fall, creating a beautiful orange carpet on the grass. It reminded me to slow down and appreciate the small transitions in life.`,
  },
  "2": {
    id: 2,
    date: "October 24, 2023",
    mood: "Calm",
    moodEmoji: "😌",
    time: "2:15 PM",
    title: "Project Breakthrough",
    content: `Finally solved that bug that was bothering me all week. It turns out it was a simple typo in the configuration file. Sometimes the smallest things cause the biggest headaches.

I celebrated with a nice cup of tea and spent some time refactoring the code to make it cleaner. Feeling accomplished and ready for the next challenge.`,
  },
  "3": {
    id: 3,
    date: "October 23, 2023",
    mood: "Peaceful",
    moodEmoji: "🌿",
    time: "6:00 PM",
    title: "Evening Walk",
    content: `Took a walk by the river. It was very peaceful and quiet. Saw a family of ducks swimming together, which made me smile.

The sunset was beautiful today - shades of orange and pink reflecting on the water. These simple moments of nature really help me decompress after a busy day.`,
  },
  "4": {
    id: 4,
    date: "October 22, 2023",
    mood: "Reflective",
    moodEmoji: "🌙",
    time: "11:45 PM",
    title: "Late Night Thoughts",
    content: `Thinking about the future and where I want to be in 5 years. It's a bit scary but also exciting. There are so many possibilities.

I've been journaling more consistently lately and I can already see the benefits. It helps me process my thoughts and emotions in a healthy way.`,
  },
};

export default function EntryDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const entry = mockEntries[id as string] || mockEntries["1"];

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Delete from database
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // TODO: Navigate to edit screen with entry data
    Alert.alert("Coming Soon", "Edit functionality coming soon!");
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerDate}>{entry.date}</Text>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Entry Card */}
        <View style={styles.entryCard}>
          {/* Gradient/Image Header Area */}
          <View style={styles.cardHeader}>
            <View style={styles.gradientOverlay} />
          </View>

          {/* Mood Emoji */}
          <View style={styles.emojiContainer}>
            <Text style={styles.moodEmoji}>{entry.moodEmoji}</Text>
          </View>

          {/* Entry Content */}
          <View style={styles.cardContent}>
            {/* Mood and Time */}
            <View style={styles.moodRow}>
              <Text style={styles.moodText}>Feeling {entry.mood}</Text>
              <Text style={styles.timeText}>{entry.time}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{entry.title}</Text>

            {/* Content */}
            <Text style={styles.content}>{entry.content}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View
        style={[styles.bottomButtons, { paddingBottom: insets.bottom + 20 }]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.9}
        >
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Entry</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerDate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  entryCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardHeader: {
    height: 100,
    backgroundColor: "#2A2A2A",
    position: "relative",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    marginLeft: 20,
    borderWidth: 3,
    borderColor: "#1A1A1A",
  },
  moodEmoji: {
    fontSize: 32,
  },
  cardContent: {
    padding: 20,
    paddingTop: 12,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  moodText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  timeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 32,
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    color: "#9CA3AF",
    lineHeight: 26,
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  editButton: {
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
  editButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
