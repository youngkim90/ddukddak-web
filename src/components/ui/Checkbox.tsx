import { Pressable, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onToggle,
  label,
  className,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      className={cn("flex-row items-center gap-2.5", className)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        className={cn(
          "h-5 w-5 items-center justify-center rounded border",
          checked
            ? "border-primary bg-primary"
            : "border-[#D0D0D0] bg-white"
        )}
      >
        {checked && <Check size={14} color="#FFFFFF" />}
      </View>
      {label && <Text className="flex-1 text-sm text-text-main">{label}</Text>}
    </Pressable>
  );
}
