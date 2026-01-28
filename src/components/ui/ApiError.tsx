import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { ApiError as ApiErrorType } from "@/types/story";
import { getErrorMessage } from "@/lib/utils";

interface ApiErrorProps {
  error: ApiErrorType;
  onRetry?: () => void;
}

const errorMessages: Record<number, { emoji: string; title: string; description: string }> = {
  401: {
    emoji: "🔒",
    title: "로그인이 필요해요",
    description: "이 기능을 사용하려면 로그인해 주세요.",
  },
  403: {
    emoji: "⭐",
    title: "구독이 필요해요",
    description: "이 콘텐츠를 보려면 구독이 필요합니다.",
  },
  404: {
    emoji: "🔍",
    title: "찾을 수 없어요",
    description: "요청한 콘텐츠를 찾을 수 없습니다.",
  },
  500: {
    emoji: "🔧",
    title: "서버 오류",
    description: "잠시 후 다시 시도해 주세요.",
  },
};

export function ApiError({ error, onRetry }: ApiErrorProps) {
  const router = useRouter();

  const errorInfo = errorMessages[error.statusCode] || {
    emoji: "😢",
    title: "오류가 발생했어요",
    description: getErrorMessage(error.message),
  };

  const handleAction = () => {
    if (error.statusCode === 401) {
      router.push("/login");
    } else if (error.statusCode === 403) {
      router.push("/subscription");
    } else if (error.statusCode === 404) {
      router.back();
    } else if (onRetry) {
      onRetry();
    }
  };

  const actionLabel =
    error.statusCode === 401
      ? "로그인"
      : error.statusCode === 403
        ? "구독하기"
        : error.statusCode === 404
          ? "돌아가기"
          : "다시 시도";

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-4xl">{errorInfo.emoji}</Text>
      <Text className="mt-4 text-lg font-bold text-text-main">
        {errorInfo.title}
      </Text>
      <Text className="mt-2 text-center text-sm text-text-sub">
        {errorInfo.description}
      </Text>
      <Pressable
        onPress={handleAction}
        className="mt-6 rounded-xl bg-primary px-6 py-3"
      >
        <Text className="font-bold text-white">{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
