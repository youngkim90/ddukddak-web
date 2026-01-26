"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ONBOARDING_COMPLETED_KEY = "ddukddak_onboarding_completed";

export default function SplashPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 페이드인 애니메이션
    setIsVisible(true);

    const timer = setTimeout(() => {
      // 첫 방문 체크: 온보딩 완료 여부 확인
      const hasCompletedOnboarding =
        localStorage.getItem(ONBOARDING_COMPLETED_KEY);

      if (hasCompletedOnboarding === "true") {
        router.push("/home");
      } else {
        router.push("/onboarding");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className={`relative h-dvh w-full overflow-hidden transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Image
        src="/images/ddukddak-splash-high.png"
        alt="뚝딱동화 - AI 동화 마법사 뚝딱이"
        fill
        priority
        className="object-cover"
      />
    </div>
  );
}
