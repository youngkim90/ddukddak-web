"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Implement actual login logic with Supabase
    console.log("Login:", { email, password });
    router.push("/home");
  }

  function handleKakaoLogin() {
    // TODO: Implement Kakao OAuth
    console.log("Kakao login");
  }

  function handleGoogleLogin() {
    // TODO: Implement Google OAuth
    console.log("Google login");
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center pt-8">
          <div className="mb-4 size-20 rounded-full bg-[#FF9500]" />
          <h1 className="text-[28px] font-bold text-[#333333]">뚝딱동화</h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="lg" fullWidth>
            로그인
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#E5E5E5]" />
          <span className="text-sm text-[#888888]">또는</span>
          <div className="h-px flex-1 bg-[#E5E5E5]" />
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="kakao"
            size="lg"
            fullWidth
            onClick={handleKakaoLogin}
          >
            카카오로 시작
          </Button>
          <Button
            type="button"
            variant="google"
            size="lg"
            fullWidth
            onClick={handleGoogleLogin}
          >
            Google로 시작
          </Button>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#888888]">
          <Link href="/forgot-password" className="hover:text-[#333333]">
            비밀번호 찾기
          </Link>
          <span>|</span>
          <Link href="/signup" className="hover:text-[#333333]">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
