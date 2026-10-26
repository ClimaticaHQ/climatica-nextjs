/** A persisted city a page reads: picking one can sync the others (settings: syncCity). */
export enum ECitySlot {
  /** City Climate and Compare Periods */
  CITY = "city",
  /** Compare Cities' first city */
  COMPARISON_A = "comparisonA",
  /** Compare Cities' second city — never synced */
  COMPARISON_B = "comparisonB",
  /** the heat map's search: moves the map, persists nothing of its own */
  MAP = "map",
}
