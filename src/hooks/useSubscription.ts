import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

// 구독 플랜 목록 조회
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: () => subscriptionsApi.getPlans(),
  });
}

// 내 구독 정보 조회
export function useMySubscription() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["mySubscription"],
    queryFn: () => subscriptionsApi.getMe(),
    enabled: !!user,
  });
}

// 구독 해지
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const setSubscription = useAuthStore((s) => s.setSubscription);

  return useMutation({
    mutationFn: () => subscriptionsApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
      setSubscription(null);
    },
  });
}

// 구독 시작
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const setSubscription = useAuthStore((s) => s.setSubscription);

  return useMutation({
    mutationFn: (data: { planType: string; billingKey: string }) =>
      subscriptionsApi.create(data),
    onSuccess: (subscription) => {
      queryClient.invalidateQueries({ queryKey: ["mySubscription"] });
      setSubscription(subscription);
    },
  });
}
