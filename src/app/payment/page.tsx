"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui";

// 결제 수단 옵션
const paymentMethods = [
  { id: "card", name: "💳 신용/체크카드", selected: true },
  { id: "simple", name: "📱 간편결제 (카카오페이, 네이버페이)", selected: false },
];

// 플랜 정보
const plans = {
  monthly: {
    name: "월 구독",
    price: 4900,
    period: "월",
    description: "모든 동화 무제한 이용",
    billingCycle: "매월 자동 결제",
  },
  yearly: {
    name: "연 구독",
    price: 39000,
    period: "년",
    description: "모든 동화 무제한 이용",
    billingCycle: "매년 자동 결제",
  },
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = (searchParams.get("plan") as "monthly" | "yearly") || "monthly";
  const plan = plans[planType];

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  function handlePayment() {
    if (!agreeTerms || !selectedMethod) return;

    setIsProcessing(true);

    // TODO: TossPayments SDK 연동
    setTimeout(() => {
      setIsProcessing(false);
      router.push("/home");
    }, 2000);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF9F0]">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[#F5F5F5]"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-6 text-[#333333]" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold text-[#333333]">결제</h1>
      </header>

      {/* Content */}
      <main className="flex-1 space-y-4 p-5">
        {/* 선택한 플랜 */}
        <section>
          <h2 className="mb-3 font-bold text-[#333333]">선택한 플랜</h2>
          <div className="rounded-xl bg-[#FFF2D9] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#FF9500]">{plan.name}</p>
                <p className="text-sm text-[#808080]">{plan.description}</p>
              </div>
              <p className="text-lg font-bold text-[#333333]">
                ₩{plan.price.toLocaleString()}/{plan.period}
              </p>
            </div>
          </div>
        </section>

        {/* 결제 수단 */}
        <section>
          <h2 className="mb-3 font-bold text-[#333333]">결제 수단</h2>
          <div className="space-y-2" role="radiogroup" aria-label="결제 수단 선택">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                role="radio"
                aria-checked={selectedMethod === method.id}
                className={`flex w-full items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all ${
                  selectedMethod === method.id
                    ? "border-[#FF9500]"
                    : "border-transparent"
                }`}
              >
                <div
                  className={`flex size-5 items-center justify-center rounded-full border-2 ${
                    selectedMethod === method.id
                      ? "border-[#FF9500] bg-[#FF9500]"
                      : "border-[#D9D9D9]"
                  }`}
                  aria-hidden="true"
                >
                  {selectedMethod === method.id && (
                    <Check className="size-3 text-white" />
                  )}
                </div>
                <span className={`font-medium ${
                  selectedMethod === method.id ? "text-[#333333]" : "text-[#666666]"
                }`}>
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 결제 정보 */}
        <section>
          <h2 className="mb-3 font-bold text-[#333333]">결제 정보</h2>
          <div className="space-y-3 rounded-xl bg-[#F2F2F2] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#808080]">상품명</span>
              <span className="text-sm font-semibold text-[#333333]">
                뚝딱동화 {plan.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#808080]">결제 주기</span>
              <span className="text-sm text-[#333333]">{plan.billingCycle}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-3">
              <span className="text-sm font-bold text-[#333333]">결제 금액</span>
              <span className="text-lg font-bold text-[#FF9500]">
                ₩{plan.price.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* 약관 동의 */}
        <label className="flex cursor-pointer items-center gap-3">
          <div
            className={`flex size-5 items-center justify-center rounded ${
              agreeTerms ? "bg-[#FF9500]" : "border-2 border-[#D9D9D9] bg-white"
            }`}
          >
            {agreeTerms && <Check className="size-3 text-white" />}
          </div>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="sr-only"
          />
          <span className="text-sm text-[#666666]">
            결제 진행 및 이용약관에 동의합니다
          </span>
        </label>

        {/* 결제 버튼 */}
        <Button
          onClick={handlePayment}
          disabled={!agreeTerms || isProcessing}
          className="w-full"
        >
          {isProcessing ? "결제 처리 중..." : `₩${plan.price.toLocaleString()} 결제하기`}
        </Button>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-[#999999]">
          토스페이먼츠로 안전하게 결제됩니다
        </p>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#FFF9F0]">
          <div className="size-8 animate-spin rounded-full border-4 border-[#FF9500] border-t-transparent" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
