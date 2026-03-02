import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  BackHandler,
  Platform,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer } from "expo-video";
import { Audio } from "expo-av";
import { useStory, useStoryPages } from "@/hooks/useStories";
import { useProgress, useSaveProgress } from "@/hooks/useProgress";
import {
  ViewerControlBars,
  ViewerMainContent,
  ViewerSettingsModal,
  ViewerTopBar,
} from "@/components/story";
import { getWebTtsAudio, activateWebTts, cleanupWebTts, safePauseWebTts, trackedPlay, isWebTtsActive, markWebTtsDone, resumeWebTts } from "@/lib/webTts";
import { useSentenceTts } from "@/hooks/useSentenceTts";

export default function ViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ id: string; lang?: string; restart?: string }>();
  const initialLang = (searchParams.lang as "ko" | "en") || "ko";
  const isRestart = searchParams.restart === "1";

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

  // 크로스페이드 전환 — exit 레이어(이전 이미지)가 위에서 fade-out
  // enter 레이어(새 이미지)는 항상 opacity 1 → iOS flash 원천 차단
  const opacityExit = useSharedValue(1);
  const [exitingPageIndex, setExitingPageIndex] = useState<number | null>(null);
  const isAnimatingRef = useRef(false);

  const exitAnimStyle = useAnimatedStyle(() => ({
    opacity: opacityExit.value,
  }));

  const clearAnimation = useCallback(() => {
    setExitingPageIndex(null);
    isAnimatingRef.current = false;
  }, []);

  const pendingSlideDir = useRef<"next" | "prev" | null>(null);
  useLayoutEffect(() => {
    if (pendingSlideDir.current === null) return;
    pendingSlideDir.current = null;

    // 네비게이션 핸들러에서 이미 opacityExit.value = 1로 리셋됨
    // → 여기서는 바로 fade-out 시작
    opacityExit.value = withTiming(0, {
      duration: 400,
      easing: Easing.inOut(Easing.cubic),
    }, () => {
      runOnJS(clearAnimation)();
    });
  }, [currentPage]);

  const { data: storyData } = useStory(id);
  const { data: pagesData, isLoading, error } = useStoryPages(id);
  const { data: progressData, isFetched: progressFetched } = useProgress(id);
  const saveProgress = useSaveProgress(id);
  // stale closure 방지 — 언마운트 effect에서 최신 mutate 참조
  const saveProgressRef = useRef(saveProgress);
  saveProgressRef.current = saveProgress;
  // 페이지별 500ms 타이머 발화 여부 추적 — 언마운트 save 중복 방지
  const progressSavedRef = useRef(false);

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

  // 문장 단위 TTS 훅
  const sentenceTts = useSentenceTts({
    sentences: page?.sentences || [],
    language,
    enabled: ttsEnabled,
    volume: ttsVolume,
    ready: progressRestored,
    onAllComplete: () => {
      ttsFinishedRef.current = true;
      setIsPlaying(false);
      tryAutoAdvance();
    },
  });

  // 문장 모드일 때 isPlaying 동기화
  useEffect(() => {
    if (!sentenceTts.isSentenceMode) return;
    setIsPlaying(sentenceTts.state === "playing");
  }, [sentenceTts.isSentenceMode, sentenceTts.state]);

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

  // 자동 넘김: TTS + 비디오 모두 완료 시 다음 페이지 (최소 3초 보장 + 전환 전 여유)
  const MIN_PAGE_DISPLAY_MS = 3000;
  /** 페이지 전환 전 여유 시간 (ms) — TTS 끝난 후 바로 넘기지 않고 잠시 대기 */
  const PAGE_TRANSITION_DELAY_MS = 700;

  const advancePage = useCallback(() => {
    const prev = currentPageRef.current;
    if (prev < totalPagesRef.current - 1) {
      opacityExit.value = 1; // exit 레이어가 opacity 1로 마운트되도록 미리 리셋
      isAnimatingRef.current = true;
      currentPageRef.current = prev + 1; // 렌더 커밋 전 언마운트 대비 동기 업데이트
      setExitingPageIndex(prev);
      pendingSlideDir.current = "next";
      setCurrentPage(prev + 1);
    } else {
      // 마지막 페이지 → 2초 후 동화 상세로 이동
      setTimeout(() => {
        routerRef.current.replace(`/story/${idRef.current}`);
      }, 2000);
    }
  }, []);

  const tryAutoAdvance = useCallback(() => {
    if (!ttsFinishedRef.current || !videoFirstPlayDoneRef.current) return;
    if (!autoPlayRef.current) return;

    // 방어: 웹에서 TTS가 재생 중이어야 하는 상태면 넘기지 않음
    // (브라우저가 비디오 미디어 세션으로 일시 pause해도 _shouldBePlaying은 true)
    if (Platform.OS === "web" && isWebTtsActive()) return;

    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);

    // 최소 표시 시간 확인
    const elapsed = Date.now() - pageStartTimeRef.current;
    const remaining = Math.max(0, MIN_PAGE_DISPLAY_MS - elapsed);
    // 최소 표시 시간 + 전환 여유 시간
    const delay = remaining + PAGE_TRANSITION_DELAY_MS;
    autoAdvanceTimer.current = setTimeout(advancePage, delay);
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
  // progressRestored=true 이후에만 실행 → 진행률 복원 전 player.pause() 방지
  useEffect(() => {
    if (!progressRestored) return;
    const currentPageData = pages[currentPage];
    if (!currentPageData || !player) return;

    clearVideoTimers();

    if (currentPageData.mediaType === "video" && currentPageData.videoUrl) {
      videoFirstPlayDoneRef.current = false;
      videoPlayCountRef.current = 0;
      setVideoVisible(false);

      // TTS가 미디어 세션을 확보한 뒤 비디오 로드 (순서: BGM → TTS → Video)
      // TTS play()가 ~50ms면 resolve되므로 150ms면 충분
      const videoUrl = currentPageData.videoUrl;
      videoLoadTimer.current = setTimeout(() => {
        pendingVideoUrl.current = videoUrl;
        player.loop = false;
        player.muted = true;
        player.replace(videoUrl);
      }, 150);

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
  }, [currentPage, pages, player, progressRestored, clearVideoTimers, tryAutoAdvance]);

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

  // TTS: 페이지/언어 변경 시 오디오 재생 (레거시 — 문장 모드가 아닐 때만)
  const playTts = useCallback(async () => {
    // 문장 모드면 useSentenceTts 훅이 관리 → 여기서는 skip
    const currentPageData = pages[currentPage];
    if (currentPageData?.sentences?.length > 0 &&
        currentPageData.sentences.some((s) => language === "ko" ? s.audioUrlKo : s.audioUrlEn)) {
      if (!ttsEnabled) {
        // TTS 비활성 시 즉시 완료 처리 → 비디오 auto-advance 차단 방지
        ttsFinishedRef.current = true;
        tryAutoAdvance();
      } else {
        // 문장 모드: ttsFinishedRef는 훅의 onAllComplete에서 설정
        ttsFinishedRef.current = false;
      }
      return;
    }

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

  // TTS: ttsEnabled 토글 (초기 마운트 skip — 문장 모드는 훅이 enabled 변경 감지)
  useEffect(() => {
    if (!ttsEnabledMounted.current) {
      ttsEnabledMounted.current = true;
      return;
    }
    // 문장 모드면 useSentenceTts 훅이 enabled prop으로 자동 처리
    if (sentenceTts.isSentenceMode) return;

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

  // TTS: 볼륨 변경 (문장 모드는 훅이 자체 관리)
  useEffect(() => {
    if (sentenceTts.isSentenceMode) return;
    const webAudio = Platform.OS === "web" ? getWebTtsAudio() : null;
    if (webAudio) {
      webAudio.volume = ttsVolume / 100;
      return;
    }
    ttsRef.current?.setVolumeAsync(ttsVolume / 100).catch(() => {});
  }, [ttsVolume, sentenceTts.isSentenceMode]);

  // Restore progress (초기 1회만 → 완료 후 progressRestored=true로 TTS 시작)
  // restart=1 파라미터가 있으면 진행률 복원 건너뜀 → 항상 1페이지부터 시작
  useEffect(() => {
    if (progressRestored) return;
    if (progressFetched && pages.length > 0) {
      if (!isRestart && progressData && progressData.currentPage > 0 && !progressData.isCompleted) {
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
    progressSavedRef.current = false; // 새 페이지 진입 시 리셋

    if (totalPages === 0) return;

    const timer = setTimeout(() => {
      progressSavedRef.current = true; // 타이머 발화 마킹
      saveProgress.mutate({
        currentPage: currentPage + 1,
        isCompleted: currentPage + 1 >= totalPages,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentPage, totalPages]);

  // 언마운트 시 즉시 진행률 저장
  // 3000ms 타이머가 아직 발화하지 않은 경우에만 실행 (타이머 발화 후엔 skip)
  // isCompleted는 항상 false — 사용자가 강제 종료한 경우 미완료로 처리
  // (자연 완료는 3000ms 타이머가 isCompleted: true로 저장)
  useEffect(() => {
    return () => {
      if (totalPagesRef.current > 0 && !progressSavedRef.current) {
        saveProgressRef.current.mutate({
          currentPage: currentPageRef.current + 1,
          isCompleted: false,
        });
      }
    };
  }, []);

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
    const hasSentenceAudio = currentPageData.sentences?.length > 0 &&
      currentPageData.sentences.some((s) => language === "ko" ? s.audioUrlKo : s.audioUrlEn);

    // TTS 오디오(문장/페이지) 또는 비디오가 있으면 완료 콜백에서 처리
    if ((ttsEnabled && (audioUrl || hasSentenceAudio)) || hasVideo) return;

    const timer = setTimeout(() => {
      setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    }, 5000);

    return () => clearTimeout(timer);
  }, [autoPlayEnabled, currentPage, totalPages, pages, language, ttsEnabled]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 0 && !isAnimatingRef.current) {
      opacityExit.value = 1;
      isAnimatingRef.current = true;
      currentPageRef.current = currentPage - 1; // 동기 업데이트
      setExitingPageIndex(currentPage);
      pendingSlideDir.current = "prev";
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage, opacityExit]);

  const handleNext = useCallback(() => {
    if (isAnimatingRef.current) return;
    if (currentPage < totalPages - 1) {
      opacityExit.value = 1;
      isAnimatingRef.current = true;
      currentPageRef.current = currentPage + 1; // 동기 업데이트
      setExitingPageIndex(currentPage);
      pendingSlideDir.current = "next";
      setCurrentPage((prev) => prev + 1);
    } else {
      // End of story
      router.replace(`/story/${id}`);
    }
  }, [currentPage, totalPages, router, id]);

  const togglePlayPause = useCallback(async () => {
    // 문장 모드: 훅의 pause/resume 사용
    if (sentenceTts.isSentenceMode) {
      if (sentenceTts.state === "playing") {
        await sentenceTts.pause();
      } else if (sentenceTts.state === "paused") {
        await sentenceTts.resume();
      } else {
        // idle / page_complete → 유저 제스처 내에서 즉시 재시작
        // await 없이 호출해야 iOS 제스처 컨텍스트 유지됨
        if (Platform.OS === "web") activateWebTts();
        sentenceTts.restart(); // no await
      }
      return;
    }

    // 레거시 모드
    const webAudio = Platform.OS === "web" ? getWebTtsAudio() : null;
    if (webAudio && webAudio.src) {
      if (!webAudio.paused) {
        await safePauseWebTts();
        setIsPlaying(false);
      } else {
        await trackedPlay(webAudio);
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
  }, [sentenceTts]);

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
  const exitingPage = exitingPageIndex !== null ? pages[exitingPageIndex] : null;

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
      <ViewerTopBar onClose={handleClose} onOpenSettings={() => setShowSettings(true)} />

      <View style={styles.pageContainer}>
        {/* Enter layer (아래) — 새 이미지, 항상 opacity 1 */}
        <View style={{ flex: 1 }}>
          <ViewerMainContent
            page={page}
            language={language}
            videoVisible={videoVisible}
            player={player}
            sentenceMode={sentenceTts.isSentenceMode}
            currentSentenceIndex={sentenceTts.currentIndex}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        </View>
        {/* Exit layer (위) — 이전 이미지가 fade-out 후 제거 */}
        {exitingPage && (
          <View style={StyleSheet.absoluteFill}>
            <ViewerMainContent
              page={exitingPage}
              language={language}
              videoVisible={false}
              player={player}
              sentenceMode={false}
              currentSentenceIndex={-1}
              imageStyle={exitAnimStyle}
              hideSubtitle
              onTouchStart={() => {}}
              onTouchEnd={() => {}}
            />
          </View>
        )}
      </View>

      <ViewerControlBars
        currentPage={currentPage}
        totalPages={totalPages}
        progressPercent={progressPercent}
        isPlaying={isPlaying}
        language={language}
        ttsEnabled={ttsEnabled}
        bgmEnabled={bgmEnabled}
        onPrevious={handlePrevious}
        onPlayPause={togglePlayPause}
        onNext={handleNext}
        onToggleLanguage={() => setLanguage((prev) => (prev === "ko" ? "en" : "ko"))}
        onToggleTts={() => setTtsEnabled((prev) => !prev)}
        onToggleBgm={() => setBgmEnabled((prev) => !prev)}
      />

      <ViewerSettingsModal
        visible={showSettings}
        ttsVolume={ttsVolume}
        bgmVolume={bgmVolume}
        autoPlayEnabled={autoPlayEnabled}
        onClose={() => setShowSettings(false)}
        onTtsVolumeChange={setTtsVolume}
        onBgmVolumeChange={setBgmVolume}
        onToggleAutoPlay={() => setAutoPlayEnabled((prev) => !prev)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    overflow: "hidden",
  },
});
