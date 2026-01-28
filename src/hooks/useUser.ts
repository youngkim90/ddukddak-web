import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

// 프로필 수정
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: { nickname?: string; avatarUrl?: string }) =>
      usersApi.updateMe(data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setUser(user);
    },
  });
}

// 회원 탈퇴
export function useDeleteAccount() {
  const reset = useAuthStore((s) => s.reset);

  return useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: () => {
      reset();
    },
  });
}
