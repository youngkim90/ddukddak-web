import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "lucide-react-native";

export function HomeHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between bg-white px-4 py-3"
      style={{ paddingTop: insets.top + 12 }}
    >
      <Pressable
        onPress={() => router.push("/(tabs)/home")}
        className="flex-row items-center gap-2"
      >
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Text className="text-sm font-bold text-white">뚝</Text>
        </View>
        <Text className="text-lg font-bold text-text-main">뚝딱동화</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(tabs)/settings")}
        className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5]"
        accessibilityLabel="프로필"
      >
        <User size={20} color="#888888" />
      </Pressable>
    </View>
  );
}
