"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HomeHeader, TabBar } from "@/components/layout";
import { StoryCard } from "@/components/ui";
import { useStoriesByCategory } from "@/hooks/useStories";
import { useIsSubscribed } from "@/stores/authStore";
import { CATEGORY_LABELS } from "@/lib/constants";

// Mock data for banners (배너 API가 없으므로 Mock 유지)
const mockBanners = [
  {
    id: 1,
    title: "이번 주 추천 동화",
    subtitle: "양치 요정 뽀드득",
    bgColor: "#5AC8FA",
    storyId: "1",
  },
  {
    id: 2,
    title: "새로 나왔어요!",
    subtitle: "용감한 토끼 또롱이",
    bgColor: "#FF9500",
    storyId: "2",
  },
  {
    id: 3,
    title: "인기 동화",
    subtitle: "작은 별의 여행",
    bgColor: "#AF52DE",
    storyId: "3",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribed = useIsSubscribed();

  // API로 카테고리별 동화 목록 조회
  const { data: lessonData, isLoading: lessonLoading } = useStoriesByCategory("lesson", 5);
  const { data: adventureData, isLoading: adventureLoading } = useStoriesByCategory("adventure", 5);
  const { data: familyData, isLoading: familyLoading } = useStoriesByCategory("family", 5);

  // 캐러셀 자동 슬라이드
  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % mockBanners.length);
    }, 4000);

    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, []);

  function handleBannerPrev() {
    setCurrentBanner((prev) => (prev - 1 + mockBanners.length) % mockBanners.length);
  }

  function handleBannerNext() {
    setCurrentBanner((prev) => (prev + 1) % mockBanners.length);
  }

  const banner = mockBanners[currentBanner];

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <HomeHeader />

      <main className="flex-1 space-y-6 py-4">
        {/* Carousel Banner */}
        <section className="px-4">
          <div className="relative overflow-hidden rounded-2xl">
            <button
              onClick={() => router.push(`/story/${banner.storyId}`)}
              className="flex w-full flex-col justify-center px-6 py-8 text-left transition-colors"
              style={{ backgroundColor: banner.bgColor }}
            >
              <span className="text-sm font-medium text-white/80">{banner.title}</span>
              <span className="mt-1 text-xl font-bold text-white">{banner.subtitle}</span>
            </button>

            {/* 캐러셀 컨트롤 */}
            <button
              onClick={handleBannerPrev}
              className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="이전 배너"
            >
              <ChevronLeft className="size-5 text-white" aria-hidden="true" />
            </button>
            <button
              onClick={handleBannerNext}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label="다음 배너"
            >
              <ChevronRight className="size-5 text-white" aria-hidden="true" />
            </button>

            {/* 페이지 인디케이터 */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {mockBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`size-2 rounded-full transition-all ${
                    index === currentBanner ? "w-4 bg-white" : "bg-white/50"
                  }`}
                  aria-label={`배너 ${index + 1}로 이동`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 교훈 동화 - 가로 스크롤 */}
        <StorySection
          title={`📚 ${CATEGORY_LABELS.lesson} 동화`}
          stories={lessonData?.stories || []}
          isLoading={lessonLoading}
          isSubscribed={isSubscribed}
          onStoryClick={(id) => router.push(`/story/${id}`)}
          onMoreClick={() => router.push("/stories?category=lesson")}
        />

        {/* 모험 동화 - 가로 스크롤 */}
        <StorySection
          title={`🚀 ${CATEGORY_LABELS.adventure} 동화`}
          stories={adventureData?.stories || []}
          isLoading={adventureLoading}
          isSubscribed={isSubscribed}
          onStoryClick={(id) => router.push(`/story/${id}`)}
          onMoreClick={() => router.push("/stories?category=adventure")}
        />

        {/* 가족 동화 - 가로 스크롤 */}
        <StorySection
          title={`🏠 ${CATEGORY_LABELS.family} 동화`}
          stories={familyData?.stories || []}
          isLoading={familyLoading}
          isSubscribed={isSubscribed}
          onStoryClick={(id) => router.push(`/story/${id}`)}
          onMoreClick={() => router.push("/stories?category=family")}
        />
      </main>

      <TabBar />
    </div>
  );
}

// 스토리 섹션 컴포넌트
interface StorySectionProps {
  title: string;
  stories: Array<{
    id: string;
    titleKo: string;
    thumbnailUrl: string;
    isFree: boolean;
  }>;
  isLoading: boolean;
  isSubscribed: boolean;
  onStoryClick: (id: string) => void;
  onMoreClick: () => void;
}

function StorySection({
  title,
  stories,
  isLoading,
  isSubscribed,
  onStoryClick,
  onMoreClick,
}: StorySectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-lg font-bold text-[#333333]">{title}</h2>
        <button
          onClick={onMoreClick}
          className="text-sm font-medium text-[#888888] transition-colors hover:text-[#666666]"
        >
          더보기 &gt;
        </button>
      </div>

      {/* 가로 스크롤 목록 */}
      <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2">
        {isLoading ? (
          // 스켈레톤 로딩
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-28 shrink-0">
              <div className="aspect-[3/4] animate-pulse rounded-xl bg-gray-200" />
              <div className="mt-2 h-4 animate-pulse rounded bg-gray-200" />
            </div>
          ))
        ) : stories.length > 0 ? (
          stories.map((story) => (
            <div key={story.id} className="w-28 shrink-0">
              <StoryCard
                title={story.titleKo}
                thumbnailUrl={story.thumbnailUrl}
                isLocked={!story.isFree && !isSubscribed}
                onClick={() => onStoryClick(story.id)}
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-[#888888]">동화가 없습니다.</p>
        )}
      </div>
    </section>
  );
}
