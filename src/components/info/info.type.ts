import type {
  TAnnotationLayout,
  TChartProjection,
  TFigureAnnotation,
  TInfoPage,
  TInfoSection,
} from "@/types";
import type { EInfoCardLayout } from "@/enums";
import type { useInfoNavigation } from "@/hooks/pages/useInfoNavigation";
import type { ComponentType, MouseEvent, ReactNode } from "react";

export type TInfoSectionProps = {
  /** one of INFO_SECTION_IDS */
  id: string;
  /** a paragraph under the title */
  intro?: ReactNode;
  children?: ReactNode;
};

export type TIconStep = {
  key: string;
  Icon: ComponentType;
};

export type TDataSource = {
  key: string;
  name: string;
  url: string;
  /** its citation or licence, as its authors give it: not translated */
  note: string;
};

export type TReference = {
  key: string;
  text: string;
  url?: string;
};

export type THowToCiteProps = {
  citation: string;
  bibtex: string;
};

export type TInfoNavTreeProps = {
  /** each with its sections, folded open under it while it's the open page */
  pages: readonly TInfoPage[];
  /** the page shown (aria-current) */
  currentRoute: string | null;
  /** the page highlighted, its sections open: the one being opened, else the current one */
  openRoute: string | null;
  /** the current page's section in view */
  activeId: string | null;
  getPageHref: (route: string) => string;
  onSectionClick: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  onPageClick: (event: MouseEvent<HTMLAnchorElement>, route: string) => void;
  /** finger-sized rows (the Contents sheet): 48 px pages, 44 px sections */
  hasLargeTargets: boolean;
};

export type TInfoSectionListProps = Pick<TInfoNavTreeProps, "activeId" | "onSectionClick"> & {
  sections: readonly TInfoSection[];
  /** the tree's section link size (REGULAR or LARGE) */
  linkSizeClass: string;
};

export type TInfoContentsBarProps = {
  pageLabel: string;
  sectionLabel: string | null;
  isOpen: boolean;
  onOpen: () => void;
};

/** The Info navigation's state (useInfoNavigation), shared by the side panel and the content. */
export type TInfoNavigation = ReturnType<typeof useInfoNavigation>;

export type TInfoNavigationProviderProps = {
  children: ReactNode;
};

export type TInfoLayoutProps = {
  /** the page, its footer last (InfoFooter): both stream in together */
  children: ReactNode;
};

/** One card of an InfoCardGrid. Every slot is optional but the title; they show in this order. */
export type TInfoCardItem = {
  key: string;
  /** a STACK card's icon, in a tinted square */
  icon?: ComponentType;
  /** a ROW card's number, in a badge */
  number?: string;
  /** a small uppercase line above the title */
  eyebrow?: string;
  title: string;
  /** a link on the title: a page of the app */
  titleHref?: string;
  /** beside the title, in code type */
  formula?: string;
  text?: ReactNode;
  /** content that doesn't fit the text slot (a list, several paragraphs), as given */
  body?: ReactNode;
  /** a citation or licence, in italics */
  note?: string;
  /** another site, at the bottom of the card */
  link?: { href: string; label: string };
  isHighlighted?: boolean;
};

export type TInfoCardColumns = 1 | 2 | 3;

export type TInfoCardGridProps = {
  items: readonly TInfoCardItem[];
  /** from lg; one column below */
  columns: TInfoCardColumns;
  /** an <ol>: the cards are steps */
  isOrdered?: boolean;
  layout?: EInfoCardLayout;
};

export type TInfoCardProps = {
  item: TInfoCardItem;
  layout: EInfoCardLayout;
};

/** One entry of an InfoList: its text, and optionally an icon before it or a link after it. */
export type TInfoListItem = {
  key: string;
  text: ReactNode;
  icon?: ComponentType;
  link?: { href: string; label: string };
};

export type TInfoListProps = {
  items: readonly TInfoListItem[];
  isNumbered?: boolean;
};

export type TInfoFigureProps = {
  /** the picture (hidden from screen readers by itself: the caption says all it shows) */
  visual: ReactNode;
  /** the numbered annotations: the n-th's marker and caption line both read n */
  annotations: readonly Pick<TFigureAnnotation, "key" | "captionKey">[];
  /** a last, unnumbered caption line */
  noteKey?: string;
};

export type TFigureChartLoadingProps = {
  children: ReactNode;
};

export type TInfoFigureMarkerProps = {
  number: number;
};

export type TFigureAnnotationsProps = {
  annotations: readonly TFigureAnnotation[];
  projection: TChartProjection;
  /** at the text scale (scaleAnnotationLayout) */
  layout: TAnnotationLayout;
};

export type TAnnotationNumberProps = {
  number: number;
  x: number;
  y: number;
  layout: TAnnotationLayout;
};
