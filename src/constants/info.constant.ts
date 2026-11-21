import type { TInfoPage, TInfoSection } from "@/types";
import { PROJECT_INFO } from "./project.constant";
import { CLIMATE_PERIOD_LABELS, CLIMATE_PERIODS } from "./worldclim.constant";
import { ROUTES } from "./route.constant";
import { TEAM } from "./team.constant";
import { TIME } from "./time.constant";

// * every Info section's anchor: its element id and its navigation link's hash
export const INFO_SECTION_IDS = {
  HOW_IT_WORKS: "how-it-works",
  DATA_SOURCES: "data-sources",
  TEAM: "team",
  SOURCE_CODE: "source-code",
  CITE: "cite",
  PRIVACY: "privacy",
  FIND_PLACE: "find-a-place",
  WALTER_LIETH: "walter-lieth",
  COMPARE: "compare",
  FILTERS: "filters",
  EXPORT: "export-and-share",
  QUESTIONS: "questions",
  CELL_VALUES: "cell-values",
  RESOLUTIONS: "resolutions",
  PERIODS: "periods-and-variables",
  INDICATORS: "indicators",
  REFERENCES: "references",
} as const;

// * the Info pages in the sidebar's order, each with its sections in reading order
export const INFO_PAGES: readonly TInfoPage[] = [
  {
    route: ROUTES.ABOUT,
    labelKey: "info.nav.about",
    sections: [
      { id: INFO_SECTION_IDS.HOW_IT_WORKS, labelKey: "info.sections.howItWorks", isShown: true },
      { id: INFO_SECTION_IDS.DATA_SOURCES, labelKey: "info.sections.dataSources", isShown: true },
      {
        id: INFO_SECTION_IDS.TEAM,
        labelKey: "info.sections.team",
        isShown: TEAM.length > 0,
      },
      { id: INFO_SECTION_IDS.SOURCE_CODE, labelKey: "info.sections.sourceCode", isShown: true },
      {
        id: INFO_SECTION_IDS.CITE,
        labelKey: "info.sections.cite",
        isShown: PROJECT_INFO.citation !== "",
      },
      { id: INFO_SECTION_IDS.PRIVACY, labelKey: "info.sections.privacy", isShown: true },
    ],
  },
  {
    route: ROUTES.ABOUT_GUIDE,
    labelKey: "info.nav.guide",
    sections: [
      { id: INFO_SECTION_IDS.FIND_PLACE, labelKey: "info.sections.findPlace", isShown: true },
      { id: INFO_SECTION_IDS.WALTER_LIETH, labelKey: "info.sections.walterLieth", isShown: true },
      { id: INFO_SECTION_IDS.COMPARE, labelKey: "info.sections.compare", isShown: true },
      { id: INFO_SECTION_IDS.FILTERS, labelKey: "info.sections.filters", isShown: true },
      { id: INFO_SECTION_IDS.EXPORT, labelKey: "info.sections.export", isShown: true },
      { id: INFO_SECTION_IDS.QUESTIONS, labelKey: "info.sections.questions", isShown: true },
    ],
  },
  {
    route: ROUTES.ABOUT_DATA,
    labelKey: "info.nav.data",
    sections: [
      { id: INFO_SECTION_IDS.CELL_VALUES, labelKey: "info.sections.cellValues", isShown: true },
      { id: INFO_SECTION_IDS.RESOLUTIONS, labelKey: "info.sections.resolutions", isShown: true },
      { id: INFO_SECTION_IDS.PERIODS, labelKey: "info.sections.periods", isShown: true },
      { id: INFO_SECTION_IDS.INDICATORS, labelKey: "info.sections.indicators", isShown: true },
      { id: INFO_SECTION_IDS.REFERENCES, labelKey: "info.sections.references", isShown: true },
    ],
  },
];

// * a page's sections by id, for its view
export const INFO_SECTIONS: Readonly<Record<string, TInfoSection>> = Object.fromEntries(
  INFO_PAGES.flatMap(({ sections }) => sections.map((entry) => [entry.id, entry])),
);

// * the resolution selector's "What do resolutions mean?" link
export const RESOLUTIONS_HELP_HREF = `${ROUTES.ABOUT_DATA}#${INFO_SECTION_IDS.RESOLUTIONS}`;

// * km per degree of longitude at the equator (WGS 84): a grid cell's side there
export const EQUATOR_KM_PER_DEGREE = 111.32;

// * a grid's resolution: in arc-seconds below a minute, else in arc-minutes
export const ARC_UNITS = {
  SECONDS_PER_DEGREE: 3600,
  SECONDS_PER_MINUTE: 60,
  MINUTE_SYMBOL: "′",
  SECOND_SYMBOL: "″",
} as const;

// * how long a copy button says "Copied" (or that copying failed)
export const COPY_FEEDBACK_MS = TIME.IN_MILLISECONDS.SECOND * 2;

// * the Info navigation's scroll spy (useActiveSection): a section is current once its top
// * crosses a line this share down <main>, under the sections' scroll margin
export const SCROLL_SPY = {
  LINE_PERCENT: 30,
  // * px from the bottom that count as scrolled to the end: the last section is then current
  END_TOLERANCE_PX: 4,
  // * the user scrolling (wheel, touch, keys, the scrollbar) ends the hold on a clicked section
  USER_SCROLL_EVENTS: ["wheel", "touchmove", "keydown", "pointerdown"],
} as const;

// * where the Info figures' data come from (their fixture is in components/info)
export const FIGURE_PLACE = {
  NAME: "Soria",
  PERIOD: CLIMATE_PERIOD_LABELS[CLIMATE_PERIODS.C1970_2000],
  GRID_KEY: "2_5m",
} as const;
