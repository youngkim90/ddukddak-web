import { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PageIndicator } from "@/components/layout";
import { Button } from "@/components/ui";
import { calculateContainerSize } from "@/lib/layout";

const ONBOARDING_COMPLETED_KEY = "ddukddak_onboarding_completed";

const slides = [
  {
    emoji: "📚",
    title: "뚝딱! 동화가 만들어져요",
    description: "AI가 만들어주는 우리 아이 맞춤 동화\n한국어와 영어로 들을 수 있어요",
  },
  {
    emoji: "🌏",
    title: "한국어, 영어로 들어요",
    description: "다양한 언어로 동화를 들으며\n자연스럽게 언어를 배워요",
  },
  {
    emoji: "💝",
    title: "우리 아이에게 들려주세요",
    description: "잠자리에서, 이동 중에도\n언제 어디서나 동화를 들려주세요",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const width = Platform.OS === "web"
    ? calculateContainerSize(windowWidth, windowHeight).width
    : windowWidth;
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentPage === slides.length - 1;

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    router.replace("/login");
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      const nextPage = currentPage + 1;
      flatListRef.current?.scrollToIndex({ index: nextPage });
      setCurrentPage(nextPage);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentPage(page);
          }}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View
              style={{ width }}
              className="flex-1 items-center justify-center px-8 pb-24"
            >
              <View className="h-48 w-48 items-center justify-center rounded-full bg-[#FFE5CC]">
                <Text className="text-7xl" accessibilityElementsHidden>{item.emoji}</Text>
              </View>
              <Text className="mt-8 text-center text-2xl font-bold text-text-main">
                {item.title}
              </Text>
              <Text className="mt-4 text-center text-base text-text-sub leading-6">
                {item.description}
              </Text>
            </View>
          )}
        />
      </View>

      <View className="gap-4 px-8 pb-12">
        <PageIndicator total={slides.length} current={currentPage} />

        <Button onPress={handleNext} fullWidth size="lg">
          {isLastSlide ? "시작하기" : "다음"}
        </Button>

        {!isLastSlide && (
          <Pressable onPress={handleComplete} className="items-center py-2">
            <Text className="text-sm text-text-sub">건너뛰기</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
