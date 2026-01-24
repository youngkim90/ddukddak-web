"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui";

// Mock user data
const mockUser = {
  profileImage: null as string | null,
  nickname: "김뚝딱",
  email: "ddukddak@email.com",
};

export default function ProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState(mockUser.nickname);
  const [isSaving, setIsSaving] = useState(false);

  function handleSave() {
    setIsSaving(true);
    // TODO: API call to update profile
    setTimeout(() => {
      setIsSaving(false);
      router.back();
    }, 1000);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF9F0]">
      {/* Header */}
      <header className="flex items-center gap-3 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-[#F5F5F5]"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-6 text-[#333333]" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold text-[#333333]">프로필 관리</h1>
      </header>

      {/* Content */}
      <main className="flex-1 p-5">
        {/* Profile Image */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative">
            <div className="flex size-[100px] items-center justify-center overflow-hidden rounded-full bg-[#E6E6E6]">
              {mockUser.profileImage ? (
                <img
                  src={mockUser.profileImage}
                  alt="프로필 이미지"
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-12 text-[#999999]" aria-hidden="true" />
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 flex size-[30px] items-center justify-center rounded-full bg-[#FF9500] text-sm text-white shadow-md transition-colors hover:bg-[#E88600]"
              aria-label="프로필 이미지 변경"
            >
              ✎
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Nickname */}
          <div>
            <label
              htmlFor="nickname"
              className="mb-2 block text-sm font-semibold text-[#666666]"
            >
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={10}
              className="w-full rounded-lg border border-[#D9D9D9] bg-white px-4 py-3 text-[#333333] outline-none transition-colors focus:border-[#FF9500]"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#666666]"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={mockUser.email}
              disabled
              className="w-full rounded-lg border border-[#D9D9D9] bg-white px-4 py-3 text-[#333333] opacity-60"
            />
          </div>
        </div>
      </main>

      {/* Bottom Save Button */}
      <div className="p-5">
        <Button
          onClick={handleSave}
          disabled={isSaving || nickname.trim() === ""}
          className="w-full"
        >
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
