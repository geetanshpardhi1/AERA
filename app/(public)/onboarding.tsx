import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFirstTime } from "../../hooks/useFirstTime";

const { width, height } = Dimensions.get("window");

// Onboarding slide data
const onboardingData = [
  {
    id: "1",
    title: "WELCOME",
    subtitle:
      "Discover a new way to manage your daily tasks with style and efficiency.",
    image: require("../../assets/images/onboarding/hero-1.png"),
    backgroundColor: "#0A0A0A",
    primaryButton: "Get Started",
    secondaryText: "Already have an account?",
    secondaryLink: "Log in",
    showSecondaryButton: false,
    footerText: null,
  },
  {
    id: "2",
    title: "Unlock Your Potential",
    subtitle:
      "Join our community today to track progress, analyze stats, and reach your goals faster.",
    image: require("../../assets/images/onboarding/hero-2.png"),
    backgroundColor: "#0A0A0A",
    primaryButton: "Create Account",
    secondaryButtonText: "Sign In",
    showSecondaryButton: true,
    footerText: "By continuing you agree to our Terms & Privacy Policy",
  },
];

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  image: any;
  backgroundColor: string;
  primaryButton: string;
  secondaryText?: string;
  secondaryLink?: string;
  secondaryButtonText?: string;
  showSecondaryButton: boolean;
  footerText: string | null;
}

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useFirstTime();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGetStarted = () => {
    // Navigate to second slide
    if (currentIndex === 0) {
      flatListRef.current?.scrollToIndex({ index: 1, animated: true });
    }
  };

  const handleCreateAccount = () => {
    completeOnboarding();
    router.push("/(public)/signup");
  };

  const handleLogin = () => {
    completeOnboarding();
    router.push("/(public)/login");
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => {
    const isFirstSlide = index === 0;

    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        {/* Content Container */}
        <View
          style={[styles.contentContainer, { paddingTop: insets.top + 60 }]}
        >
          {/* Title */}
          <Text
            style={[
              styles.title,
              isFirstSlide ? styles.titleScreen1 : styles.titleScreen2,
            ]}
          >
            {item.title}
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          {/* Image Card */}
          <View style={styles.imageCardContainer}>
            <View style={styles.imageCard}>
              <Image
                source={item.image}
                style={styles.heroImage}
                contentFit="cover"
                transition={300}
              />
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
        >
          {/* Primary Button */}
          <TouchableOpacity
            onPress={isFirstSlide ? handleGetStarted : handleCreateAccount}
            style={styles.primaryButton}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>{item.primaryButton}</Text>
          </TouchableOpacity>

          {/* Secondary Button / Link */}
          {item.showSecondaryButton ? (
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {item.secondaryButtonText}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.loginTextContainer}>
              <Text style={styles.loginText}>{item.secondaryText} </Text>
              <Pressable onPress={handleLogin}>
                <Text style={styles.loginLink}>{item.secondaryLink}</Text>
              </Pressable>
            </View>
          )}

          {/* Footer Text */}
          {item.footerText && (
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                By continuing you agree to our{" "}
                <Text style={styles.footerLink}>Terms</Text> &{" "}
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  slide: {
    width: width,
    height: height,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 28,
  },
  title: {
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  titleScreen1: {
    fontSize: 36,
    letterSpacing: 6,
  },
  titleScreen2: {
    fontSize: 32,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  imageCardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  imageCard: {
    width: width - 70,
    aspectRatio: 0.9,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  bottomContainer: {
    paddingHorizontal: 28,
    paddingTop: 10,
  },
  primaryButton: {
    backgroundColor: "#F97316",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#F97316",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    backgroundColor: "transparent",
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loginTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  loginText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  loginLink: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerContainer: {
    paddingTop: 8,
    alignItems: "center",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
  },
  footerLink: {
    textDecorationLine: "underline",
    color: "#9CA3AF",
  },
});
