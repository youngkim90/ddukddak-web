import { useEffect } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { usersApi, subscriptionsApi, progressApi } from "@/lib/api";

// 네이티브 전용: 팝업 세션 완료 처리
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { setUser, setSubscription } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (Platform.OS === "web") {
          // 웹: detectSessionInUrl: true 이므로 Supabase가 URL 해시에서 자동으로 세션 설정
          // onAuthStateChange가 SIGNED_IN 이벤트를 발생시키고 AuthProvider가 처리
          // 여기서는 세션이 설정될 때까지 잠시 대기
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            const userData = await usersApi.getMe();
            setUser(userData);
            try {
              const subscriptionData = await subscriptionsApi.getMe();
              setSubscription(subscriptionData);
            } catch {
              setSubscription(null);
            }
            try { await progressApi.resetAll(); } catch {}
            queryClient.removeQueries({ queryKey: ["progress"] });
            router.replace("/(tabs)/home");
          } else {
            // 세션이 아직 없으면 약간 대기 후 재확인 (Supabase 자동 감지 대기)
            await new Promise((r) => setTimeout(r, 1000));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession) {
              const userData = await usersApi.getMe();
              setUser(userData);
              try { await progressApi.resetAll(); } catch {}
              queryClient.removeQueries({ queryKey: ["progress"] });
              router.replace("/(tabs)/home");
            } else {
              router.replace("/login");
            }
          }
        } else {
          // 네이티브: 딥링크로 토큰이 쿼리 파라미터로 전달됨
          const accessToken = params.access_token as string;
          const refreshToken = params.refresh_token as string;

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            const userData = await usersApi.getMe();
            setUser(userData);
            try {
              const subscriptionData = await subscriptionsApi.getMe();
              setSubscription(subscriptionData);
            } catch {
              setSubscription(null);
            }
            try { await progressApi.resetAll(); } catch {}
            queryClient.removeQueries({ queryKey: ["progress"] });
          }

          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/login");
      }
    };

    handleCallback();
  }, [params, router, setUser, setSubscription]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#FF9500" />
      <Text className="mt-4 text-text-sub">로그인 중...</Text>
    </View>
  );
}
