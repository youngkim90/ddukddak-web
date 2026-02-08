import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  useWindowDimensions,
  BackHandler,
  Platform,
  GestureResponderEvent,
} from "react-native";
import { VolumeSlider } from "@/components/ui/VolumeSlider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import {
  X,
  Settings,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  Music,
} from "lucide-react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Audio } from "expo-av";
import { useStory, useStoryPages } from "@/hooks/useStories";
import { useProgress, useSaveProgress } from "@/hooks/useProgress";
import { getOptimizedImageUrl } from "@/lib/utils";
import { calculateContainerSize } from "@/lib/layout";

export default function ViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Calculate actual container size for web
  const containerSize = Platform.OS === "web"
    ? calculateContainerSize(windowWidth, windowHeight)
    : { width: windowWidth, height: windowHeight };

  const searchParams = useLocalSearchParams<{ id: string; lang?: string }>();
  const initialLang = (searchParams.lang as "ko" | "en") || "ko";

  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">(initialLang);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [ttsVolume, setTtsVolume] = useState(80);
  const [bgmVolume, setBgmVolume] = useState(50);

  // Swipe refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const { data: storyData } = useStory(id);
  const { data: pagesData, isLoading, error } = useStoryPages(id);
  const { data: progressData } = useProgress(id);
  const saveProgress = useSaveProgress(id);

  // BGM
  const bgmRef = useRef<Audio.Sound | null>(null);

  const pages = pagesData?.pages || [];
  const totalPages = pages.length;
  const page = pages[currentPage];

  // Video player (호출 순서 보장 - early return 전에 선언)
  const player = useVideoPlayer(null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  // 페이지 변경 시 비디오 소스 교체
  useEffect(() => {
    const currentPageData = pages[currentPage];
    if (!currentPageData || !player) return;

    if (currentPageData.mediaType === "video" && currentPageData.videoUrl) {
      player.replace(currentPageData.videoUrl);
      player.play();
    } else {
      player.pause();
    }
  }, [currentPage, pages, player]);

  // BGM: 오디오 모드 설정 (iOS 무음모드에서도 재생)
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  }, []);

  // BGM: 로드 및 재생 (동화별 1곡, 무한 루프)
  // 볼륨: 슬라이더 0~100 → 실제 출력 0~20% (TTS 대비 10~20%)
  const MAX_BGM_VOLUME = 0.2;

  useEffect(() => {
    const bgmUrl = storyData?.bgmUrl;
    if (!bgmUrl) return;

    let sound: Audio.Sound | null = null;

    const loadBgm = async () => {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: bgmUrl },
        { isLooping: true, volume: (bgmVolume / 100) * MAX_BGM_VOLUME, shouldPlay: bgmEnabled }
      );
      sound = newSound;
      bgmRef.current = newSound;
    };

    loadBgm();

    return () => {
      sound?.unloadAsync();
      bgmRef.current = null;
    };
  }, [storyData?.bgmUrl]);

  // BGM: 볼륨 변경
  useEffect(() => {
    bgmRef.current?.setVolumeAsync((bgmVolume / 100) * MAX_BGM_VOLUME);
  }, [bgmVolume]);

  // BGM: 토글 on/off
  useEffect(() => {
    if (!bgmRef.current) return;
    if (bgmEnabled) {
      bgmRef.current.playAsync();
    } else {
      bgmRef.current.pauseAsync();
    }
  }, [bgmEnabled]);

  // Restore progress
  useEffect(() => {
    if (progressData && progressData.currentPage > 0 && !progressData.isCompleted && pages.length > 0) {
      const savedPage = Math.min(progressData.currentPage - 1, pages.length - 1);
      setCurrentPage(savedPage);
    }
  }, [progressData, pages.length]);

  // Save progress on page change
  useEffect(() => {
    if (totalPages === 0) return;

    const timer = setTimeout(() => {
      saveProgress.mutate({
        currentPage: currentPage + 1,
        isCompleted: currentPage + 1 >= totalPages,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, totalPages]);

  // Android back handler
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace(`/story/${id}`);
      return true;
    });
    return () => handler.remove();
  }, [router, id]);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlayEnabled || !isPlaying || currentPage >= totalPages - 1) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [autoPlayEnabled, isPlaying, currentPage, totalPages]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      // End of story
      router.replace(`/story/${id}`);
    }
  }, [currentPage, totalPages, router, id]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    // TODO: Implement actual TTS playback
  }, []);

  const handleClose = useCallback(() => {
    router.replace(`/story/${id}`);
  }, [router, id]);

  // Swipe handlers
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    touchEndX.current = e.nativeEvent.pageX;
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swipe left → Next page
        handleNext();
      } else {
        // Swipe right → Previous page
        handlePrevious();
      }
    }
  };

  const progressPercent = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1A1A2E]">
        <StatusBar hidden />
        <View className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </View>
    );
  }

  if (error || !page) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1A1A2E]">
        <StatusBar hidden />
        <Text className="text-white">동화를 불러오지 못했습니다.</Text>
        <Pressable
          onPress={() => router.replace(`/story/${id}`)}
          className="mt-4 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1A1A2E]">
      <StatusBar hidden />

      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 pt-14">
        <Pressable
          onPress={handleClose}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          accessibilityLabel="닫기"
        >
          <X size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={() => setShowSettings(true)}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          accessibilityLabel="설정"
        >
          <Settings size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Main Content with Swipe */}
      <View
        className="flex-1 justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media Area (이미지 + 비디오 오버레이) */}
        <View className="items-center px-4">
          {page.imageUrl ? (
            <View className="w-full max-w-lg aspect-[3/2] rounded-2xl overflow-hidden">
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
                  }}
                  contentFit="cover"
                  nativeControls={false}
                />
              )}
            </View>
          ) : (
            <View className="w-full max-w-lg aspect-[3/2] rounded-2xl bg-[#2A2A3E]" />
          )}
        </View>

        {/* Text Area */}
        <View className="px-6 pt-4">
          <View className="rounded-xl bg-white/10 px-5 py-5">
            <Text
              className="text-center leading-10 text-white"
              style={{ fontFamily: "GowunDodum", fontSize: 23, fontWeight: "bold" }}
            >
              {language === "ko" ? page.textKo : page.textEn}
            </Text>
          </View>
        </View>
      </View>

      {/* Playback Controls */}
      <View className="flex-row items-center justify-center gap-6 py-4">
        <Pressable
          onPress={handlePrevious}
          disabled={currentPage === 0}
          className={`h-12 w-12 items-center justify-center rounded-full bg-white/10 ${
            currentPage === 0 ? "opacity-30" : ""
          }`}
          accessibilityLabel="이전"
        >
          <SkipBack size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={togglePlayPause}
          className="h-16 w-16 items-center justify-center rounded-full bg-primary"
          accessibilityLabel={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? (
            <Pause size={32} color="#FFFFFF" />
          ) : (
            <Play size={32} color="#FFFFFF" style={{ marginLeft: 4 }} />
          )}
        </Pressable>
        <Pressable
          onPress={handleNext}
          className="h-12 w-12 items-center justify-center rounded-full bg-white/10"
          accessibilityLabel="다음"
        >
          <SkipForward size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="px-6 pb-2">
        <View className="h-1 overflow-hidden rounded-full bg-white/20">
          <View
            className="h-full bg-primary"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
        <Text className="mt-2 text-center text-sm text-white/60">
          {currentPage + 1} / {totalPages}
        </Text>
      </View>

      {/* Bottom Controls */}
      <View className="flex-row items-center justify-center gap-3 px-6 pb-10 pt-2">
        <Pressable
          onPress={() => setLanguage((prev) => (prev === "ko" ? "en" : "ko"))}
          className="rounded-full bg-white/10 px-4 py-2"
          accessibilityState={{ selected: language === "ko" }}
        >
          <Text className="text-sm text-white">
            {language === "ko" ? "한국어" : "ENG"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTtsEnabled((prev) => !prev)}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            ttsEnabled ? "bg-primary" : "bg-white/10"
          }`}
          accessibilityRole="switch"
          accessibilityState={{ checked: ttsEnabled }}
        >
          <Volume2 size={16} color={ttsEnabled ? "#FFFFFF" : "#FFFFFF99"} />
          <Text className={`text-sm ${ttsEnabled ? "text-white" : "text-white/60"}`}>
            TTS
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setBgmEnabled((prev) => !prev)}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            bgmEnabled ? "bg-primary" : "bg-white/10"
          }`}
          accessibilityRole="switch"
          accessibilityState={{ checked: bgmEnabled }}
        >
          <Music size={16} color={bgmEnabled ? "#FFFFFF" : "#FFFFFF99"} />
          <Text className={`text-sm ${bgmEnabled ? "text-white" : "text-white/60"}`}>
            BGM
          </Text>
        </Pressable>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50"
          onPress={() => setShowSettings(false)}
        >
          <Pressable
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="mb-4 text-lg font-bold text-text-main">설정</Text>

            {/* TTS Volume */}
            <View className="mb-4">
              <Text className="mb-2 text-sm text-text-sub">TTS 볼륨</Text>
              <VolumeSlider
                value={ttsVolume}
                onValueChange={setTtsVolume}
                minimumValue={0}
                maximumValue={100}
              />
            </View>

            {/* BGM Volume */}
            <View className="mb-4">
              <Text className="mb-2 text-sm text-text-sub">BGM 볼륨</Text>
              <VolumeSlider
                value={bgmVolume}
                onValueChange={setBgmVolume}
                minimumValue={0}
                maximumValue={100}
              />
            </View>

            {/* Auto Play Toggle */}
            <View className="flex-row items-center justify-between py-3 border-b border-[#F0F0F0]">
              <Text className="text-sm text-text-sub">자동 넘김</Text>
              <Pressable
                onPress={() => setAutoPlayEnabled((prev) => !prev)}
                className={`h-6 w-11 rounded-full p-0.5 ${
                  autoPlayEnabled ? "bg-primary" : "bg-[#D9D9D9]"
                }`}
                accessibilityRole="switch"
                accessibilityState={{ checked: autoPlayEnabled }}
                accessibilityLabel="자동 넘김 토글"
              >
                <View
                  className="h-5 w-5 rounded-full bg-white"
                  style={{
                    alignSelf: autoPlayEnabled ? "flex-end" : "flex-start",
                  }}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowSettings(false)}
              className="mt-6 items-center rounded-xl bg-primary py-3"
            >
              <Text className="font-bold text-white">닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
