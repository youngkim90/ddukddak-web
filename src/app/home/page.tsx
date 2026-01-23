"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeHeader, TabBar } from "@/components/layout";
import { StoryCard, RecommendBanner } from "@/components/ui";

// Mock data for stories
const mockStories = [
  {
    id: "1",
    title: "양치 요정 뽀드득",
    thumbnailColor: "#FAD9E5",
  },
  {
    id: "2",
    title: "용감한 토끼 또롱이",
    thumbnailColor: "#D9E5F2",
  },
  {
    id: "3",
    title: "작은 별의 여행",
    thumbnailColor: "#D9D9D9",
    isLocked: true,
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <HomeHeader />

      <main className="flex-1 space-y-6 px-4 py-4">
        {/* Recommendation Banner */}
        <RecommendBanner
          title="이번 주 추천 동화"
          subtitle="양치 요정 뽀드득"
          onClick={() => router.push("/story/1")}
        />

        {/* Story Section */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#333333]">
              📚 교훈 동화
            </h2>
            <Link
              href="/stories"
              className="text-sm font-medium text-[#888888] hover:text-[#666666] transition-colors"
              aria-label="교훈 동화 더보기"
            >
              더보기 &gt;
            </Link>
          </div>

          {/* Story Grid */}
          <div className="grid grid-cols-3 gap-3">
            {mockStories.map((story) => (
              <StoryCard
                key={story.id}
                title={story.title}
                thumbnailColor={story.thumbnailColor}
                isLocked={story.isLocked}
                onClick={() => router.push(`/story/${story.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Another Section - Adventure Stories */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#333333]">
              🚀 모험 동화
            </h2>
            <Link
              href="/stories?category=adventure"
              className="text-sm font-medium text-[#888888] hover:text-[#666666] transition-colors"
              aria-label="모험 동화 더보기"
            >
              더보기 &gt;
            </Link>
          </div>

          {/* Story Grid */}
          <div className="grid grid-cols-3 gap-3">
            {mockStories.map((story) => (
              <StoryCard
                key={`adventure-${story.id}`}
                title={story.title}
                thumbnailColor={story.thumbnailColor}
                isLocked={story.isLocked}
                onClick={() => router.push(`/story/${story.id}`)}
              />
            ))}
          </div>
        </section>
      </main>

      <TabBar />
    </div>
  );
}
