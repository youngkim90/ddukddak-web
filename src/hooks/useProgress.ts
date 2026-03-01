import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { progressApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { Progress } from "@/types/story";

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
    // 낙관적 업데이트: mutate() 호출 즉시 캐시 반영
    // → 뷰어 언마운트 후 상세 화면이 마운트될 때 최신 페이지 데이터 보장
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["progress", storyId] });
      const previous = queryClient.getQueryData<Progress | null>(["progress", storyId]);
      queryClient.setQueryData<Progress | null>(["progress", storyId], (old) =>
        old ? { ...old, ...data, lastReadAt: new Date().toISOString() } : old
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["progress", storyId], context.previous);
      }
    },
    onSuccess: () => {
      // 낙관적 업데이트로 캐시가 이미 정확함 → 즉시 refetch 없이 stale 마킹만
      // refetchType: 'none' → 다음 마운트/포커스 시점에 자연스럽게 재조회
      queryClient.invalidateQueries({ queryKey: ["progress"], refetchType: "none" });
      queryClient.invalidateQueries({ queryKey: ["progress", storyId], refetchType: "none" });
    },
  });
}
