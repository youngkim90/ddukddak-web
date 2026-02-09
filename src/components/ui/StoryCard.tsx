import { Pressable, View, Text } from "react-native";
import { Image } from "expo-image";
import { Lock } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  title: string;
  thumbnailColor?: string;
  thumbnailUrl?: string;
  isLocked?: boolean;
  onPress?: () => void;
  className?: string;
}

export function StoryCard({
  title,
  thumbnailColor = "#FFE4B5",
  thumbnailUrl,
  isLocked = false,
  onPress,
  className,
}: StoryCardProps) {
  return (
    <Pressable onPress={onPress} className={cn("w-36", className)} accessibilityLabel={title}>
      <View
        className="aspect-[3/2] w-full overflow-hidden rounded-xl"
        style={{ backgroundColor: thumbnailColor }}
      >
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl" accessibilityElementsHidden>📖</Text>
          </View>
        )}
        {isLocked && (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <Lock size={24} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text className="mt-2 text-sm font-bold text-text-main" numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}
