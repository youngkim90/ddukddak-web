import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = params.access_token as string;
        const refreshToken = params.refresh_token as string;

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }

        router.replace("/(tabs)/home");
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/login");
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#FF9500" />
      <Text className="mt-4 text-text-sub">로그인 중...</Text>
    </View>
  );
}
