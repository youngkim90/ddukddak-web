"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function Header({ title, showBack = false, onBack, rightAction }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-4">
      {/* Left: Back button or spacer */}
      <div className="w-10">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="flex size-10 items-center justify-center text-[#333333]"
            aria-label="뒤로 가기"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
        )}
      </div>

      {/* Center: Title */}
      {title && (
        <h1 className="text-lg font-bold text-[#333333]">{title}</h1>
      )}

      {/* Right: Action or spacer */}
      <div className="flex w-10 justify-end">{rightAction}</div>
    </header>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}
