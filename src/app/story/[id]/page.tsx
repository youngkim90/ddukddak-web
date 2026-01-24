"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui";

// Mock story data
const mockStoryDetail = {
  id: "1",
  title: "양치 요정 뽀드득",
  description:
    "이가 아파서 울던 토토에게 양치 요정 뽀드득이 찾아왔어요! 뽀드득과 함께 올바른 양치 습관을 배워볼까요? 재미있는 모험과 함께 건강한 치아 관리법을 알려주는 교훈 동화입니다.",
  thumbnailColor: "#FAD9E5",
  category: "교훈",
  ageGroup: "3-5세",
  duration: "5분",
  isLocked: false,
  pages: 12,
};

export default function StoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState<"ko" | "en">("ko");

  // In real app, fetch story by params.id
  const story = mockStoryDetail;

  function handleStartReading() {
    if (story.isLocked) {
      router.push("/subscription");
    } else {
      router.push(`/story/${params.id}/viewer`);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF9F0]">
      {/* Thumbnail Area */}
      <div
        className="relative h-64 w-full"
        style={{ backgroundColor: story.thumbnailColor }}
      >
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-5 text-[#333333]" aria-hidden="true" />
        </button>

        {/* Locked Indicator */}
        {story.isLocked && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
            <Lock className="size-4" aria-hidden="true" />
            <span>프리미엄</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col px-5 py-5">
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#333333]">{story.title}</h1>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#FFF0E0] px-3 py-1 text-sm font-medium text-[#FF9500]">
            {story.ageGroup}
          </span>
          <span className="rounded-full bg-[#F0F5FF] px-3 py-1 text-sm font-medium text-[#5AC8FA]">
            {story.category}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#F5F5F5] px-3 py-1 text-sm text-[#888888]">
            <Clock className="size-3.5" aria-hidden="true" />
            {story.duration}
          </span>
        </div>

        {/* Description */}
        <p className="mt-5 leading-relaxed text-[#666666]">{story.description}</p>

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
            {story.isLocked ? "구독하고 읽기" : "읽기 시작"}
          </Button>
        </div>
      </div>
    </div>
  );
}
