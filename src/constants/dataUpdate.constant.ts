// * which data a page's update feedback follows — its motion settings are in motion.constant.ts

// * the single-city page's one series — no split panel or monthly table shares this key, so
// * there only the chart card flashes
export const DATA_UPDATE_SINGLE_SERIES = "single";

// * joins a comparison's two names in the update announcement: "Valladolid, Lviv"
export const DATA_UPDATE_NAMES_SEPARATOR = ", ";

// * the heat map's one series: the selected region's stats
export const DATA_UPDATE_REGION_SERIES = "region";

// * a card listening to every series (the chart card outside the split layout)
export const DATA_UPDATE_ALL_SERIES = "all";

export const NO_DATA_UPDATE = { id: 0, changed: [] } as const;

// * a card that never flashes (the default, and the chart card around split panels)
export const NO_FLASH_KEYS: readonly string[] = [];
