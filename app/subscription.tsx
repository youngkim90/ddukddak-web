import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { X, Check, Sparkles, Gift } from "lucide-react-native";
import { Header } from "@/components/layout";
import { Button } from "@/components/ui";
import { useSubscriptionPlans } from "@/hooks/useSubscription";
import { Skeleton } from "@/components/ui";
import { FREE_MODE } from "@/lib/constants";

const benefits = [
  "모든 동화 무제한 이용",
  "한국어, 영어 다국어 지원",
  "TTS 음성 + BGM 재생",
  "광고 없는 깔끔한 환경",
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans();

  const plans = plansData?.plans
    ? [
        {
          id: "free",
          name: "무료 플랜",
          price: "₩0",
          period: "",
          description: "동화 3편 무료 체험",
          isRecommended: false,
        },
        ...plansData.plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          price: `₩${plan.price.toLocaleString()}`,
          period: plan.period === "monthly" ? "/월" : "/년",
          description: plan.features[0] || "",
          isRecommended: plan.period === "monthly",
        })),
      ]
    : [
        { id: "free", name: "무료 플랜", price: "₩0", period: "", description: "동화 3편 무료 체험", isRecommended: false },
        { id: "monthly", name: "월 구독", price: "₩4,900", period: "/월", description: "모든 동화 무제한", isRecommended: true },
        { id: "yearly", name: "연 구독", price: "₩39,000", period: "/년", description: "33% 할인 혜택", isRecommended: false },
      ];

  const handleSubscribe = () => {
    if (FREE_MODE || selectedPlan === "free") {
      router.replace("/(tabs)/home");
    } else {
      router.push(`/payment?plan=${selectedPlan}`);
    }
  };

  if (FREE_MODE) {
    return (
      <View className="flex-1 bg-background">
        <Header title="구독 안내" showBack />

        <ScrollView className="flex-1" contentContainerClassName="px-5 py-5">
          {/* Free Mode Notice */}
          <View className="items-center rounded-2xl bg-[#FFF2D9] p-6 mb-5">
            <Gift size={48} color="#FF9500" />
            <Text className="mt-4 text-lg font-bold text-text-main text-center">
              현재 모든 동화를 무료로{"\n"}즐기실 수 있습니다
            </Text>
            <Text className="mt-2 text-sm text-text-sub text-center">
              지금 바로 다양한 동화를 만나보세요!
            </Text>
          </View>

          {/* Benefits */}
          <View className="rounded-2xl bg-white p-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Sparkles size={20} color="#FF9500" />
              <Text className="text-base font-bold text-primary">
                무료로 제공되는 혜택
              </Text>
            </View>
            {benefits.map((benefit, i) => (
              <View key={i} className="flex-row items-center gap-2 py-1.5">
                <Check size={16} color="#34C759" />
                <Text className="text-sm text-text-main">{benefit}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="px-5 pb-8 pt-3 bg-background">
          <Button onPress={() => router.replace("/(tabs)/home")} fullWidth size="lg">
            동화 보러 가기
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header title="구독 안내" showBack />

      <ScrollView className="flex-1" contentContainerClassName="px-5 py-5">
        {/* Benefits */}
        <View className="rounded-2xl bg-[#FFF2D9] p-5 mb-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Sparkles size={20} color="#FF9500" />
            <Text className="text-base font-bold text-primary">프리미엄 혜택</Text>
          </View>
          {benefits.map((benefit, i) => (
            <View key={i} className="flex-row items-center gap-2 py-1.5">
              <Check size={16} color="#34C759" />
              <Text className="text-sm text-text-main">{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        {plansLoading ? (
          <View className="gap-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </View>
        ) : (
        <View className="gap-3" accessibilityRole="radiogroup">
          {plans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              className={`rounded-2xl border-2 p-4 ${
                selectedPlan === plan.id
                  ? "border-primary bg-white"
                  : "border-[#E0E0E0] bg-white"
              }`}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPlan === plan.id }}
            >
              {plan.isRecommended && (
                <View className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1">
                  <Text className="text-xs font-bold text-white">추천</Text>
                </View>
              )}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-bold text-text-main">
                    {plan.name}
                  </Text>
                  <Text className="mt-1 text-xs text-text-sub">
                    {plan.description}
                  </Text>
                </View>
                <Text className="text-lg font-bold text-text-main">
                  {plan.price}
                  <Text className="text-sm font-normal text-text-sub">
                    {plan.period}
                  </Text>
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        )}
      </ScrollView>

      <View className="px-5 pb-8 pt-3 bg-background">
        <Button onPress={handleSubscribe} fullWidth size="lg">
          {selectedPlan === "free" ? "무료로 시작하기" : "구독 시작하기"}
        </Button>
        <Text className="mt-3 text-center text-sm text-text-sub">
          언제든지 구독을 해지할 수 있어요
        </Text>
      </View>
    </View>
  );
}
