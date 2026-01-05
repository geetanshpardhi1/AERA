import {
  ClerkProvider as BaseClerkProvider,
  ClerkLoaded,
} from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import React from "react";

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("SecureStore get error:", err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("SecureStore save error:", err);
    }
  },
};

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.warn(
      "Missing Clerk Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file"
    );
    // Return children without Clerk if key is missing (development fallback)
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>{children}</ClerkLoaded>
    </BaseClerkProvider>
  );
}
