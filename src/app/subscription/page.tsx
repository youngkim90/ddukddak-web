"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";

const benefits = [
  "모든 동화 무제한 이용",
  "한국어, 영어 다국어 지원",
  "TTS 음성 + BGM 재생",
  "광고 없는 깔끔한 환경",
];

const plans = [
  {
    id: "free",
    name: "무료 플랜",
    price: "₩0",
    period: "",
    description: "동화 3편 무료 체험",
    isRecommended: false,
  },
  {
    id: "monthly",
    name: "월 구독",
    price: "₩4,900",
    period: "/월",
    description: "모든 동화 무제한",
    isRecommended: true,
  },
  {
    id: "yearly",
    name: "연 구독",
    price: "₩39,000",
    period: "/년",
    description: "33% 할인 혜택",
    isRecommended: false,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  function handleSubscribe() {
    // TODO: Implement actual payment with TossPayments
    console.log("Subscribe to plan:", selectedPlan);
    router.push("/home");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF9F0]">
      {/* Header */}
      <div className="flex items-center justify-end px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full bg-[#F5F5F5]"
          aria-label="닫기"
        >
          <X className="size-5 text-[#666666]" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Sparkles className="size-6 text-[#FF9500]" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-[#333333]">프리미엄 혜택</h1>
        </div>

        {/* Benefits */}
        <div className="mt-5 space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex size-6 items-center justify-center rounded-full bg-[#34C759]" aria-hidden="true">
                <Check className="size-4 text-white" />
              </div>
              <span className="text-[#333333]">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Plan Cards */}
        <div className="mt-8 space-y-3" role="radiogroup" aria-label="구독 플랜 선택">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              role="radio"
              aria-checked={selectedPlan === plan.id}
              className={`relative w-full rounded-2xl border-2 p-4 pl-12 text-left transition-all ${
                selectedPlan === plan.id
                  ? "border-[#FF9500] bg-[#FFF9F0]"
                  : "border-[#E5E5E5] bg-white hover:border-[#D0D0D0]"
              }`}
            >
              {plan.isRecommended && (
                <span className="absolute -top-3 right-4 rounded-full bg-[#FF9500] px-3 py-1 text-xs font-bold text-white">
                  추천
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#333333]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-[#888888]">
                    {plan.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#333333]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#888888]">{plan.period}</span>
                </div>
              </div>
              {/* Radio indicator */}
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 rounded-full border-2 ${
                  selectedPlan === plan.id
                    ? "border-[#FF9500] bg-[#FF9500]"
                    : "border-[#D9D9D9]"
                }`}
                aria-hidden="true"
              >
                {selectedPlan === plan.id && (
                  <Check className="size-full p-0.5 text-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-safe pt-4">
        <Button onClick={handleSubscribe} className="w-full">
          {selectedPlan === "free" ? "무료로 시작하기" : "구독 시작하기"}
        </Button>
        <p className="mt-3 text-center text-sm text-[#888888]">
          언제든지 구독을 해지할 수 있어요
        </p>
      </div>
    </div>
  );
}
