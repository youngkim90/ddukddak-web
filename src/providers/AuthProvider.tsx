import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { usersApi, subscriptionsApi } from "@/lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSubscription, setInitialized, reset } = useAuthStore();

  useEffect(() => {
    // 세션 초기화
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          try {
            const user = await usersApi.getMe();
            setUser(user);

            try {
              const subscription = await subscriptionsApi.getMe();
              setSubscription(subscription);
            } catch {
              setSubscription(null);
            }
          } catch {
            reset();
          }
        } else {
          reset();
        }
      } catch {
        reset();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();

    // 인증 상태 변경 리스너
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        try {
          const user = await usersApi.getMe();
          setUser(user);

          const subscription = await subscriptionsApi.getMe();
          setSubscription(subscription);
        } catch {
          // 사용자 정보 조회 실패 시 무시
        }
      } else if (event === "SIGNED_OUT") {
        reset();
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  }, [setUser, setSubscription, setInitialized, reset]);

  return <>{children}</>;
}
