import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { JournalEntry, journalService } from "../../lib/journal-service";

export default function EntryDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { user } = useUser();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!user || !id) return;
      try {
        const data = await journalService.getById(user.id, id as string);
        setEntry(data);
      } catch (error) {
        console.error("Error fetching entry:", error);
        Alert.alert("Error", "Failed to load entry details.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [user, id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user || !id) return;
            setDeleting(true);
            try {
              await journalService.delete(user.id, id as string);
              router.back();
            } catch (error) {
              console.error("Error deleting entry:", error);
              Alert.alert("Error", "Failed to delete entry.");
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/(protected)/new-entry?id=${id}`);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "#fff" }}>Entry not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#F97316" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerDate}>{formatDate(entry.created_at)}</Text>

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
            <Text style={styles.moodEmoji}>{entry.mood_emoji}</Text>
          </View>

          {/* Entry Content */}
          <View style={styles.cardContent}>
            {/* Mood and Time */}
            <View style={styles.moodRow}>
              <Text style={styles.moodText}>
                Feeling {entry.mood_label || "Normal"}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(entry.created_at)}
              </Text>
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
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </>
          )}
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
  center: {
    alignItems: "center",
    justifyContent: "center",
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
