"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants";
import type { TLastPageParamsState } from "@/types";
import { mergePersistedPageParams } from "@/utils/lastPageParams.util";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Each page's own params as last seen in its URL — a cache for navbar links, never a source of
 * truth: written only by useLastPageParamsSync, read only by useNavbarNavigation at click time.
 * Pages keep reading their state from the URL.
 */
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
