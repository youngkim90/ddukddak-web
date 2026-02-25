import { useRef, useEffect } from "react";
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
  /** 문장 단위 모드 — true면 sentences 배열 렌더링 */
  sentenceMode: boolean;
  /** 현재 재생 중인 문장 인덱스 (-1이면 비활성) */
  currentSentenceIndex: number;
  onTouchStart: (e: GestureResponderEvent) => void;
  onTouchEnd: (e: GestureResponderEvent) => void;
}

export function ViewerMainContent({
  page,
  language,
  videoVisible,
  player,
  sentenceMode,
  currentSentenceIndex,
  onTouchStart,
  onTouchEnd,
}: ViewerMainContentProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sentenceYPositions = useRef<Record<number, number>>({});

  // 현재 문장으로 자동 스크롤
  useEffect(() => {
    if (!sentenceMode || currentSentenceIndex < 0) return;
    const y = sentenceYPositions.current[currentSentenceIndex];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
  }, [sentenceMode, currentSentenceIndex]);

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
        <ScrollView
          ref={scrollRef}
          className="flex-1 rounded-xl bg-white/10 px-5 py-4"
          showsVerticalScrollIndicator={false}
        >
          {sentenceMode && page.sentences.length > 0 ? (
            page.sentences.map((sentence, i) => {
              const text = language === "ko" ? sentence.textKo : sentence.textEn;
              if (!text) return null;

              const isCurrent = i === currentSentenceIndex;
              const isPast = currentSentenceIndex >= 0 && i < currentSentenceIndex;
              const isFuture = currentSentenceIndex >= 0 && i > currentSentenceIndex;
              // currentSentenceIndex === -1 (idle) → 모든 문장 기본 밝기

              return (
                <Text
                  key={sentence.sentenceIndex}
                  onLayout={(e) => {
                    sentenceYPositions.current[i] = e.nativeEvent.layout.y;
                  }}
                  className={`text-center leading-8 mb-1 ${
                    isCurrent
                      ? "text-white rounded-lg bg-white/15 px-2 py-1"
                      : isPast
                        ? "text-white/50"
                        : isFuture
                          ? "text-white/35"
                          : "text-white"
                  }`}
                  style={{ fontFamily: "GowunDodum", fontSize: 20, fontWeight: isCurrent ? "bold" : "normal" }}
                >
                  {text}
                </Text>
              );
            })
          ) : (
            <Text
              className="text-center leading-8 text-white"
              style={{ fontFamily: "GowunDodum", fontSize: 20, fontWeight: "bold" }}
            >
              {language === "ko" ? page.textKo : page.textEn}
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
