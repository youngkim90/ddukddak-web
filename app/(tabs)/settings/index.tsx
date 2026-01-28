import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  User,
  CreditCard,
  Bell,
  Megaphone,
  Headphones,
  FileText,
  ChevronRight,
} from "lucide-react-native";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteAccount } from "@/hooks/useUser";
import { useAuthStore } from "@/stores/authStore";

const menuSections = [
  {
    items: [
      { id: "profile", label: "👤 프로필 관리", icon: User, route: "/(tabs)/settings/profile" },
      { id: "subscription", label: "💳 구독 관리", icon: CreditCard, route: "/(tabs)/settings/subscription" },
      { id: "notifications", label: "🔔 알림 설정", icon: Bell, route: null },
    ],
  },
  {
    items: [
      { id: "notice", label: "📢 공지사항", icon: Megaphone, route: null },
      { id: "support", label: "💬 고객센터", icon: Headphones, route: null },
      { id: "terms", label: "📄 이용약관", icon: FileText, route: null },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuth();
  const deleteAccount = useDeleteAccount();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      setShowDeleteModal(false);
      router.replace("/login");
    } catch (error) {
      Alert.alert("오류", "회원 탈퇴에 실패했습니다.");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        {/* Profile Section */}
        <View className="items-center bg-white py-6">
          <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-[#E6E6E6] overflow-hidden">
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 60, height: 60 }}
                contentFit="cover"
              />
            ) : (
              <User size={32} color="#999999" />
            )}
          </View>
          <Text className="mt-3 text-lg font-bold text-text-main">
            {user?.nickname || "사용자"}
          </Text>
          <Text className="mt-1 text-sm text-text-sub">{user?.email || ""}</Text>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mt-3">
            {section.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => item.route && router.push(item.route as never)}
                className="flex-row items-center justify-between bg-white px-5 py-4"
              >
                <Text className="text-base text-text-main">{item.label}</Text>
                <ChevronRight size={20} color="#B3B3B3" />
              </Pressable>
            ))}
          </View>
        ))}

        {/* Logout */}
        <View className="mt-3">
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="bg-white px-5 py-4"
            style={isLoggingOut ? { opacity: 0.5 } : undefined}
          >
            <Text className="text-text-sub">
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </Text>
          </Pressable>
        </View>

        {/* Delete Account */}
        <Pressable
          onPress={() => setShowDeleteModal(true)}
          className="px-5 py-2 mt-3"
        >
          <Text className="text-sm text-[#B3B3B3]">회원탈퇴</Text>
        </Pressable>

        {/* App Version */}
        <Text className="mt-8 text-center text-xs text-[#B3B3B3] pb-4">
          버전 1.0.0
        </Text>
      </ScrollView>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-6"
          onPress={() => setShowDeleteModal(false)}
        >
          <Pressable
            className="w-full rounded-2xl bg-white p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold text-text-main">
              회원 탈퇴
            </Text>
            <Text className="mt-2 text-sm text-text-sub">
              정말 탈퇴하시겠습니까?{"\n"}탈퇴 후 모든 데이터가 삭제되며 복구할 수 없습니다.
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onPress={() => setShowDeleteModal(false)}
              >
                취소
              </Button>
              <Pressable
                onPress={handleDelete}
                disabled={deleteAccount.isPending}
                className="flex-1 items-center justify-center rounded-xl bg-error py-3"
                style={deleteAccount.isPending ? { opacity: 0.5 } : undefined}
              >
                <Text className="font-bold text-white">
                  {deleteAccount.isPending ? "처리 중..." : "탈퇴하기"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
