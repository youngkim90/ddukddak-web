import { useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { usersApi, subscriptionsApi, progressApi } from "@/lib/api";

// 네이티브에서만 팝업 세션 완료 처리 (웹은 리다이렉트 방식 사용)
if (Platform.OS !== "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export function useAuth() {
  const router = useRouter();
  const { user, subscription, setUser, setSubscription, reset } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이메일 로그인
  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // 사용자 정보 조회
      const userData = await usersApi.getMe();
      setUser(userData);

      // 구독 정보 조회
      try {
        const subscriptionData = await subscriptionsApi.getMe();
        setSubscription(subscriptionData);
      } catch {
        setSubscription(null);
      }

      // 로그인 시 전체 진행률 초기화
      try { await progressApi.resetAll(); } catch {}

      router.replace("/(tabs)/home");
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인에 실패했습니다";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 회원가입
  const signUpWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "회원가입에 실패했습니다";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth 로그인 (카카오, 구글)
  const signInWithOAuth = async (provider: "kakao" | "google") => {
    setIsLoading(true);
    setError(null);

    try {
      const redirectUrl = Linking.createURL("auth/callback");

      if (Platform.OS === "web") {
        // 웹: 페이지 리다이렉트 방식 (COOP 정책으로 팝업 통신 불가)
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (authError) {
          throw new Error(authError.message);
        }

        // 리다이렉트되므로 이 아래 코드는 실행되지 않음
        return { success: true };
      }

      // 네이티브: 팝업(인앱 브라우저) 방식
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === "success" && result.url) {
          const url = new URL(result.url);
          const params = new URLSearchParams(
            url.hash ? url.hash.substring(1) : url.search.substring(1)
          );
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

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

            // 로그인 시 전체 진행률 초기화
            try { await progressApi.resetAll(); } catch {}

            router.replace("/(tabs)/home");
          }
        }
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "소셜 로그인에 실패했습니다";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const signOut = async () => {
    setIsLoading(true);

    try {
      await supabase.auth.signOut();
      reset();
      router.replace("/login");
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그아웃에 실패했습니다";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      const userData = await usersApi.getMe();
      setUser(userData);

      const subscriptionData = await subscriptionsApi.getMe();
      setSubscription(subscriptionData);
    } catch {
      // 실패 시 무시
    }
  };

  return {
    user,
    subscription,
    isLoading,
    error,
    isLoggedIn: user !== null,
    isSubscribed: subscription?.status === "active",
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    refreshUser,
    clearError: () => setError(null),
  };
}
