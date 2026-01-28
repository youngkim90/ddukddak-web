import { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Link } from "expo-router";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const { signInWithEmail, signInWithOAuth, isLoading, error, clearError } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    await signInWithEmail(email, password);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Text className="text-3xl font-bold text-white">뚝</Text>
          </View>
          <Text className="mt-4 text-[28px] font-bold text-text-main">뚝딱동화</Text>
          <Text className="mt-2 text-sm text-text-sub">
            AI가 만드는 우리 아이 맞춤 동화
          </Text>
        </View>

        <View className="mt-10 gap-4">
          {error && (
            <View className="rounded-lg bg-[#FFF0F0] p-3">
              <Text className="text-sm text-error">{error}</Text>
            </View>
          )}

          <Input
            label="이메일"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearError();
            }}
            type="email"
            keyboardType="email-address"
            disabled={isLoading}
          />

          <Input
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearError();
            }}
            type="password"
            disabled={isLoading}
          />

          <Button
            onPress={handleLogin}
            fullWidth
            size="lg"
            loading={isLoading}
            disabled={!email || !password}
          >
            로그인
          </Button>
        </View>

        <View className="mt-6 flex-row items-center gap-3">
          <View className="flex-1 h-px bg-[#E5E5E5]" />
          <Text className="text-sm text-text-sub">또는</Text>
          <View className="flex-1 h-px bg-[#E5E5E5]" />
        </View>

        <View className="mt-6 gap-3">
          <Button
            variant="kakao"
            fullWidth
            size="lg"
            onPress={() => {
              clearError();
              signInWithOAuth("kakao");
            }}
            disabled={isLoading}
          >
            <Text className="font-bold text-[#191919]">카카오로 시작</Text>
          </Button>

          <Button
            variant="google"
            fullWidth
            size="lg"
            onPress={() => {
              clearError();
              signInWithOAuth("google");
            }}
            disabled={isLoading}
          >
            <Text className="font-bold text-text-main">Google로 시작</Text>
          </Button>
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-2">
          <Pressable onPress={() => Alert.alert("비밀번호 찾기", "비밀번호 재설정 링크를 이메일로 보내드립니다.\n로그인 화면에서 이메일을 입력한 후 이용해주세요.")}>
            <Text className="text-sm text-text-sub">비밀번호 찾기</Text>
          </Pressable>
          <Text className="text-sm text-text-sub">|</Text>
          <Link href="/signup" asChild>
            <Pressable>
              <Text className="text-sm text-text-sub">회원가입</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
