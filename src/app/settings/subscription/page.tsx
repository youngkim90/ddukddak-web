"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui";

// Mock subscription data
const mockSubscription = {
  plan: "monthly" as "free" | "monthly" | "yearly",
  price: 4900,
  nextBillingDate: "2026.02.24",
};

const planLabels = {
  free: "무료",
  monthly: "월간 구독",
  yearly: "연간 구독",
};

const benefits = [
  "모든 동화 무제한 감상",
  "한국어/영어 음성 지원",
  "광고 없는 깔끔한 환경",
  "신규 동화 우선 공개",
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isSubscribed = mockSubscription.plan !== "free";

  function handleCancelSubscription() {
    // TODO: Implement subscription cancellation
    console.log("Cancel subscription");
    setShowCancelModal(false);
  }

  function handleChangePlan() {
    router.push("/subscription");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF9F0]">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white px-4 py-3">
        <button
          onClick={() => router.push("/settings")}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[#F5F5F5]"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-6 text-[#333333]" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold text-[#333333]">구독 관리</h1>
      </header>

      {/* Content */}
      <main className="flex-1 space-y-5 p-5">
        {/* Subscription Status Card */}
        <section className="rounded-2xl bg-white p-5">
          <p className="text-sm text-[#878787]">현재 구독</p>
          <p className="mt-2 text-2xl font-bold text-[#FF9500]">
            {planLabels[mockSubscription.plan]}
          </p>
          {isSubscribed && (
            <>
              <p className="mt-3 text-lg font-semibold text-[#333333]">
                ₩{mockSubscription.price.toLocaleString()}/월
              </p>
              <p className="mt-2 text-sm text-[#878787]">
                다음 결제일: {mockSubscription.nextBillingDate}
              </p>
            </>
          )}
        </section>

        {/* Benefits Section */}
        {isSubscribed && (
          <section>
            <h2 className="mb-3 font-bold text-[#333333]">구독 혜택</h2>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <p key={index} className="text-sm text-[#333333]">
                  ✓ {benefit}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Change Plan Button */}
        <Button
          variant="secondary"
          onClick={handleChangePlan}
          className="w-full border-2 border-[#FF9500] bg-white text-[#FF9500] hover:bg-[#FFF9F0]"
        >
          플랜 변경
        </Button>

        {/* Cancel Subscription Link */}
        {isSubscribed && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-2 text-center text-sm text-[#878787] transition-colors hover:text-[#666666]"
          >
            구독 해지
          </button>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2
              id="cancel-modal-title"
              className="mb-2 text-lg font-bold text-[#333333]"
            >
              구독 해지
            </h2>
            <p className="mb-6 text-sm text-[#888888]">
              정말 구독을 해지하시겠습니까?
              <br />
              해지 후에도 {mockSubscription.nextBillingDate}까지 이용 가능합니다.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleCancelSubscription}
                className="flex-1 bg-[#FF3B30] hover:bg-[#E02D22]"
              >
                해지하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
