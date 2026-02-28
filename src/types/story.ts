// API 응답 타입 (코난님 API 명세서 기준)

export type StoryCategory = "folktale" | "lesson" | "family" | "adventure" | "creativity";
export type AgeGroup = "3-5" | "5-7" | "7+";

export interface Story {
  id: string;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  thumbnailUrl: string;
  category: StoryCategory;
  ageGroup: AgeGroup;
  durationMinutes: number;
  pageCount: number;
  isFree: boolean;
  bgmUrl?: string;
  createdAt: string;
}

export interface Sentence {
  sentenceIndex: number;
  textKo?: string;
  textEn?: string;
  audioUrlKo?: string;
  audioUrlEn?: string;
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  textKo: string;
  textEn: string;
  audioUrlKo?: string;
  audioUrlEn?: string;
  mediaType?: "image" | "video";
  videoUrl?: string;
  sentences: Sentence[];
}

export interface StoryPagesResponse {
  storyId: string;
  pages: StoryPage[];
}

export interface StoriesResponse {
  stories: Story[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 사용자 타입
export interface User {
  id: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  provider: "email" | "kakao" | "google" | "apple";
  createdAt: string;
}

// 구독 타입
export type SubscriptionStatus = "active" | "cancelled" | "expired";
export type PlanType = "monthly" | "yearly";

export interface Subscription {
  id: string;
  planType: PlanType;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
}

export interface SubscriptionPlan {
  id: PlanType | "free";
  name: string;
  price: number;
  period: string;
  features: string[];
}

// 진행률 타입
export interface Progress {
  storyId: string;
  storyTitle: string;
  currentPage: number;
  totalPages: number;
  isCompleted: boolean;
  lastReadAt: string;
}

// API 에러 타입
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
