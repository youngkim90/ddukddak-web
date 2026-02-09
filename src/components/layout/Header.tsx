import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  onBack,
  rightAction,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return (
    <View
      className="flex-row items-center bg-white px-4 py-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* Left spacer / back button */}
      <View className="w-10">
        {showBack && (
          <Pressable
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full"
            accessibilityLabel="뒤로가기"
          >
            <ChevronLeft size={24} color="#333333" />
          </Pressable>
        )}
      </View>

      {/* Centered title */}
      <Text className="flex-1 text-center text-lg font-bold text-text-main">
        {title}
      </Text>

      {/* Right spacer / action */}
      <View className="w-10 items-end">
        {rightAction}
      </View>
    </View>
  );
}
