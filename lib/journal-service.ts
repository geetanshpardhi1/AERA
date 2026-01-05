import {
  CreateEntryInput,
  JournalEntry,
  supabase,
  UpdateEntryInput,
} from "./supabase";

export { CreateEntryInput, JournalEntry, UpdateEntryInput };

// Journal CRUD Operations
export const journalService = {
  /**
   * Create a new journal entry
   */
  async create(
    userId: string,
    input: CreateEntryInput
  ): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: userId,
        title: input.title,
        content: input.content,
        mood: input.mood,
        mood_emoji: input.mood_emoji,
        mood_label: input.mood_label,
        category: input.category || "personal",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating entry:", error);
      throw error;
    }

    return data;
  },

  /**
   * Get all entries for a user
   */
  async getAll(userId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get entries with pagination
   */
  async getPaginated(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ entries: JournalEntry[]; hasMore: boolean }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("journal_entries")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }

    return {
      entries: data || [],
      hasMore: count ? from + limit < count : false,
    };
  },

  /**
   * Get a single entry by ID
   */
  async getById(userId: string, entryId: string): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", entryId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching entry:", error);
      throw error;
    }

    return data;
  },

  /**
   * Get entries by category
   */
  async getByCategory(
    userId: string,
    category: string
  ): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get recent entries (last 7 days)
   */
  async getRecent(userId: string, limit: number = 5): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent entries:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get entries by date (UTC date comparison)
   */
  async getByDate(userId: string, date: Date): Promise<JournalEntry[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching entries by date:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Update an entry
   */
  async update(
    userId: string,
    entryId: string,
    input: UpdateEntryInput
  ): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from("journal_entries")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating entry:", error);
      throw error;
    }

    return data;
  },

  /**
   * Delete an entry
   */
  async delete(userId: string, entryId: string): Promise<boolean> {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }

    return true;
  },

  /**
   * Get mood statistics for a user
   */
  async getMoodStats(
    userId: string,
    days: number = 7
  ): Promise<{
    averageMood: number;
    totalEntries: number;
    moodDistribution: Record<number, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("journal_entries")
      .select("mood")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    if (error) {
      console.error("Error fetching mood stats:", error);
      throw error;
    }

    const entries = data || [];
    const totalEntries = entries.length;

    if (totalEntries === 0) {
      return {
        averageMood: 0,
        totalEntries: 0,
        moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const moodSum = entries.reduce((acc, entry) => acc + entry.mood, 0);
    const averageMood = moodSum / totalEntries;

    const moodDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    entries.forEach((entry) => {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    });

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries,
      moodDistribution,
    };
  },

  /**
   * Search entries by title or content
   */
  async search(userId: string, query: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching entries:", error);
      throw error;
    }

    return data || [];
  },
};

// Mood constants
export const MOODS = [
  { value: 1, emoji: "😣", label: "Very Bad", color: "#EF4444" },
  { value: 2, emoji: "😔", label: "Bad", color: "#F97316" },
  { value: 3, emoji: "😐", label: "Neutral", color: "#FBBF24" },
  { value: 4, emoji: "🙂", label: "Good", color: "#22C55E" },
  { value: 5, emoji: "😄", label: "Great", color: "#10B981" },
];

export const CATEGORIES = [
  { id: "personal", label: "Personal", color: "#A855F7" },
  { id: "work", label: "Work", color: "#3B82F6" },
  { id: "wellness", label: "Wellness", color: "#22C55E" },
  { id: "morning", label: "Morning", color: "#FBBF24" },
  { id: "evening", label: "Evening", color: "#6366F1" },
];
