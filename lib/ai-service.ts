import { JournalEntry } from "./journal-service";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const aiService = {
  /**
   * Send weekly entries to OpenAI for analysis
   */
  async generateWeeklyInsight(entries: JournalEntry[]): Promise<string> {
    if (!OPENAI_API_KEY) {
      throw new Error(
        "OpenAI API Key is missing. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file."
      );
    }

    if (!entries || entries.length === 0) {
      return "Not enough entries this week to generate an insight. Keep journaling!";
    }

    try {
      // Format entries for the AI
      const entriesText = entries
        .map(
          (e) =>
            `- ${new Date(e.created_at).toDateString()} (Mood: ${
              e.mood_label || e.mood
            }): ${e.content}`
        )
        .join("\n");

      const prompt = `
You are a supportive, empathetic mental health companion.
Analyze the following journal entries from the last 7 days and provide a specific, personalized reflection.
Highlight any mood patterns, celebrate small wins, and offer a gentle suggestion for the coming week.
Keep the response concise (under 80 words) and warm.

Entries:
${entriesText}
`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful and empathetic AI journaling assistant.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 150,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        console.error("OpenAI API Error:", errData);
        throw new Error(
          `OpenAI API failed: ${errData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const insight = data.choices[0]?.message?.content?.trim();

      return insight || "Could not generate insight at this time.";
    } catch (error: any) {
      console.error("AI Service Error:", error);
      throw new Error(error.message || "Failed to generate AI insight.");
    }
  },

  /**
   * Generate a daily journaling question
   */
  async generateDailyQuestion(): Promise<{
    question: string;
    description: string;
  }> {
    if (!OPENAI_API_KEY) {
      // Fallback if no key
      return {
        question: "What is one thing you are grateful for today?",
        description: "Gratitude turns what we have into enough.",
      };
    }

    try {
      const prompt = `
You are a wise, supportive companion.
Generate a unique, thought-provoking journaling question for today.
Keep the question extremely concise (under 12 words).
Also provide a short, 1-sentence inspirational description or quote related to the question.
Return strictly valid JSON in this format:
{
  "question": "Short question here",
  "description": "Short description here"
}
`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant that outputs JSON.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 100,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("OpenAI API failed");
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0]?.message?.content || "{}");

      return {
        question: content.question || "How are you feeling today?",
        description: content.description || "Take a moment to reflect.",
      };
    } catch (error) {
      console.error("AI Daily Question Error:", error);
      return {
        question: "What is on your mind today?",
        description: "Free writing clears the mind.",
      };
    }
  },
};
