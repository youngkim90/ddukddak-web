import { Pressable, Text, ActivityIndicator } from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "kakao" | "google";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  primary: "bg-primary",
  secondary: "bg-[#5AC8FA]",
  outline: "bg-transparent border border-primary",
  ghost: "bg-transparent",
  kakao: "bg-[#FEE500]",
  google: "bg-white border border-[#E0E0E0]",
};

const variantTextStyles = {
  primary: "text-white font-bold",
  secondary: "text-white font-bold",
  outline: "text-primary font-bold",
  ghost: "text-text-sub",
  kakao: "text-[#191919] font-bold",
  google: "text-text-main font-bold",
};

const sizeStyles = {
  sm: "py-2 px-4 rounded-lg",
  md: "py-3 px-5 rounded-xl",
  lg: "py-4 px-6 rounded-xl",
};

const sizeTextStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        "items-center justify-center flex-row",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50",
        className
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#FFFFFF" : "#333333"}
        />
      ) : typeof children === "string" ? (
        <Text
          className={cn(variantTextStyles[variant], sizeTextStyles[size])}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
