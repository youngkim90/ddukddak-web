"use client";

import { Component, ReactNode } from "react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center p-6">
          <div className="text-center">
            <p className="text-6xl">😢</p>
            <h2 className="mt-4 text-lg font-bold text-[#333333]">
              문제가 발생했어요
            </h2>
            <p className="mt-2 text-sm text-[#888888]">
              잠시 후 다시 시도해주세요
            </p>
            <Button onClick={this.handleRetry} className="mt-6">
              다시 시도
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
