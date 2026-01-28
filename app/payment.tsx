import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CreditCard, Check } from "lucide-react-native";
import { Header } from "@/components/layout";
import { Button, Checkbox } from "@/components/ui";

const paymentMethods = [
  { id: "card", name: "신용/체크카드", icon: "💳" },
  { id: "simple", name: "간편결제 (카카오페이, 네이버페이)", icon: "📱" },
];

const plans: Record<string, { name: string; price: number; period: string; description: string; billingCycle: string }> = {
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

export default function PaymentScreen() {
  const router = useRouter();
  const { plan: planType } = useLocalSearchParams<{ plan: string }>();
  const plan = plans[(planType as "monthly" | "yearly") || "monthly"];

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!agreeTerms || !selectedMethod) return;

    setIsProcessing(true);

    // TODO: 실제 결제 SDK 연동
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert("결제 완료", "구독이 시작되었습니다!", [
        { text: "확인", onPress: () => router.replace("/(tabs)/home") },
      ]);
    }, 2000);
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="결제" showBack />

      <ScrollView className="flex-1" contentContainerClassName="px-5 py-5">
        {/* Selected Plan */}
        <View className="mb-5">
          <Text className="mb-3 font-bold text-text-main">선택한 플랜</Text>
          <View className="rounded-xl bg-[#FFF2D9] p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-primary">{plan.name}</Text>
                <Text className="text-sm text-text-sub">{plan.description}</Text>
              </View>
              <Text className="text-lg font-bold text-text-main">
                ₩{plan.price.toLocaleString()}/{plan.period}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="mb-5">
          <Text className="mb-3 font-bold text-text-main">결제 수단</Text>
          <View className="gap-2">
            {paymentMethods.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                className={`flex-row items-center gap-3 rounded-xl border-2 p-4 ${
                  selectedMethod === method.id
                    ? "border-primary bg-white"
                    : "border-[#E0E0E0] bg-white"
                }`}
              >
                <Text className="text-xl">{method.icon}</Text>
                <Text className="flex-1 text-base text-text-main">
                  {method.name}
                </Text>
                {selectedMethod === method.id && (
                  <Check size={20} color="#FF9500" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Payment Summary */}
        <View className="mb-5 rounded-xl bg-[#F2F2F2] p-4">
          <Text className="mb-3 font-bold text-text-main">결제 정보</Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-text-sub">상품명</Text>
              <Text className="text-sm font-semibold text-text-main">
                뚝딱동화 {plan.name}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-text-sub">결제 주기</Text>
              <Text className="text-sm text-text-main">{plan.billingCycle}</Text>
            </View>
            <View className="flex-row items-center justify-between border-t border-[#E5E5E5] pt-3">
              <Text className="text-sm font-bold text-text-main">결제 금액</Text>
              <Text className="text-lg font-bold text-primary">
                ₩{plan.price.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <Checkbox
          checked={agreeTerms}
          onToggle={() => setAgreeTerms((p) => !p)}
          label="결제 조건 및 구독 약관에 동의합니다"
        />
      </ScrollView>

      <View className="px-5 pb-8 pt-3 bg-background">
        <Button
          onPress={handlePayment}
          fullWidth
          size="lg"
          loading={isProcessing}
          disabled={!agreeTerms}
        >
          {isProcessing ? "결제 처리 중..." : `₩${plan.price.toLocaleString()} 결제하기`}
        </Button>
        <Text className="mt-3 text-center text-xs text-[#999999]">
          토스페이먼츠로 안전하게 결제됩니다
        </Text>
      </View>
    </View>
  );
}
