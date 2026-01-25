"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// 기본 스켈레톤
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gray-200",
        className
      )}
      style={style}
    />
  );
}

// 스토리 카드 스켈레톤
export function StoryCardSkeleton() {
  return (
    <div className="w-[140px] flex-shrink-0">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-1 h-3 w-1/2" />
    </div>
  );
}

// 스토리 목록 스켈레톤 (가로 스크롤)
export function StoryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <StoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

// 스토리 상세 스켈레톤
export function StoryDetailSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// 텍스트 스켈레톤
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// 아바타 스켈레톤
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      className="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}

// 카드 스켈레톤
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  );
}

// 버튼 스켈레톤
export function ButtonSkeleton({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-12 w-full rounded-xl", className)} />
  );
}
