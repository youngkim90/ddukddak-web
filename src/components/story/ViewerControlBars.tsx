import { View, Text, Pressable } from "react-native";
import { SkipBack, SkipForward, Play, Pause, Volume2, Music } from "lucide-react-native";

interface ViewerControlBarsProps {
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  isPlaying: boolean;
  language: "ko" | "en";
  ttsEnabled: boolean;
  bgmEnabled: boolean;
  onPrevious: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onToggleLanguage: () => void;
  onToggleTts: () => void;
  onToggleBgm: () => void;
}

export function ViewerControlBars({
  currentPage,
  totalPages,
  progressPercent,
  isPlaying,
  language,
  ttsEnabled,
  bgmEnabled,
  onPrevious,
  onPlayPause,
  onNext,
  onToggleLanguage,
  onToggleTts,
  onToggleBgm,
}: ViewerControlBarsProps) {
  return (
    <>
      <View className="flex-row items-center justify-center gap-6 bg-black/20 py-4">
        <Pressable
          onPress={onPrevious}
          disabled={currentPage === 0}
          className={`h-12 w-12 items-center justify-center rounded-full bg-white/10 ${
            currentPage === 0 ? "opacity-30" : ""
          }`}
          accessibilityLabel="이전"
        >
          <SkipBack size={24} color="#FFFFFFD9" />
        </Pressable>
        <Pressable
          onPress={onPlayPause}
          className="h-16 w-16 items-center justify-center rounded-full bg-primary/85"
          accessibilityLabel={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? (
            <Pause size={32} color="#FFFFFFD9" />
          ) : (
            <Play size={32} color="#FFFFFFD9" style={{ marginLeft: 4 }} />
          )}
        </Pressable>
        <Pressable
          onPress={onNext}
          className="h-12 w-12 items-center justify-center rounded-full bg-white/10"
          accessibilityLabel="다음"
        >
          <SkipForward size={24} color="#FFFFFFD9" />
        </Pressable>
      </View>

      <View className="bg-black/20 px-6 pb-2">
        <View className="h-1 overflow-hidden rounded-full bg-white/20">
          <View className="h-full bg-primary/85" style={{ width: `${progressPercent}%` }} />
        </View>
        <Text className="mt-2 text-center text-sm text-white/50">
          {currentPage + 1} / {totalPages}
        </Text>
      </View>

      <View className="flex-row items-center justify-center gap-3 bg-black/20 px-6 pb-6 pt-2">
        <Pressable
          onPress={onToggleLanguage}
          className="rounded-full bg-white/10 px-4 py-2"
          accessibilityState={{ selected: language === "ko" }}
        >
          <Text className="text-sm text-white/85">{language === "ko" ? "한국어" : "ENG"}</Text>
        </Pressable>
        <Pressable
          onPress={onToggleTts}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            ttsEnabled ? "bg-primary/85" : "bg-white/10"
          }`}
          accessibilityRole="switch"
          accessibilityState={{ checked: ttsEnabled }}
        >
          <Volume2 size={16} color={ttsEnabled ? "#FFFFFFD9" : "#FFFFFF80"} />
          <Text className={`text-sm ${ttsEnabled ? "text-white/85" : "text-white/50"}`}>TTS</Text>
        </Pressable>
        <Pressable
          onPress={onToggleBgm}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            bgmEnabled ? "bg-primary/85" : "bg-white/10"
          }`}
          accessibilityRole="switch"
          accessibilityState={{ checked: bgmEnabled }}
        >
          <Music size={16} color={bgmEnabled ? "#FFFFFFD9" : "#FFFFFF80"} />
          <Text className={`text-sm ${bgmEnabled ? "text-white/85" : "text-white/50"}`}>BGM</Text>
        </Pressable>
      </View>
    </>
  );
}
