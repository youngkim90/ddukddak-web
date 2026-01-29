import { View, Pressable } from "react-native";

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

  function handlePress(event: { nativeEvent: { locationX: number } }, width: number) {
    if (width > 0) {
      const newValue = (event.nativeEvent.locationX / width) * (maximumValue - minimumValue) + minimumValue;
      const clampedValue = Math.max(minimumValue, Math.min(maximumValue, newValue));
      onValueChange(clampedValue);
    }
  }

  return (
    <View
      className="h-10 justify-center"
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        // Store width for press handling
        (e.target as any)._width = width;
      }}
    >
      <Pressable
        className="h-2 rounded-full bg-gray-200"
        onPress={(event) => {
          const target = event.currentTarget as any;
          target.measure((_x: number, _y: number, width: number) => {
            handlePress(event, width);
          });
        }}
      >
        <View
          className="h-2 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
        <View
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-primary shadow"
          style={{ left: `${percentage}%`, marginLeft: -10 }}
        />
      </Pressable>
    </View>
  );
}
