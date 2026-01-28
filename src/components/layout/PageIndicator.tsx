import { View } from "react-native";
import { cn } from "@/lib/utils";

interface PageIndicatorProps {
  total: number;
  current: number;
}

export function PageIndicator({ total, current }: PageIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={cn(
            "h-2 w-2 rounded-full",
            i === current ? "bg-primary" : "bg-[#D9D9D9]"
          )}
        />
      ))}
    </View>
  );
}
