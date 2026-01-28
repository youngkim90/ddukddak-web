import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import { Button, Input, Checkbox } from "@/components/ui";
import { Header } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";

function ValidationItem({ valid, label }: { valid: boolean; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {valid ? (
        <Check size={14} color="#34C759" />
      ) : (
        <X size={14} color="#888888" />
      )}
      <Text
        className={valid ? "text-xs text-success" : "text-xs text-text-sub"}
      >
        {label}
      </Text>
    </View>
  );
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupScreen() {
  const router = useRouter();
  const { signUpWithEmail, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const isEmailValid = validateEmail(email);

  const passwordValidation = useMemo(
    () => ({
      hasMinLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    }),
    [password]
  );

  const isPasswordValid =
    passwordValidation.hasMinLength &&
    passwordValidation.hasLetter &&
    passwordValidation.hasNumber;
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const isFormValid =
    isEmailValid && isPasswordValid && passwordsMatch && agreeTerms && agreePrivacy;

  const handleSignup = async () => {
    if (!isFormValid) return;
    clearError();
    const result = await signUpWithEmail(email, password);
    if (result.success) {
      Alert.alert(
        "회원가입 완료",
        "확인 이메일을 보냈습니다. 이메일을 확인해 주세요.",
        [{ text: "확인", onPress: () => router.replace("/login") }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header title="회원가입" showBack />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-6"
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <View className="rounded-lg bg-[#FFF0F0] p-3 mb-4">
            <Text className="text-sm text-error">{error}</Text>
          </View>
        )}

        <View className="gap-4">
          <View className="gap-1.5">
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
              error={
                showValidation && email && !isEmailValid
                  ? "올바른 이메일 형식을 입력해주세요"
                  : undefined
              }
            />
          </View>

          <View className="gap-1.5">
            <Input
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setShowValidation(true);
              }}
              type="password"
              disabled={isLoading}
            />
            {password.length > 0 && (
              <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
                <ValidationItem
                  valid={passwordValidation.hasMinLength}
                  label="8자 이상"
                />
                <ValidationItem
                  valid={passwordValidation.hasLetter}
                  label="영문 포함"
                />
                <ValidationItem
                  valid={passwordValidation.hasNumber}
                  label="숫자 포함"
                />
              </View>
            )}
          </View>

          <View className="gap-1.5">
            <Input
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              type="password"
              disabled={isLoading}
              error={
                confirmPassword && !passwordsMatch
                  ? "비밀번호가 일치하지 않습니다"
                  : undefined
              }
            />
            {confirmPassword.length > 0 && passwordsMatch && (
              <View className="flex-row items-center gap-1.5 mt-1">
                <Check size={14} color="#34C759" />
                <Text className="text-xs text-success">
                  비밀번호가 일치합니다
                </Text>
              </View>
            )}
          </View>

          <View className="mt-2 gap-3">
            <Text className="text-base font-semibold text-text-main">
              약관 동의
            </Text>
            <Checkbox
              checked={agreeTerms}
              onToggle={() => setAgreeTerms((p) => !p)}
              label="[필수] 이용약관에 동의합니다"
            />
            <Checkbox
              checked={agreePrivacy}
              onToggle={() => setAgreePrivacy((p) => !p)}
              label="[필수] 개인정보 처리방침에 동의합니다"
            />
            <Checkbox
              checked={agreeMarketing}
              onToggle={() => setAgreeMarketing((p) => !p)}
              label="[선택] 마케팅 정보 수신에 동의합니다"
            />
          </View>

          <View className="mt-4">
            <Button
              onPress={handleSignup}
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={!isFormValid}
            >
              가입하기
            </Button>
          </View>

          <View className="flex-row items-center justify-center gap-1 mt-2">
            <Text className="text-sm text-text-sub">
              이미 계정이 있으신가요?
            </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text className="text-sm font-bold text-primary">로그인</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
