"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants";
import type { TLastPageParamsState } from "@/types";
import { mergePersistedPageParams } from "@/utils/lastPageParams.util";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** a cache for navbar links, never a source of truth */
export const useLastPageParamsStore = create<TLastPageParamsState>()(
  persist(
    (set) => ({
      pages: {},
      setPageParams: (route, query) =>
        set((state) =>
          state.pages[route] === query ? state : { pages: { ...state.pages, [route]: query } },
        ),
    }),
    {
      name: LOCAL_STORAGE_KEYS.LAST_PAGE_PARAMS,
      partialize: ({ pages }) => ({ pages }),
      merge: mergePersistedPageParams,
    },
  ),
);
