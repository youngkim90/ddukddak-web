import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, Subscription } from "@/types/story";

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setInitialized: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      subscription: null,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setSubscription: (subscription) => set({ subscription }),
      setInitialized: (value) => set({ isInitialized: value }),
      reset: () => set({ user: null, subscription: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, subscription: state.subscription }),
    }
  )
);

// Computed helpers
export const useIsSubscribed = () => {
  const subscription = useAuthStore((s) => s.subscription);
  return subscription?.status === "active";
};

export const useIsLoggedIn = () => {
  const user = useAuthStore((s) => s.user);
  return user !== null;
};
