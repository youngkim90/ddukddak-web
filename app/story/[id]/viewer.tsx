import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
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

export default function ViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ id: string; lang?: string }>();
  const initialLang = (searchParams.lang as "ko" | "en") || "ko";

  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">(initialLang);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [ttsVolume, setTtsVolume] = useState(60);
  const [bgmVolume, setBgmVolume] = useState(30);

  // TTS enabled 토글 마운트 추적 (초기 마운트 skip용)
  const ttsEnabledMounted = useRef(false);

  // 진행률 초기 복원 완료 추적 (state로 관리 → TTS effect 트리거)
  const [progressRestored, setProgressRestored] = useState(false);

  // Swipe refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const { data: storyData } = useStory(id);
  const { data: pagesData, isLoading, error } = useStoryPages(id);
  const { data: progressData, isFetched: progressFetched } = useProgress(id);
  const saveProgress = useSaveProgress(id);

  // TTS
  const ttsRef = useRef<Audio.Sound | null>(null);
  const ttsLoadingRef = useRef(false);

  // Auto-advance: TTS와 비디오 중 긴 쪽 완료 후 1초 대기
  const ttsFinishedRef = useRef(true);
  const videoFirstPlayDoneRef = useRef(true);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // BGM
  const bgmRef = useRef<Audio.Sound | null>(null);

  const pages = pagesData?.pages || [];
  const totalPages = pages.length;
  const page = pages[currentPage];

  // Refs for stale closure prevention (callbacks)
  const autoPlayRef = useRef(autoPlayEnabled);
  const totalPagesRef = useRef(totalPages);
  const routerRef = useRef(router);
  const idRef = useRef(id);
  autoPlayRef.current = autoPlayEnabled;
  totalPagesRef.current = totalPages;
  routerRef.current = router;
  idRef.current = id;

  // 자동 넘김: TTS + 비디오 모두 완료 시 1초 뒤 다음 페이지 / 마지막 페이지면 3초 후 이전 화면
  const tryAutoAdvance = useCallback(() => {
    if (!ttsFinishedRef.current || !videoFirstPlayDoneRef.current) return;
    if (!autoPlayRef.current) return;

    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      setCurrentPage((prev) => {
        if (prev < totalPagesRef.current - 1) return prev + 1;
        // 마지막 페이지 → 3초 후 동화 상세로 이동
        setTimeout(() => {
          routerRef.current.replace(`/story/${idRef.current}`);
        }, 2000); // 이미 1초 대기 후이므로 추가 2초 (총 3초)
        return prev;
      });
    }, 1000);
  }, []);

  // Video player (호출 순서 보장 - early return 전에 선언)
  // loop = false 시작 → 첫 재생 완료 감지 후 loop 활성화
  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
    p.muted = true;
  });

  // 비디오 폴백 타이머 ref
  const videoFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 비디오 타이머 정리 헬퍼
  const clearVideoTimers = useCallback(() => {
    if (videoFallbackTimer.current) {
      clearTimeout(videoFallbackTimer.current);
      videoFallbackTimer.current = null;
    }
  }, []);

  // 비디오: statusChange로 readyToPlay 시 play()
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay") {
        clearVideoTimers();
        player.play();
      }
      if (status === "error" && !videoFirstPlayDoneRef.current) {
        // 비디오 로드 실패 시에만 auto-advance (이미 완료된 상태면 무시)
        videoFirstPlayDoneRef.current = true;
        tryAutoAdvance();
      }
    });
    return () => sub.remove();
  }, [player, tryAutoAdvance, clearVideoTimers]);

  // 비디오 첫 재생 완료 감지
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener("playToEnd", () => {
      clearVideoTimers();
      videoFirstPlayDoneRef.current = true;
      // 첫 재생 완료 후 루프 활성화 (비주얼 반복)
      player.loop = true;
      player.play();
      tryAutoAdvance();
    });
    return () => subscription.remove();
  }, [player, tryAutoAdvance, clearVideoTimers]);

  // 페이지 변경 시 비디오 소스 교체 + 완료 상태 초기화
  useEffect(() => {
    const currentPageData = pages[currentPage];
    if (!currentPageData || !player) return;

    clearVideoTimers();

    if (currentPageData.mediaType === "video" && currentPageData.videoUrl) {
      videoFirstPlayDoneRef.current = false;
      player.loop = false;
      player.replace(currentPageData.videoUrl);
      // play()는 statusChange 리스너에서 readyToPlay 시 호출 (replace 직후 호출하면 충돌)

      // 10초 폴백: playToEnd 미발생 시 자동 진행
      videoFallbackTimer.current = setTimeout(() => {
        if (!videoFirstPlayDoneRef.current) {
          videoFirstPlayDoneRef.current = true;
          player.loop = true;
          tryAutoAdvance();
        }
      }, 10000);
    } else {
      videoFirstPlayDoneRef.current = true;
      player.pause();
    }

    return clearVideoTimers;
  }, [currentPage, pages, player, clearVideoTimers]);

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

  // 웹: 브라우저 탭 비활성 시 BGM/TTS 일시정지, 복귀 시 재개
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        bgmRef.current?.pauseAsync();
        ttsRef.current?.pauseAsync();
      } else {
        if (bgmEnabled) bgmRef.current?.playAsync();
        if (ttsEnabled) ttsRef.current?.playAsync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [bgmEnabled, ttsEnabled]);

  // TTS: 페이지/언어 변경 시 오디오 재생
  const playTts = useCallback(async () => {
    // 자동 넘김 타이머 정리
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }

    // 이전 TTS 정리
    if (ttsRef.current) {
      await ttsRef.current.unloadAsync();
      ttsRef.current = null;
    }

    const currentPageData = pages[currentPage];
    if (!currentPageData) return;

    const audioUrl = language === "ko" ? currentPageData.audioUrlKo : currentPageData.audioUrlEn;

    if (!ttsEnabled || ttsLoadingRef.current || !audioUrl) {
      // TTS 재생 안 함 → 즉시 완료 처리
      ttsFinishedRef.current = true;
      tryAutoAdvance();
      return;
    }

    ttsFinishedRef.current = false;
    ttsLoadingRef.current = true;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { volume: ttsVolume / 100, shouldPlay: true }
      );
      ttsRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(false);
          ttsFinishedRef.current = true;
          tryAutoAdvance();
        }
      });
    } catch {
      ttsFinishedRef.current = true;
      tryAutoAdvance();
    } finally {
      ttsLoadingRef.current = false;
    }
  }, [pages, currentPage, language, ttsEnabled, ttsVolume, tryAutoAdvance]);

  // 진행률 복원 완료 후 TTS 시작 (progressRestored가 true가 된 후에만)
  useEffect(() => {
    if (!progressRestored) return;
    playTts();
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
      ttsRef.current?.unloadAsync();
      ttsRef.current = null;
    };
  }, [currentPage, language, progressRestored]);

  // TTS: ttsEnabled 토글 (초기 마운트 skip — TTS는 [currentPage, language, progressFetched] effect에서 시작)
  useEffect(() => {
    if (!ttsEnabledMounted.current) {
      ttsEnabledMounted.current = true;
      return;
    }
    if (!ttsRef.current) {
      if (ttsEnabled) playTts();
      return;
    }
    if (ttsEnabled) {
      ttsRef.current.playAsync();
      setIsPlaying(true);
    } else {
      ttsRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }, [ttsEnabled]);

  // TTS: 볼륨 변경
  useEffect(() => {
    ttsRef.current?.setVolumeAsync(ttsVolume / 100);
  }, [ttsVolume]);

  // Restore progress (초기 1회만 → 완료 후 progressRestored=true로 TTS 시작)
  useEffect(() => {
    if (progressRestored) return;
    if (progressFetched && pages.length > 0) {
      if (progressData && progressData.currentPage > 0 && !progressData.isCompleted) {
        const savedPage = Math.min(progressData.currentPage - 1, pages.length - 1);
        setCurrentPage(savedPage);
      }
      // 복원 여부와 관계없이 "확인 완료" 표시 → 다음 렌더에서 TTS 시작
      setProgressRestored(true);
    }
  }, [progressFetched, progressData, pages.length, progressRestored]);

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

  // Auto-play timer (TTS/비디오 모두 없을 때만 폴백으로 5초 타이머)
  useEffect(() => {
    if (!autoPlayEnabled || currentPage >= totalPages - 1) return;

    const currentPageData = pages[currentPage];
    if (!currentPageData) return;

    const audioUrl = language === "ko" ? currentPageData.audioUrlKo : currentPageData.audioUrlEn;
    const hasVideo = currentPageData.mediaType === "video" && currentPageData.videoUrl;

    // TTS 오디오 또는 비디오가 있으면 완료 콜백에서 처리
    if ((ttsEnabled && audioUrl) || hasVideo) return;

    const timer = setTimeout(() => {
      setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    }, 5000);

    return () => clearTimeout(timer);
  }, [autoPlayEnabled, currentPage, totalPages, pages, language, ttsEnabled]);

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

  const togglePlayPause = useCallback(async () => {
    if (ttsRef.current) {
      const status = await ttsRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await ttsRef.current.pauseAsync();
        setIsPlaying(false);
      } else if (status.isLoaded) {
        await ttsRef.current.playAsync();
        setIsPlaying(true);
      }
    } else {
      // TTS 오디오가 없으면 자동 넘김 타이머용 토글
      setIsPlaying((prev) => !prev);
    }
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
      <View className="flex-row items-center justify-between bg-black/20 px-4 py-2 pt-4">
        <Pressable
          onPress={handleClose}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          accessibilityLabel="닫기"
        >
          <X size={24} color="#FFFFFFD9" />
        </Pressable>
        <Pressable
          onPress={() => setShowSettings(true)}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          accessibilityLabel="설정"
        >
          <Settings size={24} color="#FFFFFFD9" />
        </Pressable>
      </View>

      {/* Main Content with Swipe */}
      <View
        className="flex-1 justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Media Area */}
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
                  }}
                  contentFit="cover"
                  nativeControls={false}
                />
              )}
            </View>
          ) : (
            <View className="w-full aspect-[3/2] rounded-xl bg-[#2A2A3E]" />
          )}
        </View>

        {/* Text Area — 고정 높이, 미디어 위치 불변 */}
        <View className="px-6 pt-3" style={{ height: 160 }}>
          <ScrollView
            className="flex-1 rounded-xl bg-white/10 px-5 py-4"
            showsVerticalScrollIndicator={false}
          >
            <Text
              className="text-center leading-8 text-white"
              style={{ fontFamily: "GowunDodum", fontSize: 20, fontWeight: "bold" }}
            >
              {language === "ko" ? page.textKo : page.textEn}
            </Text>
          </ScrollView>
        </View>
      </View>

      {/* Playback Controls */}
      <View className="flex-row items-center justify-center gap-6 bg-black/20 py-4">
        <Pressable
          onPress={handlePrevious}
          disabled={currentPage === 0}
          className={`h-12 w-12 items-center justify-center rounded-full bg-white/10 ${
            currentPage === 0 ? "opacity-30" : ""
          }`}
          accessibilityLabel="이전"
        >
          <SkipBack size={24} color="#FFFFFFD9" />
        </Pressable>
        <Pressable
          onPress={togglePlayPause}
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
          onPress={handleNext}
          className="h-12 w-12 items-center justify-center rounded-full bg-white/10"
          accessibilityLabel="다음"
        >
          <SkipForward size={24} color="#FFFFFFD9" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="bg-black/20 px-6 pb-2">
        <View className="h-1 overflow-hidden rounded-full bg-white/20">
          <View
            className="h-full bg-primary/85"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
        <Text className="mt-2 text-center text-sm text-white/50">
          {currentPage + 1} / {totalPages}
        </Text>
      </View>

      {/* Bottom Controls */}
      <View className="flex-row items-center justify-center gap-3 bg-black/20 px-6 pb-6 pt-2">
        <Pressable
          onPress={() => setLanguage((prev) => (prev === "ko" ? "en" : "ko"))}
          className="rounded-full bg-white/10 px-4 py-2"
          accessibilityState={{ selected: language === "ko" }}
        >
          <Text className="text-sm text-white/85">
            {language === "ko" ? "한국어" : "ENG"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTtsEnabled((prev) => !prev)}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            ttsEnabled ? "bg-primary/85" : "bg-white/10"
          }`}
          accessibilityRole="switch"
          accessibilityState={{ checked: ttsEnabled }}
        >
          <Volume2 size={16} color={ttsEnabled ? "#FFFFFFD9" : "#FFFFFF80"} />
          <Text className={`text-sm ${ttsEnabled ? "text-white/85" : "text-white/50"}`}>
            TTS
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setBgmEnabled((prev) => !prev)}
          className={`flex-row items-center gap-2 rounded-full px-4 py-2 ${
            bgmEnabled ? "bg-primary/85" : "bg-white/10"
          }`}
          accessibilityRole="switch"
          accessibilityState={{ checked: bgmEnabled }}
        >
          <Music size={16} color={bgmEnabled ? "#FFFFFFD9" : "#FFFFFF80"} />
          <Text className={`text-sm ${bgmEnabled ? "text-white/85" : "text-white/50"}`}>
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
