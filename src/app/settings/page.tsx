"use client";

import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Bell,
  Megaphone,
  Headphones,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { TabBar } from "@/components/layout";

// Mock user data
const mockUser = {
  name: "김뚝딱",
  email: "ddukddak@email.com",
  profileImage: null as string | null,
};

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

  function handleLogout() {
    // TODO: Implement actual logout with Supabase
    console.log("Logout");
    router.push("/login");
  }

  function handleDeleteAccount() {
    // TODO: Implement account deletion
    console.log("Delete account");
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
          {mockUser.profileImage ? (
            <img
              src={mockUser.profileImage}
              alt="프로필"
              className="size-full rounded-full object-cover"
            />
          ) : (
            <User className="size-8 text-[#999999]" aria-hidden="true" />
          )}
        </div>
        <p className="mt-3 text-lg font-bold text-[#333333]">{mockUser.name}</p>
        <p className="mt-1 text-sm text-[#808080]">{mockUser.email}</p>
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
            className="flex w-full items-center bg-white px-5 py-4 transition-colors hover:bg-[#F9F9F9]"
          >
            <span className="text-[#808080]">로그아웃</span>
          </button>
        </nav>

        {/* Delete Account */}
        <button
          onClick={handleDeleteAccount}
          className="px-5 py-2 text-left text-sm text-[#B3B3B3] transition-colors hover:text-[#999999]"
        >
          회원탈퇴
        </button>

        {/* App Version */}
        <p className="mt-auto pt-8 text-center text-xs text-[#B3B3B3]">
          버전 1.0.0
        </p>
      </main>

      <TabBar />
    </div>
  );
}
