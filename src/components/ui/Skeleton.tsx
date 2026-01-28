import { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({ className, style }: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[animatedStyle, style]}
      className={cn("rounded-lg bg-[#E5E5E5]", className)}
    />
  );
}

export function StoryCardSkeleton() {
  return (
    <View className="w-36">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <Skeleton className="mt-2 h-4 w-24 rounded" />
    </View>
  );
}

export function StoryListSkeleton() {
  return (
    <View className="flex-row gap-3 px-5">
      <StoryCardSkeleton />
      <StoryCardSkeleton />
      <StoryCardSkeleton />
    </View>
  );
}

export function StoryDetailSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <Skeleton className="aspect-video w-full" />
      <View className="gap-3 p-5">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="mt-2 h-20 w-full rounded-xl" />
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
      </View>
    </View>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 rounded"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </View>
  );
}

export function AvatarSkeleton({ size = 48 }: { size?: number }) {
  return (
    <Skeleton
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}

export function CardSkeleton() {
  return (
    <View className="rounded-2xl bg-white p-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <View className="mt-3 gap-2">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </View>
    </View>
  );
}

export function ButtonSkeleton() {
  return <Skeleton className="h-12 w-full rounded-xl" />;
}
