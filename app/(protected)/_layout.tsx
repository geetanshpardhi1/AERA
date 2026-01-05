import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function ProtectedLayout() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(public)/login");
    }
  }, [isSignedIn, isLoaded]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="new-entry"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="entry-detail"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
