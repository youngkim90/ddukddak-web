"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout";
import { StoryCard } from "@/components/ui";
import { useStories } from "@/hooks/useStories";
import { useIsSubscribed } from "@/stores/authStore";
import { CATEGORY_LABELS, AGE_GROUP_OPTIONS } from "@/lib/constants";
import type { StoryCategory } from "@/types/story";

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const [selectedAge, setSelectedAge] = useState("all");
  const isSubscribed = useIsSubscribed();

  // API로 동화 목록 조회
  const { data, isLoading, error } = useStories({
    category: category || undefined,
    ageGroup: selectedAge !== "all" ? selectedAge : undefined,
  });

  const stories = data?.stories || [];
  const categoryLabel = category
    ? CATEGORY_LABELS[category as StoryCategory] || category
    : "전체";

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title={`${categoryLabel} 동화`} showBack />

      {/* Age Filter Tabs */}
      <div className="flex gap-2 border-b border-[#E5E5E5] px-4 py-3">
        {AGE_GROUP_OPTIONS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedAge(filter.value)}
            aria-pressed={selectedAge === filter.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedAge === filter.value
                ? "bg-[#FF9500] text-white"
                : "bg-[#F5F5F5] text-[#888888] hover:bg-[#EBEBEB]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Story Grid */}
      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          // 스켈레톤 로딩
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] animate-pulse rounded-xl bg-gray-200" />
                <div className="mt-2 h-4 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          // 에러 상태
          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <p className="text-[#888888]">동화를 불러오지 못했습니다.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#FF9500] px-4 py-2 text-sm text-white"
            >
              다시 시도
            </button>
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                title={story.titleKo}
                thumbnailUrl={story.thumbnailUrl}
                isLocked={!story.isFree && !isSubscribed}
                onClick={() => router.push(`/story/${story.id}`)}
              />
            ))}
          </div>
        ) : (
          // 빈 상태
          <div className="flex flex-1 flex-col items-center justify-center py-12">
            <p className="text-[#888888]">동화가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh flex-col">
          <Header title="동화" showBack />
          <div className="flex flex-1 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-[#FF9500] border-t-transparent" />
          </div>
        </div>
      }
    >
      <StoriesContent />
    </Suspense>
  );
}
