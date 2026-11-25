import { CHART_TRANSITION_MOTION } from "@/components/ChartTransition/ChartTransition.constant";
import { EXTERNAL_LINK_CLASS, EXTERNAL_LINK_TARGET_CLASS } from "@/components/UI/ExternalLink";
import { AreaChartIcon, CodeIcon, DatabaseIcon } from "@/components/svg";
import { OverlayLayoutIcon, SplitLayoutIcon } from "@/components/svg";
import {
  CELL_SIZES,
  CELLS_PER_DEGREE,
  CLIMATE_PERIODS,
  FOCUS_RING_CLASS,
  MARTONNE_TEMP_OFFSET,
  ROUTES,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_FROST,
} from "@/constants";
import { ECopyStatus } from "@/enums";
import type { TAnnotationLayout, TBadgeTone } from "@/types";
import type { TDataSource, TIconStep, TInfoCardColumns, TReference } from "./info.type";

export const HOW_IT_WORKS_STEPS: readonly TIconStep[] = [
  { key: "archive", Icon: DatabaseIcon },
  { key: "scrapi", Icon: CodeIcon },
  { key: "climatica", Icon: AreaChartIcon },
];

const CRU_TS_VERSION = "4.09";

export const DATA_SOURCES: readonly TDataSource[] = [
  {
    key: "worldclim",
    name: "WorldClim 2.1",
    url: "https://www.worldclim.org",
    note: "Fick, S. E. & Hijmans, R. J. (2017). WorldClim 2: new 1-km spatial resolution climate surfaces for global land areas. International Journal of Climatology, 37(12), 4302–4315.",
  },
  {
    key: "cruTs",
    name: `CRU TS ${CRU_TS_VERSION}`,
    url: "https://crudata.uea.ac.uk/cru/data/hrg/",
    note: "Harris, I., Osborn, T. J., Jones, P. & Lister, D. (2020). Version 4 of the CRU TS monthly high-resolution gridded multivariate climate dataset. Scientific Data, 7, 109.",
  },
  {
    key: "geonames",
    name: "GeoNames",
    url: "https://www.geonames.org",
    note: "CC BY 4.0",
  },
  {
    key: "osm",
    name: "OpenStreetMap",
    url: "https://www.openstreetmap.org/copyright",
    note: "© OpenStreetMap contributors, ODbL",
  },
];

export const TECH_STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "TanStack Query",
  "Recharts",
  "Leaflet",
  "next-intl",
  "Redis",
  "Apache Solr",
] as const;

export const FIND_PLACE_WAYS = ["name", "coordinates", "map", "location"] as const;

export const GUIDE_QUESTIONS = ["resolution", "elevation", "thirtySeconds"] as const;

export const EXPORT_FORMAT_KEYS = ["png", "svg", "csv", "rawCsv", "rawJson"] as const;

// * checked against the API on 2026-11-02; the valley floor's elevation is approximate, for the text
export const BOLZANO_EXAMPLE = {
  PERIOD: CLIMATE_PERIODS.C1970_2000,
  VALLEY_ELEVATION: 260,
  COARSE: { grid: CELL_SIZES.TWO_POINT_FIVE_MINUTES, elevation: 638, temperature: 10.2 },
  FINE: { grid: CELL_SIZES.THIRTY_SECONDS, elevation: 252, temperature: 11.7 },
} as const;

export const REFERENCES: readonly TReference[] = [
  {
    key: "fick",
    text: "Fick, S. E. & Hijmans, R. J. (2017). WorldClim 2: new 1-km spatial resolution climate surfaces for global land areas. International Journal of Climatology, 37(12), 4302–4315.",
    url: "https://doi.org/10.1002/joc.5086",
  },
  {
    key: "harris",
    text: "Harris, I., Osborn, T. J., Jones, P. & Lister, D. (2020). Version 4 of the CRU TS monthly high-resolution gridded multivariate climate dataset. Scientific Data, 7, 109.",
    url: "https://doi.org/10.1038/s41597-020-0453-3",
  },
  {
    key: "walter",
    text: "Walter, H. & Lieth, H. (1960–1967). Klimadiagramm-Weltatlas. Jena: VEB Gustav Fischer Verlag.",
    title: "Klimadiagramm-Weltatlas",
  },
  {
    key: "martonne",
    text: "de Martonne, E. (1926). Une nouvelle fonction climatologique : l'indice d'aridité. La Météorologie, 2, 449–458.",
    title: "Une nouvelle fonction climatologique : l'indice d'aridité",
  },
];

const BODY = "lg:text-[length:var(--font-reading-body)]";
const CARD_TEXT = "text-[length:var(--font-touch-secondary)] lg:text-[length:var(--font-sm)]";
const EMPHASIS = "font-medium text-[var(--color-text)]";
const LABEL_TEXT = "text-[length:var(--font-xs)] lg:text-[length:var(--font-base)]";
const PROSE = "max-w-[var(--reading-measure)]";

const CARD_TITLE =
  "text-[length:var(--font-touch-title)] font-semibold text-[var(--color-text)] lg:text-[length:var(--font-reading-card-title)]";

export const INFO_CLASSES = {
  CONTENT: "flex min-w-0 max-w-[var(--reading-measure)] flex-col gap-12 lg:max-w-none",
  COLUMN: "flex w-full flex-col gap-14 lg:mx-auto lg:max-w-[var(--info-column-width)] lg:gap-20",
  // * below lg the sticky Contents bar covers the top: an anchor lands under it
  SECTION: "flex scroll-mt-20 flex-col gap-4 lg:scroll-mt-6",
  HEADING:
    "text-[length:var(--font-lg)] font-semibold text-[var(--color-text)] lg:text-[length:var(--font-reading-heading)] lg:leading-tight",
  SUBHEADING: CARD_TITLE,
  TEXT: `${PROSE} text-[var(--color-text-secondary)] ${BODY}`,
  LEAD: `${PROSE} text-left text-[length:var(--font-reading-body)] text-[var(--color-text-secondary)] lg:text-[length:var(--font-reading-lead)]`,
  SMALL: `${PROSE} ${CARD_TEXT} text-[var(--color-text-secondary)]`,
  LINK: `${EXTERNAL_LINK_CLASS} ${EXTERNAL_LINK_TARGET_CLASS}`,
  ROW_LINK: `${EXTERNAL_LINK_CLASS} ${BODY}`,
  CARD_LINK: `${EXTERNAL_LINK_CLASS} ${CARD_TEXT}`,
  GRID_4: "grid grid-cols-2 gap-3 lg:grid-cols-4",
  CELL_LAYOUT: "grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:gap-12",
  CELL_TEXT: "flex flex-col gap-3",
  CELL_FIGURE: "mx-auto flex w-full max-w-[17rem] flex-col gap-2",
  CELL_CAPTION: "text-center",
  PROSE,
  INTRO: "flex flex-col gap-6",
  PERIOD_LABEL: `tabular-nums ${EMPHASIS}`,
  STACK_SMALL: "flex flex-col gap-2",
  DEFINITIONS: "flex flex-wrap gap-x-8 gap-y-2",
  DEFINITION: "flex gap-2",
  DEFINITION_VALUE: EMPHASIS,
  ICON: "flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] [&_svg]:size-4",
  STEP_LABEL: `${LABEL_TEXT} font-semibold uppercase tracking-widest text-[var(--color-primary)]`,
  NUMBER:
    "flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[length:var(--font-xs)] font-semibold text-[var(--color-on-primary)]",
  CHIPS: "flex flex-wrap gap-2",
  CODE: `overflow-x-auto whitespace-pre-wrap break-words font-mono ${LABEL_TEXT} text-[var(--color-text)]`,
  FORMULA: `inline-block rounded-[var(--radius-xs)] bg-[var(--color-surface-secondary)] px-2 py-0.5 font-mono ${LABEL_TEXT} text-[var(--color-text)]`,
  LIST: `${PROSE} flex list-disc flex-col gap-1.5 pl-5 text-[var(--color-text-secondary)] ${BODY}`,
  LIST_SMALL: `${PROSE} flex list-disc flex-col gap-1 pl-5 ${CARD_TEXT} text-[var(--color-text-secondary)]`,
  NUMBERED_LIST: `${PROSE} flex list-decimal flex-col gap-1.5 pl-5 text-[var(--color-text-secondary)] ${BODY}`,
  ACTIONS: "flex flex-wrap items-center gap-x-6 gap-y-3",
  BUTTON: "inline-flex min-h-10 items-center px-4",
  HERO_ACTIONS: "flex flex-col gap-3 lg:flex-row lg:items-center",
  HERO_BUTTON: "inline-flex min-h-target w-full items-center justify-center px-4 lg:w-auto",
  TABLE_SCROLL: "overflow-x-auto",
  TABLE:
    "w-full min-w-[30rem] border-collapse text-left text-[length:var(--font-base)] lg:text-[length:var(--font-sm)]",
  TH: "border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-2.5 font-semibold text-[var(--color-text)]",
  TD: "border-b border-[var(--color-border)] px-4 py-2.5 text-[var(--color-text-secondary)] [tr:last-child_&]:border-b-0",
  NUMERIC: "tabular-nums",
  FOOTER:
    "mt-8 border-t border-[var(--color-border)] pt-8 text-center text-[length:var(--font-touch-secondary)] text-[var(--color-text-secondary)] lg:mt-0 lg:pt-6 lg:text-left lg:text-[length:var(--font-sm)]",
  FOOTER_PART: "block lg:inline lg:whitespace-nowrap",
  FOOTER_SEPARATOR: "hidden lg:inline",
  FOOTER_COOKIE_SETTINGS: "mt-2 inline-block",
} as const;

export const INFO_NAV_CLASSES = {
  PAGES_FRAME: "relative",
  PAGES: "flex flex-col gap-1",
  PAGE_PILL:
    "pointer-events-none absolute top-0 left-0 rounded-[var(--radius-sm)] bg-[var(--color-primary-muted)]",
  PAGE_PILL_MOTION: "accordion-indicator",
  PAGE_LINK: `${FOCUS_RING_CLASS} accordion-indicator-text relative flex items-center rounded-[var(--radius-sm)] px-3 font-medium`,
  PAGE_LINK_ACTIVE: "text-[var(--color-primary)]",
  // * the highlight in the server's HTML, until the pill is measured and takes over
  PAGE_LINK_ACTIVE_STATIC: "bg-[var(--color-primary-muted)]",
  PAGE_LINK_IDLE:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]",
  SECTIONS: "flex flex-col border-l-2 border-[var(--color-border)]",
  // * padding, not margin, so its fold's full height is its content's (getFoldedRect)
  SECTIONS_FRAME: "relative ml-3 py-1",
  // * -ml-0.5: the link's own 2px rule lies over the list's, so the marker replaces it
  SECTION_LINK: `${FOCUS_RING_CLASS} -ml-0.5 flex items-center border-l-2 pl-3 transition-colors duration-150`,
  SECTION_LINK_ACTIVE: "font-medium text-[var(--color-primary)]",
  // * the marker in the server's HTML, until the bar is measured and takes over
  SECTION_LINK_ACTIVE_STATIC: "border-[var(--color-primary)]",
  SECTION_LINK_ACTIVE_BARRED: "border-transparent",
  SECTION_BAR: "pointer-events-none absolute left-0 top-0 w-0.5 bg-[var(--color-primary)]",
  SECTION_BAR_MOTION: "section-indicator",
  SECTION_LINK_IDLE:
    "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
  REGULAR: {
    PAGE_LINK: "py-2 text-[length:var(--font-reading-body)]",
    SECTION_LINK: "py-1.5 text-[length:var(--font-sm)]",
  },
  LARGE: {
    PAGE_LINK: "min-h-[max(3rem,44px)] text-[length:var(--font-touch-nav-page)]",
    SECTION_LINK: "min-h-target text-[length:var(--font-touch-nav)]",
  },
} as const;

export const INFO_CONTENTS_BAR_CLASSES = {
  ROOT: "sticky top-0 z-20 flex min-h-13 items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[length:var(--font-touch-nav)] sm:px-10 lg:hidden",
  TRAIL: "flex min-w-0 flex-1 items-center gap-1.5",
  PAGE: "min-w-[1.25em] shrink-[100] truncate text-[var(--color-text-secondary)]",
  SEPARATOR:
    "flex size-4 shrink-0 -rotate-90 items-center justify-center text-[var(--color-text-secondary)] [&_svg]:size-4",
  SECTION: "min-w-0 font-medium leading-tight text-[var(--color-text)]",
  BUTTON: `${FOCUS_RING_CLASS} -mr-2 flex min-h-target shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-secondary)]`,
} as const;

export const NESTED_CELLS_FINE_PER_COARSE =
  CELLS_PER_DEGREE[BOLZANO_EXAMPLE.FINE.grid] / CELLS_PER_DEGREE[BOLZANO_EXAMPLE.COARSE.grid];

export const TECH_BADGE_TONE: TBadgeTone = {
  bg: "var(--color-surface-secondary)",
  border: "var(--color-border)",
  text: "var(--color-text)",
};

export const COPY_FEEDBACK_KEYS = {
  [ECopyStatus.IDLE]: null,
  [ECopyStatus.COPIED]: "info.about.cite.copied",
  [ECopyStatus.FAILED]: "info.about.cite.failed",
} as const;

export const PRIVACY_POINTS = [
  "account",
  "storage",
  "location",
  "analytics",
  "analyticsData",
  "analyticsChoice",
] as const;

export const COMPARE_PAGES = [
  { key: "cities", route: ROUTES.COMPARE_CITIES, titleKey: "pages.compareCities.title" },
  { key: "periods", route: ROUTES.COMPARE_PERIODS, titleKey: "pages.comparePeriods.title" },
] as const;

export const COMPARE_LAYOUTS = [
  { key: "split", Icon: SplitLayoutIcon },
  { key: "overlay", Icon: OverlayLayoutIcon },
] as const;

// * as the code computes them (isAridMonth, getFrostMonths, getAnnualSummary)
export const CLIMATE_INDICATORS = [
  { key: "arid", formula: `P < ${WALTER_LIETH_DIAGRAM.LINEAR_RATIO}T` },
  { key: "frost", formula: `Tmin < ${WALTER_LIETH_FROST.THRESHOLD} °C` },
  { key: "martonne", formula: `M = P / (T + ${MARTONNE_TEMP_OFFSET})` },
] as const;

export const TEAM_CARD_CLASSES = {
  GRID: "grid gap-3 lg:grid-cols-2 xl:grid-cols-[repeat(auto-fill,minmax(max(min(18rem,calc((100%_-_0.75rem)/2)),calc((100%_-_1.5rem)/3)),1fr))]",
  ITEM: "flex",
  CARD: "flex w-full items-start gap-3",
  AVATAR:
    "flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-muted)] font-semibold text-[var(--color-primary)]",
  TEXT: "flex min-w-0 flex-col gap-0.5",
  NAME: `${FOCUS_RING_CLASS} ${CARD_TITLE} mt-[max(0px,calc((2.75rem-1lh)/2))] self-start rounded-[var(--radius-xs)] underline-offset-2 hover:underline focus-visible:underline`,
  NAME_ICON: "ml-1 inline-block size-3.5 align-[-0.125em] text-[var(--color-text-secondary)]",
  DETAIL:
    "text-[length:var(--font-xs)] text-[var(--color-text-secondary)] lg:text-[length:var(--font-sm)]",
  AFFILIATION_PART: "inline-block max-w-full",
} as const;

export const INFO_CARD_GRID_COLUMNS: Record<TInfoCardColumns, string> = {
  1: "grid gap-3",
  2: "grid gap-3 lg:grid-cols-2",
  3: "grid gap-3 lg:grid-cols-3",
};

export const INFO_CARD_CLASSES = {
  STACK: "flex h-full flex-col gap-2",
  ROW: "flex h-full gap-3",
  ROW_TEXT: "flex flex-col gap-1",
  TITLE_ROW: "flex flex-wrap items-center gap-x-3 gap-y-1",
  NOTE_ITALIC: "italic",
  LINK: "mt-auto self-start",
} as const;

export const INFO_LIST_CLASSES = {
  ICONS: `${PROSE} flex flex-col gap-2`,
  ICON_ITEM: "flex items-start gap-3",
} as const;

export const ANNOTATION_LAYOUT: TAnnotationLayout = {
  topBand: 36,
  bottomBand: 28,
  numberRadius: 10,
  numberFontSize: 14,
  numberGap: 4,
  bracketTick: 5,
};

export const ANNOTATION_STYLE = {
  STROKE: "var(--color-text-secondary)",
  STROKE_WIDTH: 1,
  LEADER_DASH: "3 3",
  RING_RADIUS: 4,
  NUMBER_FILL: "var(--color-primary)",
  NUMBER_TEXT: "var(--color-on-primary)",
  NUMBER_RING: "var(--color-surface)",
  NUMBER_RING_WIDTH: 2,
  NUMBER_FONT_WEIGHT: 600,
} as const;

export const FIGURE_PICTURE_CLASS = CHART_TRANSITION_MOTION.CROSSFADE.ENTER;

export const INFO_FIGURE_CLASSES = {
  ROOT: "flex flex-col gap-3",
  VISUAL: "min-w-0",
  CAPTION: `${PROSE} flex flex-col gap-2 text-[length:var(--font-touch-secondary)] text-[var(--color-text-secondary)] lg:text-[length:var(--font-reading-body)]`,
  ITEMS: "flex flex-col gap-2",
  ITEM: "flex items-start gap-2.5",
  MARKER:
    "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[length:var(--font-base)] font-semibold leading-none text-[var(--color-on-primary)] ring-2 ring-[var(--color-surface)]",
} as const;
