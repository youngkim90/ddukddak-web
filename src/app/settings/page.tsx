"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Bell,
  Megaphone,
  Headphones,
  FileText,
  ChevronRight,
} from "lucide-react";
import { TabBar } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { useDeleteAccount } from "@/hooks/useUser";
import { Button } from "@/components/ui";

interface MenuItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface MenuSection {
  items: MenuItem[];
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const deleteAccount = useDeleteAccount();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuSections: MenuSection[] = [
    {
      items: [
        { id: "profile", icon: User, label: "👤 프로필 관리", href: "/settings/profile" },
        { id: "subscription", icon: CreditCard, label: "💳 구독 관리", href: "/settings/subscription" },
        { id: "notification", icon: Bell, label: "🔔 알림 설정", href: "/settings/notification" },
      ],
    },
    {
      items: [
        { id: "notice", icon: Megaphone, label: "📢 공지사항", href: "/settings/notice" },
        { id: "support", icon: Headphones, label: "💬 고객센터", href: "/settings/support" },
        { id: "terms", icon: FileText, label: "📄 이용약관", href: "/settings/terms" },
      ],
    },
  ];

  async function handleLogout() {
    await signOut();
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount.mutateAsync();
      router.push("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
    setShowDeleteModal(false);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF9F0] pb-20">
      {/* Header */}
      <header className="bg-white px-5 py-4">
        <h1 className="text-center text-lg font-bold text-[#333333]">설정</h1>
      </header>

      {/* Profile Section */}
      <section className="flex flex-col items-center bg-white py-6">
        <div className="flex size-[60px] items-center justify-center rounded-full bg-[#E6E6E6]">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="프로필"
              className="size-full rounded-full object-cover"
            />
          ) : (
            <User className="size-8 text-[#999999]" aria-hidden="true" />
          )}
        </div>
        <p className="mt-3 text-lg font-bold text-[#333333]">
          {user?.nickname || "사용자"}
        </p>
        <p className="mt-1 text-sm text-[#808080]">{user?.email || ""}</p>
      </section>

      {/* Menu Sections */}
      <main className="flex-1 space-y-3 p-4">
        {menuSections.map((section, sectionIndex) => (
          <nav key={sectionIndex}>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => item.href && router.push(item.href)}
                className="flex w-full items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-[#F9F9F9]"
              >
                <span className="text-[#333333]">{item.label}</span>
                <ChevronRight className="size-5 text-[#B3B3B3]" aria-hidden="true" />
              </button>
            ))}
          </nav>
        ))}

        {/* Logout Button */}
        <nav>
          <button
            onClick={handleLogout}
            disabled={authLoading}
            className="flex w-full items-center bg-white px-5 py-4 transition-colors hover:bg-[#F9F9F9] disabled:opacity-50"
          >
            <span className="text-[#808080]">
              {authLoading ? "로그아웃 중..." : "로그아웃"}
            </span>
          </button>
        </nav>

        {/* Delete Account */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2 text-left text-sm text-[#B3B3B3] transition-colors hover:text-[#999999]"
        >
          회원탈퇴
        </button>

        {/* App Version */}
        <p className="mt-auto pt-8 text-center text-xs text-[#B3B3B3]">
          버전 1.0.0
        </p>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2
              id="delete-modal-title"
              className="mb-2 text-lg font-bold text-[#333333]"
            >
              회원 탈퇴
            </h2>
            <p className="mb-6 text-sm text-[#888888]">
              정말 탈퇴하시겠습니까?
              <br />
              탈퇴 후 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteAccount.isPending}
                className="flex-1 bg-[#FF3B30] hover:bg-[#E02D22]"
              >
                {deleteAccount.isPending ? "처리 중..." : "탈퇴하기"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
