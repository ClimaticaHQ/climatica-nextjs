/** One section of an Info page: its anchor and its title (also its navigation link). */
export type TInfoSection = {
  id: string;
  labelKey: string;
  /** false: hidden, with its link — a section whose content isn't configured yet */
  isShown: boolean;
};

export type TInfoPage = {
  route: string;
  labelKey: string;
  sections: readonly TInfoSection[];
};
