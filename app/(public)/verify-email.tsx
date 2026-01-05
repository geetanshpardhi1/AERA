import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerifyEmail() {
  const router = useRouter();
  const { signUp, setActive } = useSignUp();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!signUp) return;

    if (!code || code.length < 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(protected)/(tabs)/home");
      } else {
        Alert.alert("Error", "Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      Alert.alert(
        "Verification Failed",
        err.errors?.[0]?.message || "Invalid code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Success", "A new code has been sent to your email");
    } catch (err: any) {
      console.error("Resend error:", err);
      Alert.alert("Error", "Failed to resend code");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black px-6"
    >
      <View className="flex-1 justify-center pt-20">
        {/* Glass Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <BlurView intensity={20} tint="dark" style={styles.backButtonBlur} />
          <View style={styles.backButtonOverlay} />
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-4xl font-bold text-white mb-4">
          Verify{"\n"}Email
        </Text>
        <Text className="text-stone-400 text-lg mb-12 font-medium">
          Enter the 6-digit code sent to your email address.
        </Text>

        <View className="gap-6">
          <TextInput
            className="bg-stone-900 border border-stone-800 rounded-[32px] px-4 py-8 text-4xl text-white text-center font-bold tracking-[12px] h-[120px]"
            placeholder="000000"
            placeholderTextColor="#334155"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
            autoFocus
            selectionColor="#f97316"
          />

          {/* Glass Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
          >
            <BlurView intensity={30} tint="light" style={styles.blurView} />
            <View style={styles.buttonOverlay} />
            <View style={styles.buttonHighlight} />
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold z-10">
                Verify Code
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResendCode}
            disabled={loading}
            className="items-center py-4"
          >
            <Text className="text-stone-400 text-base font-medium">
              Didn't receive code?{" "}
              <Text className="text-orange-500 font-bold">Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  backButtonBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  backButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 22,
  },
  submitButton: {
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(249, 115, 22, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
  },
  buttonHighlight: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
});
