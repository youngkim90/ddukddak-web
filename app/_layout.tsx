import "../global.css";
import { useEffect } from "react";
import { View, Platform, useWindowDimensions } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuthStore } from "@/stores/authStore";
import {
  calculateContainerSize,
  CONTAINER_STYLE,
  BREAKPOINTS,
} from "@/lib/layout";

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";
    const inPublicGroup =
      segments[0] === undefined ||
      segments[0] === "onboarding" ||
      segments[0] === "auth" ||
      inAuthGroup;

    if (!user && !inPublicGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isInitialized, segments[0]]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = Font.useFonts({
    Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    Jua: require("../assets/fonts/Jua-Regular.ttf"),
    "Gaegu-Bold": require("../assets/fonts/Gaegu-Bold.ttf"),
    GowunDodum: require("../assets/fonts/GowunDodum-Regular.ttf"),
    NanumPenScript: require("../assets/fonts/NanumPenScript-Regular.ttf"),
  });
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 웹에서 반응형 컨테이너 크기 계산
  const containerSize = Platform.OS === "web"
    ? calculateContainerSize(windowWidth, windowHeight)
    : null;

  // 모바일 뷰포트에서는 디바이스 프레임 스타일 비활성화
  const isFullScreen = windowWidth <= BREAKPOINTS.mobile;

  if (!fontsLoaded) {
    return null;
  }

  const content = (
    <QueryProvider>
      <AuthProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="story/[id]" />
            <Stack.Screen
              name="story/[id]/viewer"
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="auth/callback" />
          </Stack>
        </AuthGuard>
      </AuthProvider>
    </QueryProvider>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {Platform.OS === "web" ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#E8E4DE",
          }}
        >
          <View
            style={{
              width: containerSize?.width,
              height: containerSize?.height,
              overflow: "hidden",
              // 디바이스 프레임 스타일 (모바일 전체화면에서는 비활성화)
              // 웹에서는 boxShadow CSS 사용 (shadow* props deprecated)
              ...(isFullScreen ? {} : {
                borderRadius: CONTAINER_STYLE.borderRadius,
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
              }),
            }}
          >
            {content}
          </View>
        </View>
      ) : (
        content
      )}
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
