"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  actions: {
    setUserInfoAndToken: (user: User, token: string) => void;
    clearUserInfoAndToken: () => void;
  };
}

export const userStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      actions: {
        setUserInfoAndToken: (user, token) => set({ user, token }),
        clearUserInfoAndToken: () => set({ user: null, token: null }),
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
