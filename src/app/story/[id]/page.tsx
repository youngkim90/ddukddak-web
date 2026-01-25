"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { useStory } from "@/hooks/useStories";
import { useIsSubscribed } from "@/stores/authStore";
import { CATEGORY_LABELS, AGE_GROUP_LABELS } from "@/lib/constants";
import type { StoryCategory, AgeGroup } from "@/types/story";

export default function StoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id as string;
  const [selectedLanguage, setSelectedLanguage] = useState<"ko" | "en">("ko");
  const isSubscribed = useIsSubscribed();

  // API로 동화 상세 조회
  const { data: story, isLoading, error } = useStory(storyId);

  const isLocked = story ? !story.isFree && !isSubscribed : false;

  function handleStartReading() {
    if (isLocked) {
      router.push("/subscription");
    } else {
      router.push(`/story/${storyId}/viewer?lang=${selectedLanguage}`);
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#FFF9F0]">
        <div className="h-64 w-full animate-pulse bg-gray-200" />
        <div className="flex-1 px-5 py-5">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 flex gap-2">
            <div className="h-7 w-16 animate-pulse rounded-full bg-gray-200" />
            <div className="h-7 w-16 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !story) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FFF9F0]">
        <p className="text-[#888888]">동화를 찾을 수 없습니다.</p>
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
    <div className="flex min-h-dvh flex-col bg-[#FFF9F0]">
      {/* Thumbnail Area */}
      <div className="relative h-64 w-full">
        {story.thumbnailUrl ? (
          <img
            src={story.thumbnailUrl}
            alt={story.titleKo}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-[#FAD9E5] to-[#D9E5FA]" />
        )}

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-5 text-[#333333]" aria-hidden="true" />
        </button>

        {/* Locked Indicator */}
        {isLocked && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
            <Lock className="size-4" aria-hidden="true" />
            <span>프리미엄</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col px-5 py-5">
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#333333]">
          {selectedLanguage === "ko" ? story.titleKo : story.titleEn}
        </h1>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#FFF0E0] px-3 py-1 text-sm font-medium text-[#FF9500]">
            {AGE_GROUP_LABELS[story.ageGroup as AgeGroup] || story.ageGroup}
          </span>
          <span className="rounded-full bg-[#F0F5FF] px-3 py-1 text-sm font-medium text-[#5AC8FA]">
            {CATEGORY_LABELS[story.category as StoryCategory] || story.category}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-1 text-sm text-[#888888]">
            <Clock className="size-3.5" aria-hidden="true" />
            {story.durationMinutes}분
          </span>
        </div>

        {/* Description */}
        <p className="mt-5 leading-relaxed text-[#666666]">
          {selectedLanguage === "ko" ? story.descriptionKo : story.descriptionEn}
        </p>

        {/* Language Selection */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-[#333333]">언어 선택</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLanguage("ko")}
              aria-pressed={selectedLanguage === "ko"}
              className={`flex-1 rounded-xl border-2 py-3 text-center font-medium transition-colors ${
                selectedLanguage === "ko"
                  ? "border-[#FF9500] bg-[#FFF9F0] text-[#FF9500]"
                  : "border-[#E5E5E5] bg-white text-[#888888] hover:border-[#D0D0D0]"
              }`}
            >
              한국어
            </button>
            <button
              onClick={() => setSelectedLanguage("en")}
              aria-pressed={selectedLanguage === "en"}
              className={`flex-1 rounded-xl border-2 py-3 text-center font-medium transition-colors ${
                selectedLanguage === "en"
                  ? "border-[#FF9500] bg-[#FFF9F0] text-[#FF9500]"
                  : "border-[#E5E5E5] bg-white text-[#888888] hover:border-[#D0D0D0]"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Start Button */}
        <div className="pb-safe pt-4">
          <Button onClick={handleStartReading} className="w-full">
            {isLocked ? "구독하고 읽기" : "읽기 시작"}
          </Button>
        </div>
      </div>
    </div>
  );
}
