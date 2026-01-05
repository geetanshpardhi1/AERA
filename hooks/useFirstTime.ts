import { useAuthStore } from "../store/authStore";

export const useFirstTime = () => {
  const isFirstTime = useAuthStore((state) => state.isFirstTime);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  return {
    isFirstTime,
    completeOnboarding,
  };
};
