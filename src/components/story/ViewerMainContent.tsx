import { View, Text, ScrollView, GestureResponderEvent } from "react-native";
import { Image } from "expo-image";
import { VideoView } from "expo-video";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { StoryPage } from "@/types/story";

interface ViewerMainContentProps {
  page: StoryPage;
  language: "ko" | "en";
  videoVisible: boolean;
  player: React.ComponentProps<typeof VideoView>["player"];
  onTouchStart: (e: GestureResponderEvent) => void;
  onTouchEnd: (e: GestureResponderEvent) => void;
}

export function ViewerMainContent({
  page,
  language,
  videoVisible,
  player,
  onTouchStart,
  onTouchEnd,
}: ViewerMainContentProps) {
  return (
    <View className="flex-1 justify-center" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <View className="items-center" style={{ paddingHorizontal: "2%" }}>
        {page.imageUrl ? (
          <View className="w-full aspect-[3/2] rounded-xl overflow-hidden">
            <Image
              source={{ uri: getOptimizedImageUrl(page.imageUrl, 800) }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
            {page.mediaType === "video" && page.videoUrl && (
              <VideoView
                player={player}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: videoVisible ? 1 : 0,
                }}
                contentFit="cover"
                nativeControls={false}
                playsInline={true}
                allowsFullscreen={false}
              />
            )}
          </View>
        ) : (
          <View className="w-full aspect-[3/2] rounded-xl bg-[#2A2A3E]" />
        )}
      </View>

      <View className="px-6 pt-3" style={{ height: 160 }}>
        <ScrollView className="flex-1 rounded-xl bg-white/10 px-5 py-4" showsVerticalScrollIndicator={false}>
          <Text
            className="text-center leading-8 text-white"
            style={{ fontFamily: "GowunDodum", fontSize: 20, fontWeight: "bold" }}
          >
            {language === "ko" ? page.textKo : page.textEn}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}
