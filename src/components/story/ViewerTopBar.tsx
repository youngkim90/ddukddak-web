import { View, Pressable } from "react-native";
import { X, Settings } from "lucide-react-native";

interface ViewerTopBarProps {
  onClose: () => void;
  onOpenSettings: () => void;
}

export function ViewerTopBar({ onClose, onOpenSettings }: ViewerTopBarProps) {
  return (
    <View className="flex-row items-center justify-between bg-black/20 px-4 py-2 pt-4">
      <Pressable
        onPress={onClose}
        className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
        accessibilityLabel="닫기"
      >
        <X size={24} color="#FFFFFFD9" />
      </Pressable>
      <Pressable
        onPress={onOpenSettings}
        className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
        accessibilityLabel="설정"
      >
        <Settings size={24} color="#FFFFFFD9" />
      </Pressable>
    </View>
  );
}
