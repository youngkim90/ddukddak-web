import { useRef } from "react";
import { View, PanResponder } from "react-native";

interface VolumeSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
}

export function VolumeSlider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
}: VolumeSliderProps) {
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
  const trackWidth = useRef(0);

  const calcValue = (locationX: number) => {
    if (trackWidth.current <= 0) return;
    const ratio = Math.max(0, Math.min(1, locationX / trackWidth.current));
    const newValue = ratio * (maximumValue - minimumValue) + minimumValue;
    onValueChange(Math.round(newValue));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => calcValue(e.nativeEvent.locationX),
      onPanResponderMove: (e) => calcValue(e.nativeEvent.locationX),
    })
  ).current;

  return (
    <View
      className="h-10 justify-center"
      onLayout={(e) => {
        trackWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <View className="h-2 rounded-full bg-gray-200">
        <View
          className="h-2 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
        <View
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-primary shadow"
          style={{ left: `${percentage}%`, marginLeft: -10 }}
        />
      </View>
    </View>
  );
}
