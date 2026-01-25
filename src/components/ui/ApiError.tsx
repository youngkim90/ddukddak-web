"use client";

import { useRouter } from "next/navigation";
import { Button } from "./Button";

interface ApiErrorProps {
  status?: number;
  message?: string;
  onRetry?: () => void;
}

export function ApiError({ status, message, onRetry }: ApiErrorProps) {
  const router = useRouter();

  // 에러 상태별 내용
  const errorContent = {
    401: {
      emoji: "🔐",
      title: "로그인이 필요해요",
      description: "서비스를 이용하려면 로그인해주세요",
      action: () => router.push("/login"),
      actionText: "로그인하기",
    },
    403: {
      emoji: "⭐",
      title: "구독이 필요해요",
      description: "프리미엄 구독으로 모든 동화를 즐겨보세요",
      action: () => router.push("/subscription"),
      actionText: "구독하기",
    },
    404: {
      emoji: "🔍",
      title: "찾을 수 없어요",
      description: "요청하신 내용을 찾을 수 없습니다",
      action: () => router.back(),
      actionText: "뒤로가기",
    },
    500: {
      emoji: "😢",
      title: "서버 오류",
      description: "잠시 후 다시 시도해주세요",
      action: onRetry,
      actionText: "다시 시도",
    },
  };

  const content = status && status in errorContent
    ? errorContent[status as keyof typeof errorContent]
    : {
        emoji: "😢",
        title: "오류가 발생했어요",
        description: message || "잠시 후 다시 시도해주세요",
        action: onRetry,
        actionText: "다시 시도",
      };

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-6">
      <div className="text-center">
        <p className="text-6xl">{content.emoji}</p>
        <h2 className="mt-4 text-lg font-bold text-[#333333]">{content.title}</h2>
        <p className="mt-2 text-sm text-[#888888]">{content.description}</p>
        {content.action && (
          <Button onClick={content.action} className="mt-6">
            {content.actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
