"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout";
import { StoryCard } from "@/components/ui";

// Mock data
const mockStories = [
  { id: "1", title: "양치 요정 뽀드득", thumbnailColor: "#FAD9E5", ageGroup: "3-5" },
  { id: "2", title: "용감한 토끼 또롱이", thumbnailColor: "#D9E5F2", ageGroup: "3-5" },
  { id: "3", title: "작은 별의 여행", thumbnailColor: "#D9D9D9", ageGroup: "5-7", isLocked: true },
  { id: "4", title: "숲 속의 친구들", thumbnailColor: "#E5FAD9", ageGroup: "3-5" },
  { id: "5", title: "바다 탐험대", thumbnailColor: "#D9FAF2", ageGroup: "5-7", isLocked: true },
  { id: "6", title: "꿈꾸는 구름", thumbnailColor: "#FAF2D9", ageGroup: "3-5" },
];

const ageFilters = [
  { label: "전체", value: "all" },
  { label: "3-5세", value: "3-5" },
  { label: "5-7세", value: "5-7" },
];

function StoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "교훈";
  const [selectedAge, setSelectedAge] = useState("all");

  const filteredStories =
    selectedAge === "all"
      ? mockStories
      : mockStories.filter((story) => story.ageGroup === selectedAge);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title={`${category} 동화`} showBack />

      {/* Age Filter Tabs */}
      <div className="flex gap-2 border-b border-[#E5E5E5] px-4 py-3">
        {ageFilters.map((filter) => (
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
        <div className="grid grid-cols-2 gap-4">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              title={story.title}
              thumbnailColor={story.thumbnailColor}
              isLocked={story.isLocked}
              onClick={() => router.push(`/story/${story.id}`)}
            />
          ))}
        </div>
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
