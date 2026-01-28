import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { HomeHeader } from "@/components/layout";
import { StoryCard, StoryCardSkeleton } from "@/components/ui";
import { useStoriesByCategory, useStories } from "@/hooks/useStories";
import { useIsSubscribed } from "@/stores/authStore";
import { CATEGORY_LABELS } from "@/lib/constants";
import { getOptimizedImageUrl } from "@/lib/utils";
import type { StoryCategory } from "@/types/story";

const CATEGORY_EMOJIS: Record<string, string> = {
  lesson: "📚",
  adventure: "🚀",
  family: "🏠",
};

const BANNER_TEMPLATES = [
  { title: "이번 주 추천 동화", bgColor: "#5AC8FA" },
  { title: "새로 나왔어요!", bgColor: "#FF9500" },
  { title: "인기 동화", bgColor: "#AF52DE" },
];

function StoryCategorySection({ category }: { category: StoryCategory }) {
  const router = useRouter();
  const isSubscribed = useIsSubscribed();
  const { data, isLoading } = useStoriesByCategory(category, 5);

  const stories = data?.stories || [];
  const emoji = CATEGORY_EMOJIS[category] || "";
  const label = CATEGORY_LABELS[category];

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className="text-lg font-bold text-text-main">
          {emoji} {label} 동화
        </Text>
        <Pressable onPress={() => router.push(`/(tabs)/stories?category=${category}`)}>
          <Text className="text-sm text-text-sub">더보기 &gt;</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-row gap-3 px-5">
          <StoryCardSkeleton />
          <StoryCardSkeleton />
          <StoryCardSkeleton />
        </View>
      ) : stories.length > 0 ? (
        <FlatList
          data={stories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5 gap-3"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoryCard
              title={item.titleKo}
              thumbnailUrl={getOptimizedImageUrl(item.thumbnailUrl, 300)}
              isLocked={!item.isFree && !isSubscribed}
              onPress={() => {
                if (!item.isFree && !isSubscribed) {
                  router.push("/subscription");
                } else {
                  router.push(`/story/${item.id}`);
                }
              }}
            />
          )}
        />
      ) : (
        <View className="items-center py-6 px-5">
          <Text className="text-sm text-text-sub">동화가 없습니다.</Text>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);

  // 배너용 동화 목록 조회
  const { data: storiesData } = useStories({ limit: 3 });

  // API에서 가져온 동화로 배너 생성
  const banners = useMemo(() => {
    const stories = storiesData?.stories || [];
    return BANNER_TEMPLATES.map((template, index) => ({
      id: index + 1,
      title: template.title,
      subtitle: stories[index]?.titleKo || "동화를 불러오는 중...",
      bgColor: template.bgColor,
      storyId: stories[index]?.id || null,
    }));
  }, [storiesData]);

  const advanceBanner = useCallback(() => {
    setCurrentBanner((prev) => {
      const next = (prev + 1) % banners.length;
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
      return next;
    });
  }, [banners.length]);

  useEffect(() => {
    const interval = setInterval(advanceBanner, 4000);
    return () => clearInterval(interval);
  }, [advanceBanner]);

  return (
    <View className="flex-1 bg-background">
      <HomeHeader />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View className="px-5 pt-4">
          <View className="relative overflow-hidden rounded-2xl">
            <FlatList
              ref={bannerRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const page = Math.round(
                  e.nativeEvent.contentOffset.x / (width - 40)
                );
                setCurrentBanner(page);
              }}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Pressable
                  style={{ width: width - 40, backgroundColor: item.bgColor }}
                  className="justify-center px-6 py-8"
                  onPress={() => {
                    if (item.storyId) {
                      router.push(`/story/${item.storyId}`);
                    }
                  }}
                >
                  <Text className="text-sm text-white/80">{item.title}</Text>
                  <Text className="mt-1 text-xl font-bold text-white">{item.subtitle}</Text>
                </Pressable>
              )}
            />
            {/* Carousel Controls */}
            <Pressable
              onPress={() => {
                const prev = (currentBanner - 1 + banners.length) % banners.length;
                setCurrentBanner(prev);
                bannerRef.current?.scrollToIndex({ index: prev, animated: true });
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white/20"
              accessibilityLabel="이전 배너"
            >
              <ChevronLeft size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => {
                const next = (currentBanner + 1) % banners.length;
                setCurrentBanner(next);
                bannerRef.current?.scrollToIndex({ index: next, animated: true });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white/20"
              accessibilityLabel="다음 배너"
            >
              <ChevronRight size={20} color="#FFFFFF" />
            </Pressable>
            {/* Page Indicator */}
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
              {banners.map((_, i) => (
                <View
                  key={i}
                  className={`h-2 rounded-full ${
                    i === currentBanner
                      ? "w-4 bg-white"
                      : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Category Sections */}
        <StoryCategorySection category="lesson" />
        <StoryCategorySection category="adventure" />
        <StoryCategorySection category="family" />

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
