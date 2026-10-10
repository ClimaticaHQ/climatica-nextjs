export type TBuildDocumentTitleArgs = {
  /** the page's own name — the title until every place is known */
  pageTitle: string;
  /** the city, or the compared cities */
  places: readonly string[];
  /** what follows the places (variable and period); null: nothing */
  details: string | null;
};
