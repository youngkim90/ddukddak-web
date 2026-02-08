import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Clock, BookOpen, Lock } from "lucide-react-native";
import { Header } from "@/components/layout";
import { Button, ApiError, StoryDetailSkeleton } from "@/components/ui";
import { useStory } from "@/hooks/useStories";
import { useIsSubscribed } from "@/stores/authStore";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  AGE_GROUP_LABELS,
  FREE_MODE,
} from "@/lib/constants";
import { getOptimizedImageUrl, formatDuration } from "@/lib/utils";
import type { ApiError as ApiErrorType } from "@/types/story";

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isSubscribed = useIsSubscribed();
  const [language, setLanguage] = useState<"ko" | "en">("ko");

  const { data: story, isLoading, error } = useStory(id);

  if (isLoading) return <StoryDetailSkeleton />;

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <Header title="동화 상세" showBack />
        <ApiError error={error as unknown as ApiErrorType} />
      </View>
    );
  }

  if (!story) return null;

  const isLocked = !FREE_MODE && !story.isFree && !isSubscribed;
  const canRead = !isLocked;
  const categoryColor = CATEGORY_COLORS[story.category];
  const title = language === "ko" ? story.titleKo : story.titleEn;
  const description = language === "ko" ? story.descriptionKo : story.descriptionEn;

  return (
    <View className="flex-1 bg-background">
      <Header title="" showBack />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View className="aspect-video w-full" style={{ backgroundColor: categoryColor + "20" }}>
          {story.thumbnailUrl ? (
            <Image
              source={{ uri: getOptimizedImageUrl(story.thumbnailUrl, 600) }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-6xl" accessibilityElementsHidden>📖</Text>
            </View>
          )}

          {/* Locked Badge */}
          {isLocked && (
            <View className="absolute right-4 top-4 flex-row items-center gap-1 rounded-full bg-black/50 px-3 py-1.5">
              <Lock size={14} color="#FFFFFF" />
              <Text className="text-sm text-white">프리미엄</Text>
            </View>
          )}
        </View>

        <View className="p-5 gap-4">
          {/* Category & Age */}
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: categoryColor + "20" }}
            >
              <Text className="text-xs font-bold" style={{ color: categoryColor }}>
                {CATEGORY_LABELS[story.category]}
              </Text>
            </View>
            <Text className="text-xs text-text-sub">
              {AGE_GROUP_LABELS[story.ageGroup]}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-text-main">{title}</Text>

          {/* Meta */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Clock size={14} color="#888888" />
              <Text className="text-sm text-text-sub">
                {formatDuration(story.durationMinutes)}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <BookOpen size={14} color="#888888" />
              <Text className="text-sm text-text-sub">
                {story.pageCount}페이지
              </Text>
            </View>
          </View>

          {/* Language Toggle */}
          <Text className="text-sm font-bold text-text-main">언어 선택</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setLanguage("ko")}
              className={`rounded-full px-4 py-2 ${
                language === "ko" ? "bg-primary" : "bg-[#F5F5F5]"
              }`}
              accessibilityState={{ selected: language === "ko" }}
            >
              <Text
                className={`text-sm font-bold ${
                  language === "ko" ? "text-white" : "text-text-sub"
                }`}
              >
                한국어
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLanguage("en")}
              className={`rounded-full px-4 py-2 ${
                language === "en" ? "bg-primary" : "bg-[#F5F5F5]"
              }`}
              accessibilityState={{ selected: language === "en" }}
            >
              <Text
                className={`text-sm font-bold ${
                  language === "en" ? "text-white" : "text-text-sub"
                }`}
              >
                English
              </Text>
            </Pressable>
          </View>

          {/* Description */}
          <Text className="text-base leading-6 text-text-main">
            {description}
          </Text>

          {/* Read Button */}
          {canRead ? (
            <Button
              onPress={() => router.push(`/story/${id}/viewer?lang=${language}`)}
              fullWidth
              size="lg"
            >
              읽기 시작
            </Button>
          ) : (
            <Button
              onPress={() => router.push("/subscription")}
              fullWidth
              size="lg"
            >
              구독하고 읽기
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
