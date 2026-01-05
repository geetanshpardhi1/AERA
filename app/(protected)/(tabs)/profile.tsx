import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(public)/login");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  const handleMenuPress = (item: string) => {
    // TODO: Navigate to respective screens
    Alert.alert("Coming Soon", `${item} screen coming soon!`);
  };

  // Handle avatar edit - show action sheet
  const handleAvatarEdit = () => {
    const options = user?.imageUrl
      ? ["Change Photo", "Remove Photo", "Cancel"]
      : ["Choose Photo", "Cancel"];
    const destructiveIndex = user?.imageUrl ? 1 : undefined;
    const cancelIndex = user?.imageUrl ? 2 : 1;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: destructiveIndex,
          cancelButtonIndex: cancelIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            pickImage();
          } else if (buttonIndex === 1 && user?.imageUrl) {
            removePhoto();
          }
        }
      );
    } else {
      // Android fallback with Alert
      Alert.alert(
        "Profile Photo",
        "Choose an option",
        user?.imageUrl
          ? [
              { text: "Change Photo", onPress: pickImage },
              {
                text: "Remove Photo",
                onPress: removePhoto,
                style: "destructive",
              },
              { text: "Cancel", style: "cancel" },
            ]
          : [
              { text: "Choose Photo", onPress: pickImage },
              { text: "Cancel", style: "cancel" },
            ]
      );
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) return;

    setImageLoading(true);
    try {
      const base64Image = `data:image/jpeg;base64,${asset.base64}`;
      await user.setProfileImage({ file: base64Image });
      Alert.alert("Success", "Profile picture updated!");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Error",
        error.errors?.[0]?.message || "Failed to update profile picture."
      );
    } finally {
      setImageLoading(false);
    }
  };

  const removePhoto = async () => {
    if (!user) return;

    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setImageLoading(true);
            try {
              await user.setProfileImage({ file: null });
              Alert.alert("Success", "Profile picture removed!");
            } catch (error: any) {
              console.error("Error removing image:", error);
              Alert.alert("Error", "Failed to remove profile picture.");
            } finally {
              setImageLoading(false);
            }
          },
        },
      ]
    );
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return "U";
  };

  const userName = user?.fullName || user?.firstName || "User";
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || "email@example.com";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {imageLoading ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="large" color="#F97316" />
              </View>
            ) : user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleAvatarEdit}
              disabled={imageLoading}
            >
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* ACCOUNT Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(protected)/edit-profile")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, styles.menuIconBlue]}>
                <Ionicons name="person" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.menuText}>Edit profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(protected)/change-password")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, styles.menuIconYellow]}>
                <Ionicons name="lock-closed" size={18} color="#FBBF24" />
              </View>
              <Text style={styles.menuText}>Change password</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PREFERENCES Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.sectionCard}>
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconPurple]}>
                <Ionicons name="moon" size={18} color="#A855F7" />
              </View>
              <Text style={styles.menuText}>Theme</Text>
              <Text style={styles.menuValue}>Dark Only</Text>
            </View>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.menuIconRed]}>
                <Ionicons name="notifications" size={18} color="#EF4444" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#3A3A3A", true: "#F97316" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#3A3A3A"
              />
            </View>
          </View>
        </View>

        {/* APP Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress("About")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, styles.menuIconCyan]}>
                <Ionicons name="information-circle" size={18} color="#22D3EE" />
              </View>
              <Text style={styles.menuText}>About</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress("Privacy policy")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, styles.menuIconGreen]}>
                <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
              </View>
              <Text style={styles.menuText}>Privacy policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#F97316" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 2.4.0 (Build 1245)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#F97316",
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#F97316",
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#F97316",
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F97316",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2A2A2A",
    borderWidth: 2,
    borderColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginLeft: 56,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuIconBlue: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
  },
  menuIconYellow: {
    backgroundColor: "rgba(251, 191, 36, 0.15)",
  },
  menuIconPurple: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
  },
  menuIconRed: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  menuIconCyan: {
    backgroundColor: "rgba(34, 211, 238, 0.15)",
  },
  menuIconGreen: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
  },
  menuValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127, 29, 29, 0.3)",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(127, 29, 29, 0.5)",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F97316",
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
});
