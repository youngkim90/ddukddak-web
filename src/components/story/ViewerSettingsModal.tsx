import { Modal, Pressable, View, Text } from "react-native";
import { VolumeSlider } from "@/components/ui/VolumeSlider";

interface ViewerSettingsModalProps {
  visible: boolean;
  ttsVolume: number;
  bgmVolume: number;
  autoPlayEnabled: boolean;
  onClose: () => void;
  onTtsVolumeChange: (value: number) => void;
  onBgmVolumeChange: (value: number) => void;
  onToggleAutoPlay: () => void;
}

export function ViewerSettingsModal({
  visible,
  ttsVolume,
  bgmVolume,
  autoPlayEnabled,
  onClose,
  onTtsVolumeChange,
  onBgmVolumeChange,
  onToggleAutoPlay,
}: ViewerSettingsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={onClose}>
        <Pressable className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6" onPress={(e) => e.stopPropagation()}>
          <Text className="mb-4 text-lg font-bold text-text-main">설정</Text>

          <View className="mb-4">
            <Text className="mb-2 text-sm text-text-sub">TTS 볼륨</Text>
            <VolumeSlider
              value={ttsVolume}
              onValueChange={onTtsVolumeChange}
              minimumValue={0}
              maximumValue={100}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm text-text-sub">BGM 볼륨</Text>
            <VolumeSlider
              value={bgmVolume}
              onValueChange={onBgmVolumeChange}
              minimumValue={0}
              maximumValue={100}
            />
          </View>

          <View className="flex-row items-center justify-between border-b border-[#F0F0F0] py-3">
            <Text className="text-sm text-text-sub">자동 넘김</Text>
            <Pressable
              onPress={onToggleAutoPlay}
              className={`h-6 w-11 rounded-full p-0.5 ${autoPlayEnabled ? "bg-primary" : "bg-[#D9D9D9]"}`}
              accessibilityRole="switch"
              accessibilityState={{ checked: autoPlayEnabled }}
              accessibilityLabel="자동 넘김 토글"
            >
              <View
                className="h-5 w-5 rounded-full bg-white"
                style={{ alignSelf: autoPlayEnabled ? "flex-end" : "flex-start" }}
              />
            </Pressable>
          </View>

          <Pressable onPress={onClose} className="mt-6 items-center rounded-xl bg-primary py-3">
            <Text className="font-bold text-white">닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
