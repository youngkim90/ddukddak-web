import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: "text" | "email" | "password";
  error?: string;
  disabled?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric";
  maxLength?: number;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  type = "text",
  error,
  disabled = false,
  autoCapitalize = "none",
  keyboardType,
  maxLength,
  className,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const effectiveKeyboardType =
    keyboardType || (type === "email" ? "email-address" : "default");

  return (
    <View className={cn("gap-1.5", className)}>
      {label && (
        <Text className="text-sm font-bold text-text-main">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          className={cn(
            "rounded-lg border bg-white px-4 py-3 text-base text-text-main",
            error ? "border-error" : "border-[#E0E0E0]",
            disabled && "opacity-50"
          )}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={autoCapitalize}
          keyboardType={effectiveKeyboardType}
          editable={!disabled}
          maxLength={maxLength}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-3"
            accessibilityLabel={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? (
              <EyeOff size={20} color="#888888" />
            ) : (
              <Eye size={20} color="#888888" />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text className="text-sm text-error">{error}</Text>}
    </View>
  );
}
