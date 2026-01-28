import { useQuery } from "@tanstack/react-query";
import { storiesApi, type StoriesQueryParams } from "@/lib/api";

// 동화 목록 조회
export function useStories(params?: StoriesQueryParams) {
  return useQuery({
    queryKey: ["stories", params],
    queryFn: () => storiesApi.getList(params),
  });
}

// 동화 상세 조회
export function useStory(id: string) {
  return useQuery({
    queryKey: ["story", id],
    queryFn: () => storiesApi.getById(id),
    enabled: !!id,
  });
}

// 동화 페이지 조회 (뷰어용)
export function useStoryPages(id: string) {
  return useQuery({
    queryKey: ["storyPages", id],
    queryFn: () => storiesApi.getPages(id),
    enabled: !!id,
  });
}

// 카테고리별 동화 목록 (홈 화면용)
export function useStoriesByCategory(category: string, limit = 5) {
  return useQuery({
    queryKey: ["stories", "category", category, limit],
    queryFn: () => storiesApi.getList({ category, limit }),
  });
}
