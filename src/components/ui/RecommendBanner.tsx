import { Pressable, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface RecommendBannerProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function RecommendBanner({
  title,
  subtitle,
  onPress,
}: RecommendBannerProps) {
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={["#FF9500", "#FFBB5C"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        className="rounded-2xl px-5 py-6"
      >
        <Text className="text-sm text-white/90">{subtitle}</Text>
        <Text className="mt-1 text-xl font-bold text-white">{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}
