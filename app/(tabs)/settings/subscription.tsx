import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Header } from "@/components/layout";
import { Button, Skeleton } from "@/components/ui";
import { useMySubscription, useCancelSubscription } from "@/hooks/useSubscription";

const planLabels: Record<string, string> = {
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

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: subscription, isLoading } = useMySubscription();
  const cancelSubscription = useCancelSubscription();

  const isSubscribed = subscription?.status === "active";

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription.mutateAsync();
      setShowCancelModal(false);
      Alert.alert("완료", "구독이 해지되었습니다.");
    } catch {
      Alert.alert("오류", "구독 해지에 실패했습니다.");
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <Header title="구독 관리" showBack />
        <View className="p-5">
          <Skeleton className="h-32 w-full rounded-2xl" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header title="구독 관리" showBack />

      <ScrollView className="flex-1" contentContainerClassName="px-5 py-5">
        {isSubscribed && subscription ? (
          <>
            {/* Current Plan */}
            <View className="rounded-2xl bg-white p-5 shadow-sm mb-5">
              <Text className="text-sm text-text-sub">현재 구독</Text>
              <Text className="mt-2 text-2xl font-bold text-primary">
                {planLabels[subscription.planType] || subscription.planType}
              </Text>
              <Text className="mt-3 text-lg font-semibold text-text-main">
                {subscription.planType === "monthly" ? "₩4,900/월" : "₩39,000/년"}
              </Text>
              <Text className="mt-2 text-sm text-text-sub">
                다음 결제일: {formatDate(subscription.expiresAt)}
              </Text>
              {!subscription.autoRenew && (
                <Text className="mt-1 text-sm text-error">
                  자동 갱신이 해제되었습니다
                </Text>
              )}
            </View>

            {/* Benefits */}
            <View className="rounded-2xl bg-[#FFF2D9] p-5 mb-5">
              <Text className="mb-3 font-bold text-primary">구독 혜택</Text>
              {benefits.map((benefit, i) => (
                <View key={i} className="flex-row items-center gap-2 py-1.5">
                  <Check size={16} color="#34C759" />
                  <Text className="text-sm text-text-main">{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View className="gap-3">
              <Button
                variant="secondary"
                fullWidth
                size="lg"
                onPress={() => router.push("/subscription")}
              >
                플랜 변경
              </Button>
              {subscription.autoRenew && (
                <Pressable
                  onPress={() => setShowCancelModal(true)}
                  className="items-center py-3"
                >
                  <Text className="text-sm text-text-sub">구독 해지</Text>
                </Pressable>
              )}
            </View>
          </>
        ) : (
          <View className="items-center py-12">
            <Text className="text-4xl" accessibilityElementsHidden>📚</Text>
            <Text className="mt-4 text-lg font-bold text-text-main">
              구독 중이 아니에요
            </Text>
            <Text className="mt-2 text-center text-sm text-text-sub">
              구독하면 모든 동화를 무제한으로{"\n"}감상할 수 있어요
            </Text>
            <View className="mt-6 w-full">
              <Button
                onPress={() => router.push("/subscription")}
                fullWidth
                size="lg"
              >
                구독 시작하기
              </Button>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-6"
          onPress={() => setShowCancelModal(false)}
        >
          <Pressable
            className="w-full rounded-2xl bg-white p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold text-text-main">
              구독 해지
            </Text>
            <Text className="mt-2 text-sm text-text-sub">
              정말 구독을 해지하시겠습니까?{"\n"}
              해지 후에도 {subscription ? formatDate(subscription.expiresAt) : "만료일"}까지 이용 가능합니다.
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onPress={() => setShowCancelModal(false)}
              >
                취소
              </Button>
              <Pressable
                onPress={handleCancelSubscription}
                disabled={cancelSubscription.isPending}
                className="flex-1 items-center justify-center rounded-xl bg-error py-3"
                style={cancelSubscription.isPending ? { opacity: 0.5 } : undefined}
              >
                <Text className="font-bold text-white">
                  {cancelSubscription.isPending ? "처리 중..." : "해지하기"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
