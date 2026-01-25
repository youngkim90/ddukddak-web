"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

// 전체 진행률 조회
export function useAllProgress() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["progress"],
    queryFn: () => progressApi.getAll(),
    enabled: !!user,
  });
}

// 특정 동화 진행률 조회
export function useProgress(storyId: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["progress", storyId],
    queryFn: () => progressApi.getByStoryId(storyId),
    enabled: !!user && !!storyId,
  });
}

// 진행률 저장
export function useSaveProgress(storyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { currentPage: number; isCompleted: boolean }) =>
      progressApi.save(storyId, data),
    onSuccess: () => {
      // 진행률 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["progress", storyId] });
    },
  });
}
