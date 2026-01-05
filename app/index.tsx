import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { isFirstTime } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load

    // Route user based on auth state
    if (isSignedIn) {
      // User is logged in → go to Home Feed
      router.replace("/(protected)/(tabs)/home");
    } else {
      // User is not logged in
      if (isFirstTime) {
        // First-time user → go to Onboarding
        router.replace("/(public)/onboarding");
      } else {
        // Returning user → go to Login
        router.replace("/(public)/login");
      }
    }
  }, [isSignedIn, isFirstTime, isLoaded]);

  // Return empty view - splash screen is still showing from _layout.tsx
  return <View className="flex-1 bg-slate-950" />;
}
