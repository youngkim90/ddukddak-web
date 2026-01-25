/**
 * API 클라이언트
 *
 * 실제 연동 시 axios + supabase로 교체 예정
 * pnpm add axios @supabase/supabase-js
 */

import { API_BASE_URL } from "./constants";
import type {
  Story,
  StoriesResponse,
  StoryPagesResponse,
  User,
  Subscription,
  SubscriptionPlan,
  Progress,
  ApiError,
} from "@/types/story";

// 임시: 토큰 저장소 (실제로는 Supabase Auth 사용)
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// 기본 fetch 래퍼
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }

  return response.json();
}

// ==================== Users API ====================

export const usersApi = {
  /** 내 프로필 조회 */
  getMe: () => fetchApi<User>("/users/me"),

  /** 프로필 수정 */
  updateMe: (data: { nickname?: string; avatarUrl?: string }) =>
    fetchApi<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** 회원 탈퇴 */
  deleteMe: () =>
    fetchApi<void>("/users/me", {
      method: "DELETE",
    }),
};

// ==================== Stories API ====================

export interface StoriesQueryParams {
  category?: string;
  ageGroup?: string;
  page?: number;
  limit?: number;
}

export const storiesApi = {
  /** 동화 목록 조회 */
  getList: (params?: StoriesQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== "all") {
      searchParams.set("category", params.category);
    }
    if (params?.ageGroup && params.ageGroup !== "all") {
      searchParams.set("ageGroup", params.ageGroup);
    }
    if (params?.page) {
      searchParams.set("page", String(params.page));
    }
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }

    const query = searchParams.toString();
    return fetchApi<StoriesResponse>(`/stories${query ? `?${query}` : ""}`);
  },

  /** 동화 상세 조회 */
  getById: (id: string) => fetchApi<Story>(`/stories/${id}`),

  /** 동화 페이지 콘텐츠 조회 (구독 필요) */
  getPages: (id: string) => fetchApi<StoryPagesResponse>(`/stories/${id}/pages`),
};

// ==================== Progress API ====================

export const progressApi = {
  /** 내 진행률 목록 */
  getAll: () => fetchApi<{ data: Progress[] }>("/progress"),

  /** 특정 동화 진행률 조회 */
  getByStoryId: (storyId: string) =>
    fetchApi<Progress>(`/progress/${storyId}`),

  /** 진행률 저장 */
  save: (storyId: string, data: { currentPage: number; isCompleted: boolean }) =>
    fetchApi<Progress>(`/progress/${storyId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ==================== Subscriptions API ====================

export const subscriptionsApi = {
  /** 구독 플랜 목록 */
  getPlans: () => fetchApi<{ plans: SubscriptionPlan[] }>("/subscriptions/plans"),

  /** 내 구독 정보 */
  getMe: () => fetchApi<Subscription | null>("/subscriptions/me"),

  /** 구독 시작 */
  create: (data: { planType: string; billingKey: string }) =>
    fetchApi<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 구독 해지 */
  cancel: () =>
    fetchApi<void>("/subscriptions/me", {
      method: "DELETE",
    }),
};

// ==================== 통합 API 객체 ====================

const api = {
  users: usersApi,
  stories: storiesApi,
  progress: progressApi,
  subscriptions: subscriptionsApi,
  setAccessToken,
};

export default api;
