"use client";

import type { TDatasetSelectionState } from "@/types";
import { create } from "zustand";

/**
 * The selection of the dataset the reader left (its periods or years, a Climate-only variable or
 * resolution), which the URL no longer carries — per scope (every page, or one page: the
 * syncFilters setting), for the session only, never persisted. Written by useFilterNavigation on
 * a dataset switch, read by useFiltersDraft when the reader switches back.
 */
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
