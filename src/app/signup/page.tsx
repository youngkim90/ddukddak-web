"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Checkbox } from "@/components/ui";
import { Header } from "@/components/layout";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const isFormValid =
    email && password && passwordConfirm && agreeTerms && agreePrivacy;

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // TODO: Implement actual signup logic with Supabase
    console.log("Signup:", {
      email,
      password,
      agreeTerms,
      agreePrivacy,
      agreeMarketing,
    });
    router.push("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="회원가입" showBack />

      <div className="flex-1 px-6 py-6">
        <div className="mx-auto w-full max-w-md">
          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호 (8자 이상 영문+숫자)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />

            {/* Terms Section */}
            <div className="pt-4">
              <h2 className="mb-4 text-base font-semibold text-[#333333]">
                약관 동의
              </h2>
              <div className="space-y-3">
                <Checkbox
                  label="[필수] 이용약관에 동의합니다"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <Checkbox
                  label="[필수] 개인정보 처리방침에 동의합니다"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                <Checkbox
                  label="[선택] 마케팅 정보 수신에 동의합니다"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isFormValid}
              >
                가입하기
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
