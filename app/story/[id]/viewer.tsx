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
import { getWebTtsAudio, cleanupWebTts, safePauseWebTts, trackedPlay, isWebTtsActive, markWebTtsDone, resumeWebTts } from "@/lib/webTts";

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
  const [videoVisible, setVideoVisible] = useState(false);

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
  const ttsAbortRef = useRef(0); // 동시 호출 방지용 세대 카운터

  // Auto-advance: TTS와 비디오 중 긴 쪽 완료 후 대기
  const ttsFinishedRef = useRef(true);
  const videoFirstPlayDoneRef = useRef(true);
  const videoPlayCountRef = useRef(0);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageStartTimeRef = useRef(Date.now());

  // BGM
  const bgmRef = useRef<Audio.Sound | null>(null);

  const pages = pagesData?.pages || [];
  const totalPages = pages.length;
  const page = pages[currentPage];

  // Refs for stale closure prevention (callbacks)
  const autoPlayRef = useRef(autoPlayEnabled);
  const totalPagesRef = useRef(totalPages);
  const currentPageRef = useRef(currentPage);
  const routerRef = useRef(router);
  const idRef = useRef(id);
  const bgmEnabledRef = useRef(bgmEnabled);
  autoPlayRef.current = autoPlayEnabled;
  totalPagesRef.current = totalPages;
  currentPageRef.current = currentPage;
  routerRef.current = router;
  idRef.current = id;
  bgmEnabledRef.current = bgmEnabled;

  // 자동 넘김: TTS + 비디오 모두 완료 시 다음 페이지 (최소 3초 보장)
  const MIN_PAGE_DISPLAY_MS = 3000;

  const advancePage = useCallback(() => {
    setCurrentPage((prev) => {
      if (prev < totalPagesRef.current - 1) return prev + 1;
      // 마지막 페이지 → 2초 후 동화 상세로 이동
      setTimeout(() => {
        routerRef.current.replace(`/story/${idRef.current}`);
      }, 2000);
      return prev;
    });
  }, []);

  const tryAutoAdvance = useCallback(() => {
    if (!ttsFinishedRef.current || !videoFirstPlayDoneRef.current) return;
    if (!autoPlayRef.current) return;

    // 방어: 웹에서 TTS가 재생 중이어야 하는 상태면 넘기지 않음
    // (브라우저가 비디오 미디어 세션으로 일시 pause해도 _shouldBePlaying은 true)
    if (Platform.OS === "web" && isWebTtsActive()) return;

    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);

    // 최소 표시 시간 확인 — 충분히 경과하면 즉시 전환 (제스처 체인 유지)
    const elapsed = Date.now() - pageStartTimeRef.current;
    if (elapsed >= MIN_PAGE_DISPLAY_MS) {
      advancePage();
    } else {
      // 최소 표시 시간 미달 → 남은 시간만큼 대기
      const delay = MIN_PAGE_DISPLAY_MS - elapsed;
      autoAdvanceTimer.current = setTimeout(advancePage, delay);
    }
  }, [advancePage]);

  // Video player (호출 순서 보장 - early return 전에 선언)
  // loop = false 시작 → 첫 재생 완료 감지 후 loop 활성화
  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
    p.muted = true;
  });

  // 비디오 요청 URL 추적 (statusChange 가드용 — 페이지 상태 대신 사용)
  const pendingVideoUrl = useRef<string | null>(null);

  // 비디오 타이머 refs
  const videoFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoLoadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 비디오 타이머 정리 헬퍼
  const clearVideoTimers = useCallback(() => {
    if (videoFallbackTimer.current) {
      clearTimeout(videoFallbackTimer.current);
      videoFallbackTimer.current = null;
    }
    if (videoLoadTimer.current) {
      clearTimeout(videoLoadTimer.current);
      videoLoadTimer.current = null;
    }
  }, []);

  // 비디오: statusChange로 readyToPlay 시 play()
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("statusChange", ({ status }) => {
      if (status === "readyToPlay" && pendingVideoUrl.current) {
        player.play();
        setVideoVisible(true);
        // 비디오 미디어 세션이 TTS/BGM을 중단시킬 수 있음 → 200ms 후 명시적 복구
        if (Platform.OS === "web") {
          setTimeout(() => {
            resumeWebTts();
            if (bgmRef.current && bgmEnabledRef.current) {
              bgmRef.current.getStatusAsync().then((s) => {
                if (s.isLoaded && !s.isPlaying) {
                  bgmRef.current?.playAsync().catch(() => {});
                }
              }).catch(() => {});
            }
          }, 200);
        }
      }
      if (status === "error" && !videoFirstPlayDoneRef.current) {
        videoFirstPlayDoneRef.current = true;
        tryAutoAdvance();
      }
    });
    return () => sub.remove();
  }, [player, tryAutoAdvance]);

  // 비디오 재생 완료 감지 (최대 2회 재생)
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener("playToEnd", () => {
      // 비-비디오 페이지에서 이전 비디오의 이벤트 무시
      if (videoFirstPlayDoneRef.current) return;
      clearVideoTimers();
      videoPlayCountRef.current += 1;
      if (videoPlayCountRef.current === 1) {
        // 1회 재생 완료 → auto-advance 신호 + 2회차 재생
        videoFirstPlayDoneRef.current = true;
        tryAutoAdvance();
        player.replay();
      }
      // 2회 재생 완료 → 정지 (더 이상 반복하지 않음)
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
      videoPlayCountRef.current = 0;
      setVideoVisible(false);

      // TTS가 미디어 세션을 확보한 뒤 비디오 로드 (순서: BGM → TTS → Video)
      // TTS play()가 ~50ms면 resolve되므로 500ms면 충분
      const videoUrl = currentPageData.videoUrl;
      videoLoadTimer.current = setTimeout(() => {
        pendingVideoUrl.current = videoUrl;
        player.loop = false;
        player.muted = true;
        player.replace(videoUrl);
      }, 500);

      // 10초 폴백: playToEnd 미발생 시 자동 진행
      videoFallbackTimer.current = setTimeout(() => {
        if (!videoFirstPlayDoneRef.current) {
          videoFirstPlayDoneRef.current = true;
          tryAutoAdvance();
        }
      }, 10000);
    } else {
      videoFirstPlayDoneRef.current = true;
      setVideoVisible(false);
      pendingVideoUrl.current = null;
      player.pause(); // 비-비디오 페이지에서만 정지
    }

    return clearVideoTimers;
  }, [currentPage, pages, player, clearVideoTimers, tryAutoAdvance]);

  // BGM: 오디오 모드 설정 (iOS 무음모드에서도 재생)
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  }, []);

  // TTS: 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (Platform.OS === "web") cleanupWebTts();
      ttsRef.current?.unloadAsync().catch(() => {});
      ttsRef.current = null;
    };
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
      const webAudio = getWebTtsAudio();
      if (document.hidden) {
        bgmRef.current?.pauseAsync();
        if (webAudio) webAudio.pause();
        else ttsRef.current?.pauseAsync();
      } else {
        if (bgmEnabled) bgmRef.current?.playAsync();
        if (ttsEnabled) {
          if (webAudio) webAudio.play().catch(() => {});
          else ttsRef.current?.playAsync();
        }
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

    // 이전 TTS 정리 (웹: HTMLAudioElement 정지, 네이티브: expo-av unload)
    const webAudio = Platform.OS === "web" ? getWebTtsAudio() : null;
    if (webAudio) {
      await safePauseWebTts();
      webAudio.onended = null;
      webAudio.onerror = null;
    }
    if (ttsRef.current) {
      ttsRef.current.setOnPlaybackStatusUpdate(null);
      try { await ttsRef.current.unloadAsync(); } catch {}
      ttsRef.current = null;
    }

    // 세대 카운터 증가 (이전 호출의 콜백 무효화)
    const generation = ++ttsAbortRef.current;

    const currentPageData = pages[currentPage];
    if (!currentPageData) return;

    const audioUrl = language === "ko" ? currentPageData.audioUrlKo : currentPageData.audioUrlEn;

    if (!ttsEnabled || !audioUrl) {
      ttsFinishedRef.current = true;
      tryAutoAdvance();
      return;
    }

    ttsFinishedRef.current = false;
    // 웹: 제스처-활성화된 단일 HTMLAudioElement 재사용
    if (webAudio) {
      webAudio.src = audioUrl;
      webAudio.volume = ttsVolume / 100;
      webAudio.currentTime = 0;

      webAudio.onended = () => {
        if (ttsAbortRef.current !== generation) return;
        markWebTtsDone(); // _shouldBePlaying = false → tryAutoAdvance 허용
        setIsPlaying(false);
        ttsFinishedRef.current = true;
        tryAutoAdvance();
      };

      webAudio.onerror = () => {
        if (ttsAbortRef.current !== generation) return;
        markWebTtsDone();
        ttsFinishedRef.current = true;
        tryAutoAdvance();
      };

      try {
        await trackedPlay(webAudio);
        if (ttsAbortRef.current !== generation) {
          webAudio.pause();
          return;
        }
        setIsPlaying(true);
      } catch {
        if (ttsAbortRef.current !== generation) return;
        ttsFinishedRef.current = true;
        tryAutoAdvance();
      }
      return;
    }

    // 네이티브: expo-av Audio.Sound (매번 새 인스턴스)
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { volume: ttsVolume / 100, shouldPlay: true }
      );

      if (ttsAbortRef.current !== generation) {
        sound.unloadAsync().catch(() => {});
        return;
      }

      ttsRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (ttsAbortRef.current !== generation) return;
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(false);
          ttsFinishedRef.current = true;
          tryAutoAdvance();
        }
      });
    } catch {
      if (ttsAbortRef.current !== generation) return;
      ttsFinishedRef.current = true;
      tryAutoAdvance();
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
      ttsRef.current?.unloadAsync().catch(() => {});
      ttsRef.current = null;
    };
  }, [currentPage, language, progressRestored]);

  // TTS: ttsEnabled 토글 (초기 마운트 skip — TTS는 [currentPage, language, progressRestored] effect에서 시작)
  useEffect(() => {
    if (!ttsEnabledMounted.current) {
      ttsEnabledMounted.current = true;
      return;
    }
    const webAudio = Platform.OS === "web" ? getWebTtsAudio() : null;
    if (webAudio) {
      if (ttsEnabled) {
        if (webAudio.src && webAudio.src !== "") {
          webAudio.play().catch(() => {});
          setIsPlaying(true);
        } else {
          playTts();
        }
      } else {
        webAudio.pause();
        setIsPlaying(false);
      }
      return;
    }
    if (!ttsRef.current) {
      if (ttsEnabled) playTts();
      return;
    }
    if (ttsEnabled) {
      ttsRef.current.playAsync().catch(() => {});
      setIsPlaying(true);
    } else {
      ttsRef.current.pauseAsync().catch(() => {});
      setIsPlaying(false);
    }
  }, [ttsEnabled]);

  // TTS: 볼륨 변경
  useEffect(() => {
    const webAudio = Platform.OS === "web" ? getWebTtsAudio() : null;
    if (webAudio) {
      webAudio.volume = ttsVolume / 100;
      return;
    }
    ttsRef.current?.setVolumeAsync(ttsVolume / 100).catch(() => {});
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

  // Save progress on page change + 페이지 시작 시간 기록
  useEffect(() => {
    pageStartTimeRef.current = Date.now();

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
    const webAudio = Platform.OS === "web" ? getWebTtsAudio() : null;
    if (webAudio && webAudio.src) {
      if (!webAudio.paused) {
        await safePauseWebTts(); // _shouldBePlaying = false → 자동 resume 방지
        setIsPlaying(false);
      } else {
        await trackedPlay(webAudio); // _shouldBePlaying = true
        setIsPlaying(true);
      }
    } else if (ttsRef.current) {
      const status = await ttsRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await ttsRef.current.pauseAsync();
        setIsPlaying(false);
      } else if (status.isLoaded) {
        await ttsRef.current.playAsync();
        setIsPlaying(true);
      }
    } else {
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
