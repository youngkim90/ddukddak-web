import { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StoryCard, StoryCardSkeleton } from "@/components/ui";
import { useStories } from "@/hooks/useStories";
import { useIsSubscribed } from "@/stores/authStore";
import { CATEGORY_OPTIONS, AGE_GROUP_OPTIONS, FREE_MODE } from "@/lib/constants";
import { getOptimizedImageUrl } from "@/lib/utils";

export default function StoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const isSubscribed = useIsSubscribed();

  const [selectedCategory, setSelectedCategory] = useState(
    params.category || "all"
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");

  const { data, isLoading, error, refetch } = useStories({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    ageGroup: selectedAgeGroup !== "all" ? selectedAgeGroup : undefined,
  });

  const stories = data?.stories || [];

  return (
    <View className="flex-1 bg-background">
      {/* Category Filter */}
      <View className="bg-white px-4 pt-4 pb-2">
        <FlatList
          data={[...CATEGORY_OPTIONS]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategory(item.value)}
              className={`rounded-full px-4 py-2 ${
                selectedCategory === item.value
                  ? "bg-primary"
                  : "bg-[#F5F5F5]"
              }`}
              accessibilityState={{ selected: selectedCategory === item.value }}
            >
              <Text
                className={`text-sm font-bold ${
                  selectedCategory === item.value
                    ? "text-white"
                    : "text-text-sub"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />

        {/* Age Group Filter */}
        <FlatList
          data={[...AGE_GROUP_OPTIONS]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 mt-2"
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedAgeGroup(item.value)}
              className={`rounded-full border px-3 py-1.5 ${
                selectedAgeGroup === item.value
                  ? "border-primary bg-[#FFF2D9]"
                  : "border-[#E0E0E0] bg-white"
              }`}
              accessibilityState={{ selected: selectedAgeGroup === item.value }}
            >
              <Text
                className={`text-xs ${
                  selectedAgeGroup === item.value
                    ? "font-bold text-primary"
                    : "text-text-sub"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Story Grid */}
      {isLoading ? (
        <View className="flex-1 flex-row flex-wrap gap-4 p-4">
          <View className="flex-1 min-w-[40%]"><StoryCardSkeleton /></View>
          <View className="flex-1 min-w-[40%]"><StoryCardSkeleton /></View>
          <View className="flex-1 min-w-[40%]"><StoryCardSkeleton /></View>
          <View className="flex-1 min-w-[40%]"><StoryCardSkeleton /></View>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-4xl" accessibilityElementsHidden>😢</Text>
          <Text className="mt-4 text-base font-bold text-text-main">
            동화를 불러올 수 없어요
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 rounded-lg bg-primary px-4 py-2"
          >
            <Text className="text-sm font-bold text-white">다시 시도</Text>
          </Pressable>
        </View>
      ) : stories.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-4xl" accessibilityElementsHidden>📚</Text>
          <Text className="mt-4 text-base font-bold text-text-main">
            동화가 없어요
          </Text>
          <Text className="mt-2 text-sm text-text-sub">
            다른 카테고리를 선택해 보세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          numColumns={2}
          contentContainerClassName="p-4 gap-4"
          columnWrapperClassName="gap-4"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-1">
              <StoryCard
                title={item.titleKo}
                thumbnailUrl={getOptimizedImageUrl(item.thumbnailUrl, 300)}
                isLocked={!FREE_MODE && !item.isFree && !isSubscribed}
                className="w-full"
                onPress={() => {
                  if (!FREE_MODE && !item.isFree && !isSubscribed) {
                    router.push("/subscription");
                  } else {
                    router.push(`/story/${item.id}`);
                  }
                }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
