import React from "react";
import { View, Text, Pressable } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-background p-6">
          <Text className="text-4xl">😢</Text>
          <Text className="mt-4 text-lg font-bold text-text-main">
            문제가 발생했어요
          </Text>
          <Text className="mt-2 text-center text-sm text-text-sub">
            잠시 후 다시 시도해 주세요
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            className="mt-6 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-bold text-white">다시 시도</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
