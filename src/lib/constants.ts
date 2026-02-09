import type { StoryCategory, AgeGroup } from "@/types/story";

// 카테고리 한글 매핑
export const CATEGORY_LABELS: Record<StoryCategory, string> = {
  folktale: "전래",
  lesson: "교훈",
  family: "가정",
  adventure: "모험",
  creativity: "창의",
};

// 카테고리별 기본 BGM (프론트에서 자체 처리)
export const CATEGORY_BGM: Record<StoryCategory, string> = {
  folktale: "/audio/bgm-traditional.mp3",
  lesson: "/audio/bgm-calm.mp3",
  family: "/audio/bgm-warm.mp3",
  adventure: "/audio/bgm-adventure.mp3",
  creativity: "/audio/bgm-playful.mp3",
};

// 카테고리별 테마 색상
export const CATEGORY_COLORS: Record<StoryCategory, string> = {
  folktale: "#FF6B6B", // 빨간색 (전래)
  lesson: "#34C759", // 초록색 (교훈)
  family: "#FF9500", // 주황색 (가정)
  adventure: "#5AC8FA", // 하늘색 (모험)
  creativity: "#AF52DE", // 보라색 (창의)
};

// 연령대 한글 매핑
export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  "3-5": "3-5세",
  "5-7": "5-7세",
  "7+": "7세 이상",
};

// 필터 옵션
export const CATEGORY_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "folktale", label: "전래" },
  { value: "family", label: "가정" },
  { value: "adventure", label: "모험" },
  { value: "creativity", label: "창의" },
] as const;

export const AGE_GROUP_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "3-5", label: "3-5세" },
  { value: "5-7", label: "5-7세" },
  { value: "7+", label: "7세 이상" },
] as const;

// MVP 무료 모드 (추후 구독 기능 활성화 시 false로 변경)
export const FREE_MODE =
  process.env.EXPO_PUBLIC_FREE_MODE !== "false";

// API 기본 설정
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";
