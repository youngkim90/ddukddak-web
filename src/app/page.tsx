"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: Check if first visit → onboarding, else → home
      router.push("/onboarding");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      {/* Logo */}
      <div className="mb-6 size-20 rounded-full bg-[#FF9500]" />

      {/* Service Name */}
      <h1 className="text-[28px] font-bold text-[#333333]">뚝딱동화</h1>
    </div>
  );
}
