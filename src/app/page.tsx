"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ONBOARDING_COMPLETED_KEY = "ddukddak_onboarding_completed";

export default function SplashPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 페이드인 애니메이션
    setIsVisible(true);

    const timer = setTimeout(() => {
      // 첫 방문 체크: 온보딩 완료 여부 확인
      const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_COMPLETED_KEY);

      if (hasCompletedOnboarding === "true") {
        router.push("/home");
      } else {
        router.push("/onboarding");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      {/* Logo with fade-in animation */}
      <div
        className={`mb-6 size-20 rounded-full bg-[#FF9500] transition-all duration-700 ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      />

      {/* Service Name with fade-in animation */}
      <h1
        className={`text-[28px] font-bold text-[#333333] transition-all duration-700 delay-200 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        뚝딱동화
      </h1>
    </div>
  );
}
