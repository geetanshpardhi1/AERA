import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  isFirstTime: boolean;

  // Actions
  completeOnboarding: () => void;
  resetFirstTime: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isFirstTime: true,

      completeOnboarding: () => set({ isFirstTime: false }),

      resetFirstTime: () => set({ isFirstTime: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
