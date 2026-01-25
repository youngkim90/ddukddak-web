"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  X,
  Settings,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  Music,
  Maximize,
  Minimize,
} from "lucide-react";
import { useStoryPages } from "@/hooks/useStories";
import { useSaveProgress, useProgress } from "@/hooks/useProgress";

function ViewerContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const storyId = params.id as string;
  const initialLang = searchParams.get("lang") as "ko" | "en" || "ko";

  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">(initialLang);
  const [showSettings, setShowSettings] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // API로 페이지 데이터 조회
  const { data: pagesData, isLoading, error } = useStoryPages(storyId);
  const { data: progressData } = useProgress(storyId);
  const saveProgress = useSaveProgress(storyId);

  const pages = pagesData?.pages || [];
  const totalPages = pages.length;
  const page = pages[currentPage];

  // 스와이프 관련 refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 저장된 진행률로 초기화
  useEffect(() => {
    if (progressData && progressData.currentPage > 0 && !progressData.isCompleted) {
      setCurrentPage(Math.min(progressData.currentPage - 1, totalPages - 1));
    }
  }, [progressData, totalPages]);

  // 전체화면 상태 감지
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 페이지 변경 시 진행률 저장
  useEffect(() => {
    if (totalPages > 0) {
      saveProgress.mutate({
        currentPage: currentPage + 1,
        isCompleted: currentPage >= totalPages - 1,
      });
    }
  }, [currentPage, totalPages]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      // End of story - replace to avoid history stacking
      router.replace(`/story/${storyId}`);
    }
  }, [currentPage, totalPages, router, storyId]);

  function togglePlayPause() {
    setIsPlaying((prev) => !prev);
    // TODO: Implement actual TTS playback
  }

  function handleClose() {
    // 전체화면이면 먼저 해제
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    // replace to avoid history stacking
    router.replace(`/story/${storyId}`);
  }

  // 전체화면 토글
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // 스와이프 핸들러
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // 왼쪽으로 스와이프 → 다음 페이지
        handleNext();
      } else {
        // 오른쪽으로 스와이프 → 이전 페이지
        handlePrevious();
      }
    }
  }

  // 키보드 네비게이션
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]">
        <div className="size-12 animate-spin rounded-full border-4 border-[#FF9500] border-t-transparent" />
      </div>
    );
  }

  // 에러 상태
  if (error || !page) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A1A2E]">
        <p className="text-white">동화를 불러오지 못했습니다.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-lg bg-[#FF9500] px-4 py-2 text-sm text-white"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#1A1A2E]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handleClose}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          aria-label="닫기"
        >
          <X className="size-6 text-white" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label={isFullscreen ? "전체화면 해제" : "전체화면"}
          >
            {isFullscreen ? (
              <Minimize className="size-5 text-white" aria-hidden="true" />
            ) : (
              <Maximize className="size-5 text-white" aria-hidden="true" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="설정"
          >
            <Settings className="size-6 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex flex-1 items-center justify-center px-4">
        {page.imageUrl ? (
          <img
            src={page.imageUrl}
            alt={`페이지 ${currentPage + 1}`}
            className="aspect-[4/3] w-full max-w-lg rounded-2xl object-cover transition-all duration-300"
          />
        ) : (
          <div className="aspect-[4/3] w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#FAD9E5] to-[#D9E5FA] transition-all duration-300" />
        )}
      </div>

      {/* Text Area */}
      <div className="px-6 py-4">
        <div className="rounded-xl bg-white/10 px-5 py-4 backdrop-blur-sm">
          <p className="text-center text-lg leading-relaxed text-white">
            {language === "ko" ? page.textKo : page.textEn}
          </p>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-6 py-4">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="flex size-12 items-center justify-center rounded-full bg-white/10 disabled:opacity-30"
          aria-label="이전"
        >
          <SkipBack className="size-6 text-white" aria-hidden="true" />
        </button>
        <button
          onClick={togglePlayPause}
          className="flex size-16 items-center justify-center rounded-full bg-[#FF9500]"
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? (
            <Pause className="size-8 text-white" aria-hidden="true" />
          ) : (
            <Play className="ml-1 size-8 text-white" aria-hidden="true" />
          )}
        </button>
        <button
          onClick={handleNext}
          className="flex size-12 items-center justify-center rounded-full bg-white/10"
          aria-label="다음"
        >
          <SkipForward className="size-6 text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-2">
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-[#FF9500] transition-all"
            style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-center text-sm text-white/60">
          {currentPage + 1} / {totalPages}
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-4 px-6 pb-safe pt-2">
        <button
          onClick={() => setLanguage((prev) => (prev === "ko" ? "en" : "ko"))}
          aria-pressed={language === "ko"}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
        >
          {language === "ko" ? "한국어" : "ENG"}
        </button>
        <button
          onClick={() => setTtsEnabled((prev) => !prev)}
          aria-pressed={ttsEnabled}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
            ttsEnabled ? "bg-[#FF9500] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          <Volume2 className="size-4" aria-hidden="true" />
          TTS
        </button>
        <button
          onClick={() => setBgmEnabled((prev) => !prev)}
          aria-pressed={bgmEnabled}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${
            bgmEnabled ? "bg-[#FF9500] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          <Music className="size-4" aria-hidden="true" />
          BGM
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettings(false);
          }}
        >
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 id="settings-title" className="mb-4 text-lg font-bold text-[#333333]">설정</h3>

            <div className="space-y-4">
              {/* TTS Volume */}
              <div>
                <label htmlFor="tts-volume" className="mb-2 block text-sm text-[#666666]">
                  TTS 볼륨
                </label>
                <input
                  id="tts-volume"
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full accent-[#FF9500]"
                />
              </div>

              {/* BGM Volume */}
              <div>
                <label htmlFor="bgm-volume" className="mb-2 block text-sm text-[#666666]">
                  BGM 볼륨
                </label>
                <input
                  id="bgm-volume"
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="50"
                  className="w-full accent-[#FF9500]"
                />
              </div>

              {/* Auto Play */}
              <div className="flex items-center justify-between">
                <label htmlFor="auto-play" className="text-sm text-[#666666]">자동 넘김</label>
                <button
                  id="auto-play"
                  role="switch"
                  aria-checked={autoPlayEnabled}
                  onClick={() => setAutoPlayEnabled((prev) => !prev)}
                  className={`h-6 w-11 rounded-full p-1 transition-colors ${
                    autoPlayEnabled ? "bg-[#FF9500]" : "bg-[#D9D9D9]"
                  }`}
                  aria-label="자동 넘김 토글"
                >
                  <div
                    className={`size-4 rounded-full bg-white transition-transform ${
                      autoPlayEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full rounded-xl bg-[#FF9500] py-3 font-medium text-white hover:bg-[#E88A00] transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoryViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A2E]">
          <div className="size-12 animate-spin rounded-full border-4 border-[#FF9500] border-t-transparent" />
        </div>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
