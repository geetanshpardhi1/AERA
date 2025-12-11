import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1  items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-black-500">
        Welcome to Aera!
      </Text>
      <Link href="/test">Go to Test</Link>
    </View>
  );
}
