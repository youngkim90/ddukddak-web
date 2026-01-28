import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { User, Camera } from "lucide-react-native";
import { Header } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { useUpdateProfile } from "@/hooks/useUser";
import { useAuthStore } from "@/stores/authStore";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [nickname, setNickname] = useState(user?.nickname || "");

  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user?.nickname]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ nickname });
      Alert.alert("완료", "프로필이 수정되었습니다.");
      router.back();
    } catch {
      Alert.alert("오류", "프로필 수정에 실패했습니다.");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title="프로필 관리" showBack />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="relative">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-[#F5F5F5]">
              <User size={40} color="#888888" />
            </View>
            <Pressable
              className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary"
              accessibilityLabel="프로필 사진 변경"
            >
              <Camera size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Input
            label="이메일"
            value={user?.email || ""}
            onChangeText={() => {}}
            disabled
          />

          <Input
            label="닉네임"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChangeText={setNickname}
            maxLength={10}
          />
        </View>

        <View className="mt-8">
          <Button
            onPress={handleSave}
            fullWidth
            size="lg"
            loading={updateProfile.isPending}
            disabled={!nickname || nickname === user?.nickname}
          >
            저장
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
