"use client";

import {
  DEFAULT_CITY,
  DEFAULT_COMPARE_CITY_A,
  DEFAULT_COMPARE_CITY_B,
  DEFAULT_HEATMAP_BBOX,
  LOCAL_STORAGE_KEYS,
} from "@/constants";
import type { TBbox } from "@/types";
import { createPersistedJsonStore, isBboxOrNull, isCity } from "@/utils/persistedJsonStore.util";

// * one store per persisted location, shared by every component that reads it — a city picked
// * or restored from the URL anywhere shows everywhere (titles, search bars, sidebar)

export const selectedCityStore = createPersistedJsonStore({
  key: LOCAL_STORAGE_KEYS.LAST_SELECTED_CITY,
  defaultValue: DEFAULT_CITY,
  isValue: isCity,
});

export const compareCityAStore = createPersistedJsonStore({
  key: LOCAL_STORAGE_KEYS.COMPARE_CITY_A,
  defaultValue: DEFAULT_COMPARE_CITY_A,
  isValue: isCity,
});

export const compareCityBStore = createPersistedJsonStore({
  key: LOCAL_STORAGE_KEYS.COMPARE_CITY_B,
  defaultValue: DEFAULT_COMPARE_CITY_B,
  isValue: isCity,
});

export const heatmapBboxStore = createPersistedJsonStore<TBbox | null>({
  key: LOCAL_STORAGE_KEYS.HEATMAP_BBOX,
  defaultValue: DEFAULT_HEATMAP_BBOX,
  isValue: isBboxOrNull,
});
