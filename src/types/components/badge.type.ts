/** A badge's colours, as semantic tokens ("var(--color-…)"): one tint set's three roles. */
export type TBadgeTone = {
  bg: string;
  border: string;
  text: string;
};

/** A listed series' badge colours: its tint set and its dot. */
export type TSeriesTint = TBadgeTone & {
  dot: string;
};
