import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAuthStore } from "@/stores/authStore";

const ONBOARDING_COMPLETED_KEY = "ddukddak_onboarding_completed";

export default function SplashScreen() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || !isInitialized) return;

    const navigate = async () => {
      if (user) {
        router.replace("/(tabs)/home");
        return;
      }

      const onboardingCompleted = await AsyncStorage.getItem(
        ONBOARDING_COMPLETED_KEY
      );

      if (onboardingCompleted) {
        router.replace("/login");
      } else {
        router.replace("/onboarding");
      }
    };

    navigate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isInitialized, user?.id]);

  return (
    <View className="flex-1 bg-background">
      <Animated.View entering={FadeIn.duration(1000)} className="flex-1">
        <Image
          source={require("../assets/images/ddukddak-splash-high.png")}
          style={{ flex: 1 }}
          contentFit="cover"
          accessibilityLabel="뚝딱동화 스플래시"
        />
      </Animated.View>
    </View>
  );
}
