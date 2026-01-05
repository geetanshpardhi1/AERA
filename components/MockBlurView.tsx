export default function MockBlurView({ children, className }) {
  // Mock BlurView for Expo Go compatibility if needed, or if package issue
  const { View } = require("react-native");
  return <View className={`${className} bg-slate-900/80`}>{children}</View>;
}
