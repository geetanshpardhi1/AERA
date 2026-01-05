import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for React Native using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for journal entries
export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: number; // 1-5 scale
  mood_emoji: string;
  mood_label: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEntryInput {
  title: string;
  content: string;
  mood: number;
  mood_emoji: string;
  mood_label: string;
  category?: string;
}

export interface UpdateEntryInput {
  title?: string;
  content?: string;
  mood?: number;
  mood_emoji?: string;
  mood_label?: string;
  category?: string;
}
