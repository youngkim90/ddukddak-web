"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { PageIndicator } from "@/components/layout";

const slides = [
  {
    id: 1,
    icon: "📚",
    title: "뚝딱! 동화가 만들어져요",
    description: "AI가 만들어주는 우리 아이 맞춤 동화\n한국어와 영어로 들을 수 있어요",
  },
  {
    id: 2,
    icon: "🌏",
    title: "한국어, 영어로 들어요",
    description: "다양한 언어로 동화를 들으며\n자연스럽게 언어를 배워요",
  },
  {
    id: 3,
    icon: "💝",
    title: "우리 아이에게 들려주세요",
    description: "잠자리에서, 이동 중에도\n언제 어디서나 동화를 들려주세요",
  },
];

const ONBOARDING_COMPLETED_KEY = "ddukddak_onboarding_completed";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isLastSlide = currentSlide === slides.length - 1;

  // 첫 방문 체크 - 이미 온보딩 완료했으면 홈으로 이동
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (hasCompletedOnboarding === "true") {
      router.replace("/home");
    }
  }, [router]);

  function completeOnboarding() {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    router.push("/login");
  }

  function handleNext() {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  }

  function handleSkip() {
    completeOnboarding();
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
      if (diffX > 0 && currentSlide < slides.length - 1) {
        // 왼쪽으로 스와이프 → 다음
        setCurrentSlide((prev) => prev + 1);
      } else if (diffX < 0 && currentSlide > 0) {
        // 오른쪽으로 스와이프 → 이전
        setCurrentSlide((prev) => prev - 1);
      }
    }
  }

  const slide = slides[currentSlide];

  return (
    <div
      className="flex min-h-dvh flex-col px-6 pb-12 pt-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Illustration */}
        <div className="mb-8 flex size-48 items-center justify-center rounded-full bg-[#FFE5CC] transition-transform duration-300">
          <span className="text-7xl">{slide.icon}</span>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-center text-2xl font-bold text-[#333333]">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="whitespace-pre-line text-center text-base leading-relaxed text-[#888888]">
          {slide.description}
        </p>
      </div>

      {/* Bottom */}
      <div className="space-y-8">
        {/* Page Indicator */}
        <PageIndicator total={slides.length} current={currentSlide} />

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="lg" onClick={handleSkip} className="flex-1">
            건너뛰기
          </Button>
          <Button variant="primary" size="lg" onClick={handleNext} className="flex-1">
            {isLastSlide ? "시작하기" : "다음"}
          </Button>
        </div>
      </div>
    </div>
  );
}
