import { View } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated";
  className?: string;
}

export function Card({
  children,
  variant = "default",
  className,
}: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl bg-white p-4",
        variant === "elevated" && "shadow-md",
        className
      )}
    >
      {children}
    </View>
  );
}
