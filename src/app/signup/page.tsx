"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button, Input, Checkbox } from "@/components/ui";
import { Header } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";

// 비밀번호 유효성 검사 함수
function validatePassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

// 이메일 유효성 검사 함수
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const isPasswordValid = passwordValidation.minLength && passwordValidation.hasLetter && passwordValidation.hasNumber;
  const isEmailValid = validateEmail(email);
  const isPasswordMatch = password === passwordConfirm && passwordConfirm.length > 0;

  const isFormValid =
    isEmailValid && isPasswordValid && isPasswordMatch && agreeTerms && agreePrivacy;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setShowValidation(true);
    clearError();
    setSuccessMessage(null);

    if (!isFormValid) {
      return;
    }

    const result = await signUpWithEmail(email, password);

    if (result.success) {
      setSuccessMessage("회원가입이 완료되었습니다. 이메일을 확인해주세요.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="회원가입" showBack />

      <div className="flex-1 px-6 py-6">
        <div className="mx-auto w-full max-w-md">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-[#34C759]">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-[#FF3B30]">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* 이메일 입력 */}
            <div>
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              {showValidation && email && !isEmailValid && (
                <p className="mt-1 text-sm text-[#FF3B30]">올바른 이메일 형식을 입력해주세요</p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowValidation(true);
                }}
                required
                disabled={isLoading}
              />
              {/* 비밀번호 유효성 검사 UI */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <ValidationItem
                    isValid={passwordValidation.minLength}
                    text="8자 이상"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasLetter}
                    text="영문 포함"
                  />
                  <ValidationItem
                    isValid={passwordValidation.hasNumber}
                    text="숫자 포함"
                  />
                </div>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <Input
                type="password"
                placeholder="비밀번호 확인"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={isLoading}
              />
              {passwordConfirm.length > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  {isPasswordMatch ? (
                    <>
                      <Check className="size-4 text-[#34C759]" aria-hidden="true" />
                      <span className="text-sm text-[#34C759]">비밀번호가 일치합니다</span>
                    </>
                  ) : (
                    <>
                      <X className="size-4 text-[#FF3B30]" aria-hidden="true" />
                      <span className="text-sm text-[#FF3B30]">비밀번호가 일치하지 않습니다</span>
                    </>
                  )}
                </div>
              )}
            </div>

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
                  disabled={isLoading}
                />
                <Checkbox
                  label="[필수] 개인정보 처리방침에 동의합니다"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  disabled={isLoading}
                />
                <Checkbox
                  label="[선택] 마케팅 정보 수신에 동의합니다"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                  disabled={isLoading}
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
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? "가입 중..." : "가입하기"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// 비밀번호 유효성 항목 컴포넌트
function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {isValid ? (
        <Check className="size-3.5 text-[#34C759]" aria-hidden="true" />
      ) : (
        <X className="size-3.5 text-[#888888]" aria-hidden="true" />
      )}
      <span className={`text-xs ${isValid ? "text-[#34C759]" : "text-[#888888]"}`}>
        {text}
      </span>
    </div>
  );
}
