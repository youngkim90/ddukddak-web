import { View, Text, GestureResponderEvent } from "react-native";
import { Image } from "expo-image";
import { VideoView } from "expo-video";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { StoryPage } from "@/types/story";

/** 대사(큰따옴표 안)와 나레이션을 분리하여 렌더링 */
function StyledSubtitle({ text, fontSize }: { text: string; fontSize: number }) {
  // "..." 또는 "..." 패턴으로 대사 구분
  const parts = text.split(/("[^"]*"|"[^"]*")/g);

  return (
    <Text
      className="text-center leading-8 text-white"
      style={{ fontFamily: "GowunDodum", fontSize, fontWeight: "bold" }}
    >
      {parts.map((part, i) => {
        const isDialogue = /^[""][^]*[""]$/.test(part);
        return isDialogue ? (
          <Text key={i} style={{ color: "#FFEAA7" }}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        );
      })}
    </Text>
  );
}

interface ViewerMainContentProps {
  page: StoryPage;
  language: "ko" | "en";
  videoVisible: boolean;
  player: React.ComponentProps<typeof VideoView>["player"];
  /** 문장 단위 모드 — true면 현재 문장만 렌더링 */
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
  // 현재 재생 중인 문장 텍스트 추출
  // TTS 미시작(index=-1)이면 첫 문장을 기본 표시
  const sentenceIdx = sentenceMode && page.sentences.length > 0
    ? Math.max(0, currentSentenceIndex)
    : -1;
  const currentSentenceText = sentenceIdx >= 0
    ? (language === "ko"
        ? page.sentences[sentenceIdx]?.textKo
        : page.sentences[sentenceIdx]?.textEn)
    : null;

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
        <View className="flex-1 rounded-xl bg-white/10 px-5 py-4 justify-center">
          {currentSentenceText ? (
            <StyledSubtitle text={currentSentenceText} fontSize={22} />
          ) : (
            (language === "ko" ? page.textKo : page.textEn) ? (
              <StyledSubtitle text={(language === "ko" ? page.textKo : page.textEn)} fontSize={22} />
            ) : null
          )}
        </View>
      </View>
    </View>
  );
}
