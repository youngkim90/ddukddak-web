"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { usersApi, subscriptionsApi } from "@/lib/api";

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

      router.push("/home");
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
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        throw new Error(authError.message);
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
      router.push("/login");
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
