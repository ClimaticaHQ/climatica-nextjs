"use client";

import type { TDatasetSelectionState } from "@/types";
import { create } from "zustand";

export const useDatasetSelectionStore = create<TDatasetSelectionState>()((set) => ({
  selections: {},
  remember: (scope, filters) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [scope]: { ...state.selections[scope], [filters.dataset]: filters },
      },
    })),
}));
